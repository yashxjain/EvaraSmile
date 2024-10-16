import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Switch, Pagination, Typography, Box, Button
} from '@mui/material';
import { Link } from 'react-router-dom';

const UsersList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all'); // Added state for toggle filter
    const itemsPerPage = 10;

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/EvaraBackend/src/user/list_user.php');
            if (response.data.message === 'User list fetched successfully') {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // First useEffect to fetch users
    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filterAndPaginateUsers = () => {
            let filtered = users.filter(user =>
                user && (
                    (statusFilter === 'all' || user.status === statusFilter) &&
                    (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
                )
            );

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginated = filtered.slice(startIndex, endIndex);

            setFilteredUsers(paginated);
        };

        filterAndPaginateUsers();
    }, [searchTerm, users, currentPage, statusFilter]);

    // Handle toggle user status
    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/src/user/approve_user.php', { email: userId, status: newStatus });

            if (response.data.success) {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.user_id === userId
                            ? { ...user, status: newStatus }
                            : user
                    )
                );
                fetchUsers(); // Re-fetch user data to ensure consistency
            } else {
                console.error('Failed to update user status:', response.data.message);
            }
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };


    // Change page handler
    const handlePageChange = (event, pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle status filter change
    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    return (
        <Container>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "20px" }}>
                <Typography variant="h4" gutterBottom style={{ color: "orange", fontSize: "30px" }}>Clients List</Typography>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <TextField
                        label="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '30px', maxHeight: "40px", width: "300px" } }}
                    />
                    <Button
                        variant={statusFilter === 'active' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusFilterChange('active')}
                        color="primary"
                    >
                        Active
                    </Button>
                    <Button
                        variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusFilterChange('pending')}
                        color="secondary"
                    >
                        Pending
                    </Button>
                    <Button
                        variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                        onClick={() => handleStatusFilterChange('all')}
                    >
                        All
                    </Button>
                </div>
            </div>

            <TableContainer component={Paper} >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>ID</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Username</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Email</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Mobile</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>User Role</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Status</TableCell>
                            <TableCell style={{ backgroundColor: "#008080", color: "orange", fontWeight: "700", fontSize: "20px" }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <TableRow key={user.user_id}>
                                    <TableCell>{user.user_id}</TableCell>
                                    <TableCell style={{ color: "#008080", cursor: "pointer" }}><Link to={`/client/${user.user_id}`}>{user.username}</Link></TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone_number}</TableCell>
                                    <TableCell>{user.user_type}</TableCell>
                                    <TableCell>{user.status}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={user.status === 'active'}
                                            onChange={() => handleToggleStatus(user.email, user.status === 'active' ? 'inactive' : 'active')}
                                            color="primary"
                                        />

                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No users found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" marginTop="30px">
                <Pagination
                    count={Math.ceil(users.filter(user => user).length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Container>
    );
};

export default UsersList;
