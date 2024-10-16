import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, TableFooter,
    TablePagination, Button, IconButton
} from '@mui/material';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../auth/AuthContext';

function ViewTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const { user } = useAuth();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('https://namami-infotech.com/EvaraBackend/SalesSmile/src/support/get_ticket.php', {
                    params: { EmpId: user.emp_id, role: user.role }
                });

                if (response.data.success) {
                    setTickets(response.data.data);
                    console.log(response.data.data)
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                setError('Error fetching tickets data');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [user.emp_id, user.role]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleStatusChange = async (id, status) => {
        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/SalesSmile/src/support/update_status.php', {
                id,
                status
            });

            if (response.data.success) {
                setTickets(tickets.map(ticket =>
                    ticket.id === id ? { ...ticket, status } : ticket
                ));
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error updating ticket status');
            console.error('Error:', error);
        }
    };

    const exportToCsv = () => {
        const csvRows = [
            ['Employee Id', 'Category', 'SubCategory', 'Remark', 'Date', 'Status']
        ];

        tickets.forEach(({ empId, cat, subCat, remark, date, status }) => {
            csvRows.push([
                empId,
                cat,
                subCat,
                remark,
                formatDate(date),
                status
            ]);
        });

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'tickets.csv');
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Button
                variant="contained"
                color="primary"
                onClick={exportToCsv}
                style={{ marginBottom: '16px', backgroundColor: "teal", float: "right" }}
            >
                Export CSV
            </Button>
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead style={{ backgroundColor: "teal" }}>
                                <TableRow>
                                    <TableCell style={{ color: "white" }}>Employee Id</TableCell>
                                    <TableCell style={{ color: "white" }}>Category</TableCell>
                                    <TableCell style={{ color: "white" }}>SubCategory</TableCell>
                                    <TableCell style={{ color: "white" }}>Remark</TableCell>
                                    <TableCell style={{ color: "white" }}>Date</TableCell>
                                    <TableCell style={{ color: "white" }}>Status</TableCell>
                                    {user.role === 'HR' && <TableCell style={{ color: "white" }}>Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>{ticket.EmpId}</TableCell>
                                        <TableCell>{ticket.Cat}</TableCell>
                                        <TableCell>{ticket.SubCat}</TableCell>
                                        <TableCell>{ticket.Remark}</TableCell>
                                        <TableCell>{formatDate(ticket.Date)}</TableCell>
                                        <TableCell>{ticket.Status}</TableCell>
                                        {user.role === 'HR' && (
                                            <TableCell>
                                                {ticket.status === 'Pending' && (
                                                    <>
                                                        <IconButton onClick={() => handleStatusChange(ticket.id, 'Approved')} color="primary">
                                                            <CheckIcon />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleStatusChange(ticket.id, 'Rejected')} color="secondary">
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        count={tickets.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
}

export default ViewTickets;
