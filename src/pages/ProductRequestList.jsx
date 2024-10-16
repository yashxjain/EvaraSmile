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
    TablePagination
} from '@mui/material';

const ProductRequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch product requests
    const fetchRequests = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/EvaraBackend/src/sku/get_request_sku.php'); // Replace with your API endpoint
            if (response.data.success) {
                setRequests(response.data.data || []);
            } else {
                setError('Error fetching product requests.');
            }
        } catch (error) {
            setError('Error fetching product requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredRequests = requests.filter(request =>
        request.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedRequests = filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "20px" }}>
                <Typography variant="h4" style={{ color: "orange" }}>Product Requests</Typography>
                <TextField
                    label="Search Products"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '30px' } }}
                />
            </div>

            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {/* <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>ID</TableCell> */}
                                                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>User</TableCell>

                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Product Name</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Company Name</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Remark</TableCell>
                                <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Date & Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRequests.map(request => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.username}</TableCell>
                                    <TableCell>{request.product_name}</TableCell>
                                    <TableCell>{request.company_name}</TableCell>
                                    <TableCell>{request.remark || 'N/A'}</TableCell>
                                    <TableCell>{request.date_time}</TableCell>
                                    {/* <TableCell>{request.username}</TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 20]}
                        component="div"
                        count={filteredRequests.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0); // Reset to first page
                        }}
                    />
                </TableContainer>
            )}
        </Container>
    );
};

export default ProductRequestList;
