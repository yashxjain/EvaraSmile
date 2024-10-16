import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Grid, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Paper, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const EditOrder = () => {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [productDetails, setProductDetails] = useState([]);
    const [status, setStatus] = useState('');
    const [reachbyDate, setReachbyDate] = useState('');
    const [remark, setRemark] = useState('');
    const [podBase64, setPodBase64] = useState(''); // State to hold POD as Base64 string
    const [stockDetails, setStockDetails] = useState([]); // State to hold stock details
    const [insufficientStockDetails, setInsufficientStockDetails] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control the popup
    const [deliverDate, setDeliverDate] = useState(''); // State to hold deliver date
    const [isStockAccepted, setIsStockAccepted] = useState(false); // State to track stock acceptance
const navigate = useNavigate();
    useEffect(() => {
        // Fetch order details using the order ID
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`https://namami-infotech.com/EvaraBackend/src/order/get_order.php?order_id=${orderId}`);
                if (response.data.success) {
                    setOrderDetails(response.data.order);
                    setStatus(response.data.order.status); // Set initial status
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (orderDetails) {
            // Fetch product details for each product in the order
            const fetchProductDetails = async () => {
                const productRequests = orderDetails.products.map(async (product) => {
                    try {
                        const response = await axios.get(`https://namami-infotech.com/EvaraBackend/src/sku/get_sku.php?medicine_id=${product.product_id}`);
                        if (response.data.message === 'Medicine details fetched successfully') {
                            return response.data.medicine;
                        }
                    } catch (error) {
                        console.error('Error fetching product details:', error);
                    }
                });

                const products = await Promise.all(productRequests);
                setProductDetails(products);
            };

            fetchProductDetails();
        }
    }, [orderDetails]);

    // Fetch stock details for validation when accepting the order
    const fetchStockDetails = async () => {
        try {
            const response = await axios.get(`https://namami-infotech.com/EvaraBackend/src/stock/get_stock.php`);
            if (response.data.success) {
                setStockDetails(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stock details:', error);
        }
    };

    const checkStockAvailability = () => {
        const insufficientStock = orderDetails.products.reduce((acc, orderProduct) => {
            // Find the stock item based on the product_id in the order
            const stock = stockDetails.find(stockItem => String(stockItem.medicine_id) === String(orderProduct.product_id));

            // Log if the product is not found in stock
            if (!stock) {
                console.log(`Product ID: ${orderProduct.product_id} (${orderProduct.medicine_name}) is not found in stock.`);
            } else {
                console.log(`Product ID: ${orderProduct.product_id}, Ordered Quantity: ${orderProduct.net_quantity}, Available Stock: ${stock.net_quantity}`);
            }

            // Check if the stock is insufficient
            if (stock && orderProduct.net_quantity > stock.net_quantity) {
                acc.push({
                    productName: stock.name,
                    orderedQuantity: orderProduct.net_quantity,
                    availableStock: stock.net_quantity,
                });
            }

            return acc;
        }, []);

        if (insufficientStock.length > 0) {
            setInsufficientStockDetails(insufficientStock);
            setIsDialogOpen(true);
            return false;
        }

        return true;
    };

    // Handle stock acceptance
    const handleAcceptStock = () => {
        setIsStockAccepted(true);
        setIsDialogOpen(false);
        handleUpdateStatus(); // Proceed with status update
    };

    // Handle stock cancellation
    const handleCancelStock = () => {
        setIsStockAccepted(false);
        setIsDialogOpen(false);
    };

    // Convert the uploaded file to Base64 format
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPodBase64(reader.result); // Save the Base64 string of the image
            };
            reader.readAsDataURL(file); // Convert file to Base64
        }
    };

    const handleUpdateStatus = async () => {
        if (status === 'Accepted' && !isStockAccepted) {
            await fetchStockDetails(); // Fetch stock data when accepting the order
            const isStockSufficient = checkStockAvailability(); // Check if stock is sufficient

            if (!isStockSufficient) {
                return; // Prevent order update if stock is insufficient
            }
        }

        const requestData = {
            order_id: orderId,
            status: status,
            reachby_date: status === 'Accepted' ? reachbyDate : null,
            remark: status === 'Rejected' ? remark : null,
            pod: status === 'Delivered' ? podBase64 : null, // Add POD as Base64 string if status is Delivered
            deliver_date: status === 'Delivered' ? deliverDate : null,
        };

        try {
            const response = await axios.post(
                `https://namami-infotech.com/EvaraBackend/src/order/update_order.php`,
                requestData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            alert('Order status updated successfully');
            setOrderDetails(prev => ({ ...prev, status })); // Update status in the UI
            navigate("/orders")
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setInsufficientStockDetails([]); // Clear the stock details on close
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns the date in 'YYYY-MM-DD' format
    };

    const handleExportToPDF = () => {
        const input = document.getElementById('pdf-content');

        html2canvas(input).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('order-details.pdf');
        });
    };

    return (
        <Container>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                <Typography variant="h4" style={{ color: "orange" }} gutterBottom>Order Details</Typography>
                <Button variant="contained" style={{ backgroundColor: "#008080", marginBottom: '20px' }} onClick={handleExportToPDF}>
                    Export to PDF
                </Button>
            </div>

            <div id="pdf-content">
                {orderDetails && (
                    <Grid container spacing={2} style={{ marginBottom: '20px' }}>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Name:</strong> {orderDetails.user_details.username}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Email:</strong> {orderDetails.user_details.email}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Phone No:</strong> {orderDetails.user_details.phone_number}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Delivery Address:</strong> {orderDetails.user_details.delivery_address}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Total Amount:</strong> &#8377;{orderDetails.total_amount}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Order Date:</strong> {formatDate(orderDetails.order_date)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Reach By Date:</strong> {orderDetails.reachby_date || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Delivered Date:</strong> {orderDetails.deliver_date || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body1"><strong>Current Status:</strong> {orderDetails.status}</Typography>
                        </Grid>
                    </Grid>
                )}

                <Typography variant="h6" style={{ color: "orange" }}>Product Details</Typography>
                <TableContainer component={Paper}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Name</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Net Qty</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Buy Qty</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Offer Qty</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>MRP</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>PTR/SP</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Total Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productDetails.map((product, index) => {
                                const orderProduct = orderDetails.products[index]; // Get the product by index from orderDetails.products

                                const stock = stockDetails.find(stockItem => stockItem.medicine_id === product.medicine_id);

                                // Highlight the row if stock is insufficient
                                const isStockInsufficient = stock && orderProduct.net_quantity > stock.net_quantity;

                                return (
                                    <TableRow key={index} style={isStockInsufficient ? { backgroundColor: '#ffcccc' } : {}}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{orderProduct ? orderProduct.net_quantity : 'N/A'}</TableCell>
                                        <TableCell>{orderProduct ? orderProduct.buy_quantity : 'N/A'}</TableCell>
                                        <TableCell>{orderProduct ? orderProduct.offer_quantity : 'N/A'}</TableCell>
                                        <TableCell>&#8377;{product.mrp}</TableCell>
                                        <TableCell>&#8377;{product.ptr ? product.ptr : product.selling_price}</TableCell>
                                        <TableCell>&#8377;{orderProduct.buy_quantity * (product.ptr ? product.ptr : product.selling_price)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <br />
            </div>
            <Typography variant="h6" style={{ color: "orange" }}>Update Order Status</Typography>
            <Grid container spacing={2} direction="row" alignItems="center" style={{ marginBottom: '20px', display: "flex" }}>
                <Grid item xs={3}>
                    <TextField
                        select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="Accepted">Accepted</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                    </TextField>
                </Grid>

                {status === 'Accepted' && (
                    <Grid item xs={3}>
                        <TextField
                            label="Reach By Date"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                min: new Date().toISOString().split('T')[0], // Set minimum date to today
                            }}
                            value={reachbyDate}
                            onChange={(e) => setReachbyDate(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                )}

                {status === 'Rejected' && (
                    <Grid item xs={3}>
                        <TextField
                            label="Remark"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                )}

                {status === 'Delivered' && (
                    <Grid item xs={3}>
                        <Typography variant="body1">Upload Proof of Delivery (POD):</Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </Grid>
                )}
                {status === 'Delivered' && (
                    <Grid item xs={3}>
                        <TextField
                            label="Deliver Date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            type="date"
                            value={deliverDate}
                            onChange={(e) => setDeliverDate(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                )}

                <Grid item xs={2}>
                    <Button variant="contained" style={{ backgroundColor: "#008080" }} onClick={handleUpdateStatus}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Insufficient Stock</DialogTitle>
                <DialogContent>
                    <Typography>
                        Some products have insufficient stock to fulfill the order:
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Ordered Quantity</TableCell>
                                <TableCell>Available Stock</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {insufficientStockDetails.map((stock, index) => (
                                <TableRow key={index}>
                                    <TableCell>{stock.productName}</TableCell>
                                    <TableCell>{stock.orderedQuantity}</TableCell>
                                    <TableCell>{stock.availableStock}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAcceptStock} color="primary">Accept</Button>
                    <Button onClick={handleCancelStock} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EditOrder;

