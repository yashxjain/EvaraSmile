import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link,useParams, useNavigate,useSearchParams } from 'react-router-dom';
import { Container, Typography, Box, Grid, CardMedia, CircularProgress, Button, TextField } from '@mui/material';
import Carousel from 'react-material-ui-carousel';

const ProductDetails = () => {
    const { medicine_id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [selectedImages, setSelectedImages] = useState({});
    const [statusChanging, setStatusChanging] = useState(false); // For status toggle
const [searchParams] = useSearchParams();
    const currentPage = searchParams.get('page') || 1;
    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`https://namami-infotech.com/EvaraBackend/src/sku/get_sku.php`, {
                params: { medicine_id }
            });
            setProduct(response.data.medicine);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product details:', error);
            setLoading(false);
            setError('Error fetching product details.');
        }
    };

    useEffect(() => {
        fetchProductDetails();
    }, [medicine_id]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            [name]: value
        }));
    };

    const handleImageChange = (event, index) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImages(prev => ({
                ...prev,
                [index]: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleUpdate = async () => {
        if (!product) return;
        setSaving(true);
        fetchProductDetails();
        try {
            const imageData = {
                medicine_id: product.medicine_id,
                name:product.name,
                mrp: product.mrp,
                ptr: product.ptr,
                selling_price: product.selling_price,
                offer: product.offer,
                image_base64: selectedImages[0] || null,
                image_base64_2: selectedImages[1] || null,
                image_base64_3: selectedImages[2] || null,
                image_base64_4: selectedImages[3] || null,
                image_base64_5: selectedImages[4] || null
            };

            await axios.post('https://namami-infotech.com/EvaraBackend/src/sku/edit_sku.php', imageData);
            setError(null);
            setEditing(false);
            fetchProductDetails();
        } catch (error) {
            console.error('Error updating product details:', error);
            setError('Error updating product details.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!product) return;
        setStatusChanging(true);
        try {
            const newStatus = product.status === 1 ? 0 : 1; // Toggle between 1 (enabled) and 0 (disabled)
            await axios.post('https://namami-infotech.com/EvaraBackend/src/sku/update_sku.php', {
                medicine_id: product.medicine_id,
                status: newStatus
            });

            // Fetch updated product details after status change
            fetchProductDetails();
        } catch (error) {
            console.error('Error toggling product status:', error);
            setError('Error toggling product status.');
        } finally {
            setStatusChanging(false);
        }
    };

    const images = [
        product?.image_url,
        product?.image_url_2,
        product?.image_url_3,
        product?.image_url_4,
        product?.image_url_5
    ].filter(Boolean).map(image => image);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    if (!product) {
        return <Typography variant="h6">Product not found.</Typography>;
    }

    return (
        <Container sx={{ marginTop: '20px' }}>
            <Link to={`/products?page=${currentPage}`} className="back-button">
<span className="arrow">&#8592;</span>    </Link>
            <Grid container spacing={4}> 
                <Grid item xs={12} md={6} style={{maxHeight:"200px"}}>
                    {images.length > 0 ? (
                        <Carousel>
                            {images.map((image, index) => (
                                <CardMedia
                                    key={index}
                                    component="img"
                                    height="400"
                                    image={image}
                                    alt={`Product Image ${index + 1}`}
                                />
                            ))}
                        </Carousel>
                    ) : (
                        <CardMedia
                            component="img"
                            height="400"
                            image={'https://namami-infotech.com/EvaraBackend/assets/sku/logo.png'}
                            alt={product.name}
                        />
                    )}
                </Grid>

                {/* Right Section - Product Details */}
                <Grid item xs={12} md={6}>
                    <Box>
                        <Typography variant="h5" gutterBottom>{product.name}</Typography>
                        <Typography variant="h6" color="textSecondary" gutterBottom>{product.company_name}</Typography>
                        <Typography variant="h6" gutterBottom>{product.salts}</Typography>
                        {editing ? (
    <>
        <TextField
            label="Product Name"
            name="name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={product.name}
            onChange={handleInputChange}
        />
        <TextField
            label="MRP"
            name="mrp"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={product.mrp}
            onChange={handleInputChange}
        />
        <TextField
            label="PTR"
            name="ptr"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={product.ptr}
            onChange={handleInputChange}
        />
        <TextField
            label="Selling Price"
            name="selling_price"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={product.selling_price}
            onChange={handleInputChange}
        />
        <TextField
            label="Offer (1+1)"
            name="offer"
            variant="outlined"
            fullWidth
            margin="normal"
            value={product.offer}
            onChange={handleInputChange}
        />

        {/* Image Upload Inputs */}
        {[0].map((index) => (
            <Box key={index} mt={2}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Button variant="contained" component="label">
                        Upload Image
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                        />
                    </Button>
                    {selectedImages[index] && (
                        <CardMedia
                            component="img"
                            style={{ width: '40px' }}
                            image={selectedImages[index]}
                            alt={`New Image ${index + 1}`}
                        />
                    )}
                </div>
            </Box>
        ))}
    </>
) : (
    <>
        <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {product.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
            <strong>MRP:</strong> ₹{product.mrp}
        </Typography>
        <Typography variant="body1" gutterBottom>
            <strong>PTR:</strong> ₹{product.ptr}
        </Typography>
        <Typography variant="body1" gutterBottom>
            <strong>Selling Price:</strong> ₹{product.selling_price}
        </Typography>
        <Typography variant="body1" gutterBottom>
            <strong>Offer:</strong> {product.offer || 'No offer available'}
        </Typography>
    </>
)}

                        <Box mt={3}>
                            {editing ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        sx={{ marginRight: 2 }}
                                        onClick={handleUpdate}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="large"
                                        onClick={() => setEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        sx={{ marginRight: 2 }}
                                        onClick={() => setEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color={product.status === 1 ? 'error' : 'success'}
                                        size="large"
                                        onClick={handleToggleStatus}
                                        disabled={statusChanging}
                                    >
                                        {statusChanging
                                            ? product.status === 1 ? 'Disabling...' : 'Enabling...'
                                            : product.status === 1 ? 'Disable' : 'Enable'}
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductDetails;
