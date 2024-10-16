import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TablePagination,
    IconButton
} from '@mui/material';
// import DownloadIcon from '@mui/icons-material/Download';
import 'boxicons'

const Stock = () => {
    const [stockData, setStockData] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [rows, setRows] = useState([{ medicineId: '', quantity: '' }]);
    const [loading, setLoading] = useState(true);
    const [responseMessage, setResponseMessage] = useState('');
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Fetch stock data with pagination
    const fetchStockData = async (page, rowsPerPage) => {
        try {
            const response = await axios.get('https://namami-infotech.com/EvaraBackend/src/stock/get_stock.php', {
                params: {
                    page: page + 1, // API might use 1-based index
                    rowsPerPage,
                },
            });
            if (response.data.success) {
                setStockData(response.data.data || []);
                setTotalCount(response.data.totalCount || 0); // Assuming the total count is returned by the API
            } else {
                setError(response.data.message || 'Error fetching stock data');
            }
        } catch (error) {
            setError('Error fetching stock data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch medicines data only once and store in state
    const fetchMedicines = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/EvaraBackend/src/sku/list_sku.php');
            if (response.data.message) {
                setMedicines(response.data.medicines);
            } else {
                setError(response.data.message || 'Error fetching medicines');
            }
        } catch (error) {
            setError('Error fetching medicines');
        }
    };

    useEffect(() => {
        fetchStockData(page, rowsPerPage);
        fetchMedicines(); // Fetch medicines data once when the component loads
    }, [page, rowsPerPage]);

    // Handle row change
    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    // Add new row
    const addRow = () => {
        setRows([...rows, { medicineId: '', quantity: '' }]);
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    // Clear form fields after submission
    const clearFormFields = () => {
        setRows([{ medicineId: '', quantity: '' }]);
    };

    // Handle stock submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Create an array of stock data
        const stockDataArray = rows.map(row => ({
            medicine_id: row.medicineId,
            quantity: row.quantity,
            update_by: 'admin',
            received_at: new Date().toISOString().replace('T', ' ').substring(0, 19), // Current date-time
        }));

        // Wrap the stock data array inside an object with the 'stocks' key
        const requestData = {
            stocks: stockDataArray,
        };

        if (stockDataArray.length === 0) {
            setError('No stock data to submit');
            return;
        }

        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/src/stock/add_stock.php', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                setResponseMessage('Stock added successfully');
                setError('');
                fetchStockData(page, rowsPerPage); // Refresh the stock data
                clearFormFields(); // Clear the form fields
                handleClose(); // Close the dialog
            } else {
                setError(response.data.message || 'Error adding stock');
                setResponseMessage('');
            }
        } catch (error) {
            setError('Error adding stock');
            setResponseMessage('');
        }
    };

    // Open dialog
    const handleClickOpen = () => {
        setOpen(true);
    };

    // Close dialog
    const handleClose = () => {
        setOpen(false);
    };

    // Smart search filter for stock list
    const filteredStockData = stockData.filter(stock =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginate the filtered stock data
    const paginatedStockData = filteredStockData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Handle search input change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page
    };

    // Export to CSV
    const exportToCSV = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/EvaraBackend/src/stock/get_stock.php', {
                params: {
                    page: 1,
                    rowsPerPage: totalCount, // Fetch all records
                },
            });

            if (response.data.success) {
                const csvData = response.data.data.map(stock => ({
                    medicine_id: stock.medicine_id,
                    name: stock.name,
                    quantity: stock.net_quantity,
                }));

                // Convert to CSV format
                const csvContent = [
                    ['Medicine ID', 'Medicine Name', 'Quantity'], // Headers
                    ...csvData.map(item => [item.medicine_id, item.name, item.quantity]),
                ]
                    .map(row => row.join(','))
                    .join('\n');

                // Create a Blob from the CSV content
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute('download', 'stock_data.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setError('Error fetching all stock data for export');
            }
        } catch (error) {
            setError('Error exporting data to CSV');
        }
    };

    return (
        <Container>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                <Typography variant="h4" gutterBottom style={{ color: "orange", fontSize: "30px" }}>Stock Management</Typography>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                    <TextField
                        label="Search Products"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '30px', maxHeight: "40px", width: "300px" } }}
                    />
                    <i class='bx bxs-add-to-queue' onClick={handleClickOpen} style={{ fontSize: "40px", color: "orange", cursor: "pointer" }}></i>

                    <i class='bx bx-download' onClick={exportToCSV} style={{ fontSize: "40px", color: "orange", cursor: "pointer" }}></i>
                </div>
            </div>

            {/* Add Stock Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Add New Products</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate sx={{ mt: 3 }}>
                        {rows.map((row, index) => (
                            <Grid container spacing={1} key={index} style={{ display: "flex", justifyContent: "center" }}>
                                <Grid item xs={12} sm={6} sx={{ mb: 1 }}>
                                    <TextField
                                        select
                                        label="Medicine"
                                        value={row.medicineId}
                                        onChange={(e) => handleRowChange(index, 'medicineId', e.target.value)}
                                        fullWidth
                                        required
                                        sx={{ maxHeight: "100px" }}
                                    >
                                        {medicines.map((medicine) => (
                                            <MenuItem key={medicine.medicine_id} value={medicine.medicine_id}>
                                                {medicine.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        type='number'
                                        label="Quantity"
                                        value={row.quantity}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Ensure the value is non-negative
                                            if (value >= 0) {
                                                handleRowChange(index, 'quantity', value);
                                            }
                                        }}
                                        fullWidth
                                        required
                                    />

                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <IconButton onClick={() => removeRow(index)} color="error"><i class='bx bx-x-circle'></i></IconButton>
                                </Grid>
                            </Grid>
                        ))}

                        <Button onClick={addRow} variant="contained" color="primary" style={{ margin: '20px auto', backgroundColor: "#008080" }}>Add Another</Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">Add Stock</Button>
                </DialogActions>
            </Dialog>

            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table stickyHeader>
                        <TableHead >
                            <TableRow >
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Medicine ID</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Medicine Name</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Quantity</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedStockData.map((stock) => (
                                <TableRow key={stock.medicine_id}>
                                    <TableCell>{stock.medicine_id}</TableCell>
                                    <TableCell>{stock.name}</TableCell>
                                    <TableCell>{stock.net_quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 20]}
                        component="div"
                        count={filteredStockData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            )}
        </Container>
    );
};

export default Stock;
