import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TableFooter, TablePagination, Button, IconButton } from '@mui/material';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';

import CancelIcon from '@mui/icons-material/Cancel';

import { useAuth } from '../auth/AuthContext';

function ViewExpense() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                if (!user || !user.emp_id) {
                    setError('User is not authenticated');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('https://namami-infotech.com/EvaraBackend/SalesSmile/src/expense/get_expense.php', {
                    params: { EmpId: user.emp_id, role: user.role }
                });

                if (response.data.success) {
                    setExpenses(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                setError('Error fetching expense data');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [user]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewImage = (base64Data) => {
        if (!base64Data.startsWith('data:image/')) {
            base64Data = `data:image/png;base64,${base64Data}`;
        }

        const byteString = atob(base64Data.split(',')[1]);
        const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });

        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');

        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1000);
    };

    const handleStatusChange = async (detailId, status) => {
        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/SalesSmile/src/expense/update_expense.php', {
                detailId,
                status,
                role: user.role
            });

            if (response.data.success) {
                // Update the status in the local state
                setExpenses(prevExpenses =>
                    prevExpenses.map(expense =>
                        expense.detailId === detailId ? { ...expense, Status: status } : expense
                    )
                );
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error updating expense status');
            console.error('Error:', error);
        }
    };
    const exportToCsv = () => {
        // Define the CSV header
        const csvRows = [
            ['Employee Id', 'Expense Date', 'Expense Type', 'Expense Amount', 'Status']
        ];

        // Populate the CSV rows with leave data
        expenses.forEach(({ empId, expenseDate, expenseType, expenseAmount, Status }) => {
            csvRows.push([
                empId,
                formatDate(expenseDate), // Assuming formatDate is a function to format the date
                expenseType,
                expenseAmount,
                Status
            ]);
        });

        // Convert the array of rows to CSV format
        const csvContent = csvRows.map(row => row.join(',')).join('\n');

        // Create a Blob and link to download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'expense.csv');
        link.click();
        URL.revokeObjectURL(url);
    };
    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <br />
            <Button
                variant="contained"
                color="primary"
                onClick={exportToCsv}
                style={{ marginBottom: '16px', backgroundColor: "teal", float: "right" }}
            >
                Export CSV
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: "teal" }}>
                        <TableRow>
                            <TableCell style={{ color: "white" }}>Employee Id</TableCell>
                            <TableCell style={{ color: "white" }}>Expense Date</TableCell>
                            <TableCell style={{ color: "white" }}>Expense Type</TableCell>
                            <TableCell style={{ color: "white" }}>Expense Amount</TableCell>
                            <TableCell style={{ color: "white" }}>Bill</TableCell>
                            <TableCell style={{ color: "white" }}>Status</TableCell>
                            {user && user.role === 'HR' && <TableCell style={{ color: "white" }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((expense) => (
                                <TableRow key={expense.detailId}>
                                    <TableCell>{expense.empId}</TableCell>
                                    <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                                    <TableCell>{expense.expenseType}</TableCell>
                                    <TableCell>{expense.expenseAmount}</TableCell>
                                    <TableCell>
                                        {expense.image ? (
                                            <Button
                                                variant="contained"
                                                style={{backgroundColor:"teal"}}
                                                onClick={() => handleViewImage(expense.image)}
                                            >
                                                View
                                            </Button>
                                        ) : (
                                            'No Image'
                                        )}
                                    </TableCell>
                                    <TableCell>{expense.Status}</TableCell>
                                    {user && user.role === 'HR' && (
                                        <TableCell>
                                            <IconButton
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleStatusChange(expense.detailId, 'Approved')}
                                                disabled={expense.Status === 'Approved' || expense.Status === 'Rejected'}
                                                sx={{ marginRight: 1 }} // Add right margin for spacing
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleStatusChange(expense.detailId, 'Rejected')}
                                                disabled={expense.Status === 'Rejected' || expense.Status === 'Approved'}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </TableCell>

                                    )}
                                </TableRow>
                            ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={expenses.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ViewExpense;
