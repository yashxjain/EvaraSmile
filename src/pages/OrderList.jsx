import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Pagination, Typography, Box, Button, MenuItem, Select, FormControl, InputLabel, TextField
} from '@mui/material';

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchAmount, setSearchAmount] = useState('');
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch orders from the API
        const fetchOrders = async () => {
            try {
                const response = await axios.get('https://namami-infotech.com/EvaraBackend/src/order/get_orders.php');
                if (response.data.success) {
                    setOrders(response.data.orders);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        // Filter and paginate orders based on the current page, status filter, and search query
        const paginateOrders = () => {
            let filtered = orders;

            // Filter by status
            if (statusFilter !== 'All') {
                filtered = orders.filter(order => order.status === statusFilter);
            }
            // Filter by search query
            if (searchQuery) {
                filtered = filtered.filter(order => order.orderId.toString().includes(searchQuery));
            }
            if (searchName) {
                filtered = filtered.filter(order => order.username.toString().includes(searchName));
            }
            if (searchDate) {
                filtered = filtered.filter(order => formatDate(order.order_date).includes(searchDate));
            }
            if (searchAmount) {
                filtered = filtered.filter(order => order.total_amount.toString().includes(searchAmount));
            }
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginated = filtered.slice(startIndex, endIndex);

            setFilteredOrders(paginated);
        };

        paginateOrders();
    }, [orders, currentPage, statusFilter, searchQuery, searchName, searchDate, searchAmount]);

    // Change page handler
    const handlePageChange = (event, pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Navigate to edit page
    const handleEditOrder = (orderId) => {
        navigate(`/order-detail/${orderId}`);
    };

    // Utility function to extract only the date part
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns the date in 'YYYY-MM-DD' format
    };

    // Handle filter change
    const handleFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handle search input change
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1); // Reset to first page on search query change
    };
    const handleSearchNameChange = (event) => {
        setSearchName(event.target.value);
        setCurrentPage(1); // Reset to first page on search query change
    };
    const handleSearchDateChange = (event) => {
        setSearchDate(event.target.value);
        setCurrentPage(1); // Reset to first page on search query change
    };
    const handleSearchAmountChange = (event) => {
        setSearchAmount(event.target.value);
        setCurrentPage(1); // Reset to first page on search query change
    };

    const handleExportToCSV = () => {
        const csvHeaders = ['Order ID', 'Company Name', 'Order Date', 'Total Amount', 'Status'];
        const csvData = filteredOrders.map(order => ({
            orderId: order.orderId,
            username: order.username,
            orderDate: formatDate(order.order_date),
            totalAmount: order.total_amount,
            status: order.status,
        }));

        const csvString = [
            csvHeaders.join(','), // Header row
            ...csvData.map(order => Object.values(order).join(',')) // Data rows
        ].join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        // saveAs(blob, 'orders.csv');
    };
    return (
        <Container>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                <Typography variant="h4" style={{ color: "orange" }} gutterBottom>Orders</Typography>
                {/* <Button
                    variant="contained"
                    style={{ backgroundColor: "#008080", color: "white" }}
                    onClick={handleExportToCSV}
                >
                    Export to CSV
                </Button> */}
                {/* Filter Section */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                     <Link
                     to="/order-product"
                    variant="contained"
                    style={{ color: "#008080" }}
                    onClick={handleExportToCSV}
                    size='small'
                >
                    Place order
                </Link>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={handleFilterChange}
                            label="Status"
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Accepted">Accepted</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                            <MenuItem value="Delivered">Delivered</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Search Input */}

                </Box>
                </div>
            </div>
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "15px" }}>
                                <span>Order ID</span> <br />
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "15px" }}>
                                <span>Company Name</span> <br />
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "15px" }}>
                                <span>Order Date</span> <br />
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "15px" }}>
                                <span>Total Amount</span> <br />
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "15px" }}>Status</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "15px" }}>Action</TableCell>
                        </TableRow>

                        {/* Filter Row */}
                        <TableRow style={{ maxHeight: "10px", minHeight: "10px", padding: "0" }}>
                            <TableCell style={{ padding: "5px", minHeight: "10px" }}>
                                <TextField
                                    variant="outlined"

                                    onChange={handleSearchChange}
                                    size="small"
                                    InputProps={{ style: { height: "30px", fontSize: "12px" } }}
                                    style={{ width: "85px", backgroundColor: "white", borderRadius: "5px" }}
                                />
                            </TableCell>
                            <TableCell style={{ padding: "5px", minHeight: "10px" }}>
                                <TextField
                                    variant="outlined"
                                    onChange={handleSearchNameChange}
                                    size="small"
                                    InputProps={{ style: { height: "30px", fontSize: "12px" } }}
                                    style={{ width: "120px", backgroundColor: "white", borderRadius: "5px" }}
                                />
                            </TableCell>
                            <TableCell style={{ padding: "5px", minHeight: "10px" }}>
                                <TextField
                                    variant="outlined"
                                    onChange={handleSearchDateChange}
                                    size="small"
                                    InputProps={{ style: { height: "30px", fontSize: "12px" } }}
                                    style={{ width: "85px", backgroundColor: "white", borderRadius: "5px" }}
                                />
                            </TableCell>
                            <TableCell style={{ padding: "5px", minHeight: "10px" }}>
                                <TextField
                                    variant="outlined"
                                    onChange={handleSearchAmountChange}
                                    size="small"
                                    InputProps={{ style: { height: "30px", fontSize: "12px" } }}
                                    style={{ width: "105px", backgroundColor: "white", borderRadius: "5px" }}
                                />
                            </TableCell>
                            <TableCell>
                            </TableCell>
                            <TableCell>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <TableRow key={order.orderId}>
                                    <TableCell>{order.orderId}</TableCell>
                                    <TableCell>{order.username}</TableCell>
                                    <TableCell>{formatDate(order.order_date)}</TableCell>
                                    <TableCell>{order.total_amount}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            style={{ backgroundColor: "#008080" }}
                                            onClick={() => handleEditOrder(order.orderId)}
                                        >
                                            Action
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No orders found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>


            <Box display="flex" justifyContent="center" marginTop="30px">
                <Pagination
                    count={Math.ceil(orders.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    style={{ color: "#008080" }}
                />
            </Box>
        </Container>
    );
};

export default OrdersList;
