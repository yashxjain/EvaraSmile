import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    MenuItem,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    TableContainer,
    Switch
} from '@mui/material';
import axios from 'axios';

const Offer = () => {
    const [formData, setFormData] = useState({
        BannerName: '',
        BannerSize: '',
        Status: 'Open', // Default status
        Category: 'Banner', // Default category
        ProductID: '',
        image_base64: ''
    });
    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);

    // Fetch banners when the component mounts
    useEffect(() => {
        fetchBanners();
    }, []);

    // Fetch banners from the API
    const fetchBanners = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/EvaraBackend/src/banner/get_banner.php');
            setBanners(response.data.data); // Assuming API returns data in `data.data`
        } catch (error) {
            setError('Error fetching banners.');
        }
    };

    // Handle input changes for form fields
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle image file change and convert to base64
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, image_base64: reader.result.split(',')[1] });
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    // Open dialog for adding banner
    const handleClickOpen = () => {
        setOpen(true);
    };

    // Close dialog
    const handleClose = () => {
        setOpen(false);
    };

    // Handle form submission for adding banner
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/src/banner/add_banner.php', formData);
            if (response.data.success) {
                setResponseMessage('Banner added successfully!');
               
                setError('');
                
            } else {
                setError(response.data.message || 'Error adding banner.');
                setResponseMessage('');
            }
            handleClose(); // Close dialog on success
                fetchBanners();
        } catch (error) {
            setError('Error adding banner.');
            setResponseMessage('');
        } finally {
            setLoading(false);
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns the date in 'YYYY-MM-DD' format
    };
    const handleStatusToggle = async (bannerID) => {
        const updatedBanners = banners.map(banner => {
            if (banner.BannerID === bannerID) {
                return {
                    ...banner,
                    Status: banner.Status === 'Open' ? 'Close' : 'Open'
                };
            }
            return banner;
        });

        setBanners(updatedBanners);

        // Optionally, you can also update the backend with the new status
        try {
            await axios.post('https://namami-infotech.com/EvaraBackend/src/banner/update_banner.php', {
                BannerID: bannerID,
                Status: updatedBanners.find(banner => banner.BannerID === bannerID).Status
            });
        } catch (error) {
            setError('Error updating banner status.');
        }
    };

    return (
        <Container>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>

                <Typography variant="h4" gutterBottom style={{ color: "orange" }}>Banners</Typography>
                <i class='bx bxs-add-to-queue' onClick={handleClickOpen} style={{ fontSize: "40px", color: "orange", cursor: "pointer" }}></i>
            </div>
            {/* Display banners */}
            <TableContainer component={Paper} sx={{ overflowX: 'hidden' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Banner Name</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Banner</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Product</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Category</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Date</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {banners.map((banner) => (
                            <TableRow key={banner.BannerID}>
                                <TableCell>{banner.BannerName}</TableCell>
                                <TableCell>
                                    <img
                                        src={banner.BannerURL !== "" ? banner.BannerURL : "https://namami-infotech.com/EvaraBackend/assets/sku/logo.png"}
                                        alt={banner.BannerName}
                                        style={{ maxWidth: '100px', height: 'auto' }}
                                    />
                                </TableCell>
                                <TableCell>{banner.ProductID}

                                    
                                </TableCell>
                                <TableCell>{banner.Category}</TableCell>
                                <TableCell>{formatDate(banner.DateTime)}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={banner.Status === 'Open'}
                                        onChange={() => handleStatusToggle(banner.BannerID)}
                                        color="primary"

                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Banner Button */}

            {/* Add Banner Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Add New Banner</DialogTitle>
                {/* {responseMessage && <Typography color="success">{responseMessage}</Typography>}
                {error && <Typography color="error">{error}</Typography>} */}
                <DialogContent>
                    <Box component="form" noValidate sx={{ mt: 3 }} onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Banner Name"
                                    name="BannerName"
                                    value={formData.BannerName}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                />
                            </Grid>

                            {/* <Grid item xs={6}>
                                <TextField
                                    label="Banner Size"
                                    name="BannerSize"
                                    value={formData.BannerSize}
                                    onChange={handleInputChange}
                                    type="number"
                                    fullWidth
                                    required
                                />
                            </Grid> */}

                            <Grid item xs={6}>
                                <TextField
                                    label="Product ID"
                                    name="ProductID"
                                    value={formData.ProductID}
                                    onChange={handleInputChange}
                                    type="number"
                                    fullWidth
                                    required
                                />
                            </Grid>

                            {/* <Grid item xs={6}>
                                <TextField
                                    select
                                    label="Status"
                                    name="Status"
                                    value={formData.Status}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                >
                                    <MenuItem value="Open">Open</MenuItem>
                                    <MenuItem value="Close">Close</MenuItem>
                                </TextField>
                            </Grid> */}

                            <Grid item xs={6}>
                                <TextField
                                    select
                                    label="Category"
                                    name="Category"
                                    value={formData.Category}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                >
                                    <MenuItem value="Banner">Banner</MenuItem>
                                    <MenuItem value="Popup">Popup</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    fullWidth
                                >
                                    Upload Image
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Button>
                            </Grid>

                            {formData.image_base64 && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="textSecondary">
                                        Image Selected.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button
                        type="submit"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>


        </Container>
    );
};

export default Offer;
