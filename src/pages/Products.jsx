import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Pagination, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, Switch, FormControl, InputLabel, FormControlLabel, Radio, RadioGroup, Select, MenuItem, FormLabel } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [openDialog, setOpenDialog] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        company_name: '',
        image_base64: '',
        mrp: '',
        ptr: '',
        selling_price: '',
        category: '',
        stock: '',
        product_details: '',
        salts: '',
        offer: ''
    });
    const [categoryToggle, setCategoryToggle] = useState(true); // false for General, true for Pharma
    const [statusToggle, setStatusToggle] = useState(true); // false for inactive, true for active
    const [companyNames, setCompanyNames] = useState([]);
    const [value, setValue] = useState('selling_price');
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = parseInt(params.get('page'), 10);
        if (!isNaN(page)) {
            setCurrentPage(page);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('https://namami-infotech.com/EvaraBackend/src/sku/list_sku.php', {
                    params: { alpha: searchTerm }
                });
                if (response.data.message === 'Medicines data fetched successfully') {
                    setProducts(response.data.medicines);
                    const companies = [...new Set(response.data.medicines.map((product) => product.company_name))];
                    setCompanyNames(companies); // Set company names
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [searchTerm]);

    useEffect(() => {
        const filterAndPaginateProducts = () => {
            let filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.company_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            filtered = filtered.filter(product =>
                statusToggle ? product.status === 1 : product.status === 0
            );
            filtered = filtered.filter(product =>
                categoryToggle ? product.category === "Pharma" : product.category === "General"
            );
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginated = filtered.slice(startIndex, endIndex);

            setFilteredProducts(paginated);
        };

        filterAndPaginateProducts();
    }, [searchTerm, products, currentPage, statusToggle, categoryToggle]);

    const handlePageChange = (event, pageNumber) => {
        setCurrentPage(pageNumber);
        navigate(`?page=${pageNumber}`);
    };

    const handleViewProduct = (medicine_id) => {
        navigate(`/product/${medicine_id}?page=${currentPage}`);
    };

    const totalProducts = products.length;
    const uniqueCompanies = [...new Set(products.map(product => product.company_name))].length;
    const totalPages = Math.ceil(products.length / itemsPerPage);
const totalFilteredProducts = products.filter(product =>
    statusToggle ? product.status === 1 : product.status === 0
).filter(product =>
    categoryToggle ? product.category === "Pharma" : product.category === "General"
).length;
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e) => {
        setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewProduct({ ...newProduct, image_base64: reader.result.split(',')[1] });
        };
        reader.readAsDataURL(file);
    };

    const handleRadioChange = (event) => {
        setValue(event.target.value);
        if (event.target.value === 'selling_price') {
            setNewProduct(prev => ({ ...prev, ptr: '', offer: '' }));
        } else {
            setNewProduct(prev => ({ ...prev, selling_price: '' }));
        }
    };

    const handleSubmitNewProduct = async () => {
        if (!newProduct.selling_price && !newProduct.ptr) {
            alert('Either Selling Price or PTR must be provided.');
            return;
        }
        if (newProduct.ptr && !newProduct.offer) {
            alert('Offer is mandatory if PTR is provided.');
            return;
        }

        try {
            const dataToSend = {
                name: newProduct.name,
                company_name: newProduct.company_name,
                mrp: newProduct.mrp,
                selling_price: newProduct.selling_price,
                ptr: newProduct.ptr,
                offer: newProduct.offer,
                category: newProduct.category,
                product_details: newProduct.product_details,
                salts: newProduct.salts,
                image_base64: newProduct.image_base64
            };

            const response = await axios.post('https://namami-infotech.com/EvaraBackend/src/sku/add_sku.php', dataToSend);
            if (response.data.message === 'Medicine added successfully') {
                setProducts([...products, { ...newProduct, medicine_id: response.data.medicine_id }]);
                setOpenDialog(false);
                setNewProduct({
                    name: '',
                    company_name: '',
                    image_base64: '',
                    mrp: '',
                    ptr: '',
                    selling_price: '',
                    category: '',
                    stock: '',
                    product_details: '',
                    salts: '',
                    offer: ''
                });
            }
        } catch (error) {
            console.error('Error submitting new product:', error);
        }
    };

   const exportToCSV = async () => {
    try {
        // Filter products based on current filters
        const filteredProducts = products.filter(product =>
            statusToggle ? product.status === 1 : product.status === 0
        ).filter(product =>
            categoryToggle ? product.category === "Pharma" : product.category === "General"
        );

        if (filteredProducts.length === 0) {
            console.error('No products to export with the current filters');
            return;
        }

        const csvData = filteredProducts.map(product => ({
            medicine_id: product.medicine_id,
            name: product.name,
            company_name: product.company_name,
            mrp: product.mrp,
            ptr: product.ptr || 'N/A',
            selling_price: product.selling_price || 'N/A',
            offer: product.offer || 'No Offer Available',
            category: product.category || 'General'
        }));

        const csvContent = [
            ['Medicine ID', 'Name', 'Company Name', 'MRP', 'PTR/SP', 'Offer', 'Category'],
            ...csvData.map(item => [
                item.medicine_id,
                item.name,
                item.company_name,
                item.mrp,
                item.ptr !== 'N/A' ? item.ptr : item.selling_price,
                item.offer,
                item.category
            ]),
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'products_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting data to CSV', error);
    }
};


    return (
        <Container>
             <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                <Typography variant="h4" gutterBottom style={{ color: "orange", fontSize: "30px" }}>Products</Typography>
                <Typography>
    Total Products: {totalFilteredProducts} | Total Companies: {uniqueCompanies}
                </Typography>
                <FormControlLabel
                    control={<Switch checked={categoryToggle} onChange={() => setCategoryToggle(!categoryToggle)} />}
                    label={`Category: ${categoryToggle ? 'Pharma' : 'General'}`}
                />
                <FormControlLabel
                    control={<Switch checked={statusToggle} onChange={() => setStatusToggle(!statusToggle)} />}
                    label={`Status: ${statusToggle ? 'Active' : 'Inactive'}`}
                />
                <div style={{ display: "flex", gap: "20px" }}>
                    <TextField
                        label="Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '30px', maxHeight: "40px", width: "300px" } }}
                    />
                    <i className='bx bxs-add-to-queue' onClick={handleOpenDialog} style={{ fontSize: "40px", color: "orange", cursor: "pointer" }}></i>
                    <i className='bx bx-download' onClick={exportToCSV} style={{ fontSize: "40px", color: "orange", cursor: "pointer" }}></i>
                </div>
            </div>
           
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                                                        <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Id</TableCell>

                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Name</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Company</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>MRP</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>PTR</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>SP</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Offer</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Category</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.medicine_id}>
                                 <TableCell>{product.medicine_id}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.company_name}</TableCell>
                                <TableCell>{product.mrp}</TableCell>
                                <TableCell>{product.ptr}</TableCell>
                                <TableCell>{product.selling_price}</TableCell>
                                <TableCell>{product.offer}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>
                                    <Button
                                        component={Link}
                                        to={`/product/${product.medicine_id}?page=${currentPage}`}
                                        variant="contained"
                                        color="primary"
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box display="flex" justifyContent="center" marginTop={2}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                />
            </Box>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Product Name"
                        type="text"
                        fullWidth
                        name="name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                    />
                     <FormControl fullWidth margin="dense">
                    <InputLabel>Company Name</InputLabel>
                    <Select
                        name="company_name"
                        value={newProduct.company_name}
                        onChange={handleInputChange}
                    >
                        {companyNames.map((company, index) => (
                            <MenuItem key={index} value={company}>
                                {company}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                    <TextField
                        margin="dense"
                        label="MRP"
                        type="number"
                        fullWidth
                        name="mrp"
                        value={newProduct.mrp}
                        onChange={handleInputChange}
                    />
                    <FormControl component="fieldset" margin="dense">
                        <FormLabel component="legend">Price Type</FormLabel>
                        <RadioGroup value={value} onChange={handleRadioChange}>
                            <FormControlLabel value="selling_price" control={<Radio />} label="Selling Price" />
                            <FormControlLabel value="ptr" control={<Radio />} label="PTR" />
                        </RadioGroup>
                    </FormControl>
                    {value === 'ptr' && (
                        <TextField
                            margin="dense"
                            label="Offer"
                            type="text"
                            fullWidth
                            name="offer"
                            value={newProduct.offer}
                            onChange={handleInputChange}
                        />
                    )}
                    {value === 'selling_price' && (
                        <TextField
                            margin="dense"
                            label="Selling Price"
                            type="number"
                            fullWidth
                            name="selling_price"
                            value={newProduct.selling_price}
                            onChange={handleInputChange}
                        />
                    )}
                    {value === 'ptr' && (
                        <TextField
                            margin="dense"
                            label="PTR"
                            type="number"
                            fullWidth
                            name="ptr"
                            value={newProduct.ptr}
                            onChange={handleInputChange}
                        />
                    )}
                    <TextField
                        margin="dense"
                        label="Product Details"
                        type="text"
                        fullWidth
                        name="product_details"
                        value={newProduct.product_details}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        label="Salts"
                        type="text"
                        fullWidth
                        name="salts"
                        value={newProduct.salts}
                        onChange={handleInputChange}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Category</InputLabel>
                        <Select
                            name="category"
                            value={newProduct.category}
                            onChange={handleInputChange}
                        >
                            <MenuItem value="Pharma">Pharma</MenuItem>
                            <MenuItem value="General">General</MenuItem>
                        </Select>
                    </FormControl>
                    <input
                        accept="image/*"
                        type="file"
                        onChange={handleImageUpload}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmitNewProduct} color="primary">
                        Add Product
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Products;
