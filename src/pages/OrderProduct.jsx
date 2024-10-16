import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, CircularProgress, Button, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';

const OrderProduct = () => {
    const [users, setUsers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMedicines, setLoadingMedicines] = useState(true);

    useEffect(() => {
        // Fetch users
        const fetchUsers = async () => {
            try {
                const userResponse = await axios.get('https://namami-infotech.com/EvaraBackend/src/user/list_user.php');
                setUsers(userResponse.data.users);
                setLoadingUsers(false);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        // Fetch medicines
        const fetchMedicines = async () => {
            try {
                const medicineResponse = await axios.get('https://namami-infotech.com/EvaraBackend/src/stock/stock_name.php');
                setMedicines(medicineResponse.data.data);
                setLoadingMedicines(false);
            } catch (error) {
                console.error('Error fetching medicines:', error);
            }
        };

        fetchUsers();
        fetchMedicines();
    }, []);

    const handleProductChange = (event, index) => {
        const { name, value } = event.target;
        const updatedProducts = [...selectedProducts];
        updatedProducts[index] = { ...updatedProducts[index], [name]: value };
        setSelectedProducts(updatedProducts);
    };

    const handleAddProduct = () => {
        setSelectedProducts([...selectedProducts, { product_id: '', net_quantity: '', buy_quantity: '', offer_quantity: '' }]);
    };

    const handleSubmitOrder = async () => {
        const orderData = {
            user_id: selectedUser,
            products: selectedProducts,
            total_amount: parseFloat(totalAmount) || 0,
        };

        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/src/order/order_product.php', orderData);
            console.log('Order placed successfully:', response.data);

            // Clear form after successful order
            setSelectedUser('');
            setSelectedProducts([]);
            setTotalAmount('');
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    return (
        <Container>
            <Typography variant="h6" gutterBottom>
                Order Product
            </Typography>
            {loadingUsers || loadingMedicines ? (
                <Box display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <FormControl style={{width:"200px"}} margin="dense">
                        <InputLabel>Client</InputLabel>
                        <Select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            size="small"
                        >
                            {users.map((user) => (
                                <MenuItem key={user.user_id} value={user.user_id}>
                                    {user.username}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedProducts.map((product, index) => (
                        <Box key={index} display="flex" flexDirection="row" justifyContent="space-between" mb={1}>
                            <FormControl margin="dense" style={{width:"200px"}}>
                                <InputLabel>Product</InputLabel>
                                <Select
                                    value={product.product_id}
                                    name="product_id"
                                    onChange={(e) => handleProductChange(e, index)}
                                    size="small"
                                >
                                    {medicines.map((medicine) => (
                                        <MenuItem key={medicine.medicine_id} value={medicine.medicine_id}>
                                            {medicine.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Net Quantity"
                                name="net_quantity"
                                value={product.net_quantity}
                                onChange={(e) => handleProductChange(e, index)}
                                margin="dense"
                                size="small"
                            />
                            <TextField
                                label="Buy Quantity"
                                name="buy_quantity"
                                value={product.buy_quantity}
                                onChange={(e) => handleProductChange(e, index)}
                                margin="dense"
                                size="small"
                            />
                            <TextField
                                label="Offer Quantity"
                                name="offer_quantity"
                                value={product.offer_quantity}
                                onChange={(e) => handleProductChange(e, index)}
                                margin="dense"
                                size="small"
                            />
                        </Box>
                    ))}

                    <Button variant="contained" onClick={handleAddProduct} size="small" sx={{ mb: 2, mt:1,ml:3 }}>
                        Add Product
                    </Button>

                    <TextField
                        label="Total Amount"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        margin="dense"
                        size="small"
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSubmitOrder}
                        disabled={!selectedUser || selectedProducts.length === 0 || !totalAmount}
                        size="small"
                        sx={{ mt: 2 }}
                    >
                        Submit Order
                    </Button>
                </>
            )}
        </Container>
    );
};

export default OrderProduct;
