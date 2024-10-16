import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TableFooter,
    TablePagination,
    IconButton,
    Button
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

function ViewLeave() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
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
        const fetchLeaves = async () => {
            if (!user || !user.emp_id) {
                setError('User is not authenticated');
                setLoading(false);
                return;
            }

            try {
                const params = user.role === 'HR' ? { role: user.role } : { empId: user.emp_id };
                const response = await axios.get('https://namami-infotech.com/EvaraBackend/SalesSmile/src/leave/get_leave.php', { params });

                if (response.data.success) {
                    setLeaves(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                setError('Error fetching leave data');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
    }, [user]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/SalesSmile/src/leave/approve_leave.php', {
                id,
                status: newStatus
            });

            if (response.data.success) {
                setLeaves(leaves.map(leave =>
                    leave.Id === id ? { ...leave, Status: newStatus } : leave
                ));
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error updating leave status');
            console.error('Error:', error);
        }
    };

    const exportToCsv = () => {
        const csvRows = [
            ['Employee Id', 'Start Date', 'End Date', 'Reason', 'Status']
        ];

        leaves.forEach(({ EmpId, StartDate, EndDate, Reason, Status }) => {
            csvRows.push([
                EmpId,
                formatDate(StartDate),
                formatDate(EndDate),
                Reason,
                Status
            ]);
        });

        const csvContent = csvRows.map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'leaves.csv');
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

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
            <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead style={{ backgroundColor: "teal" }}>
                        <TableRow>
                            <TableCell style={{ color: "white" }}>Employee Id</TableCell>
                            <TableCell style={{ color: "white" }}>Date</TableCell>
                            <TableCell style={{ color: "white" }}>Category</TableCell>
                            <TableCell style={{ color: "white" }}>Reason</TableCell>
                            <TableCell style={{ color: "white" }}>Status</TableCell>
                            {user.role === 'HR' && <TableCell style={{ color: "white" }}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaves
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((leave) => (
                                <TableRow key={leave.Id}>
                                    <TableCell>{leave.EmpId}</TableCell>
                                    <TableCell>{formatDate(leave.StartDate)} - {formatDate(leave.EndDate)}</TableCell>
                                    <TableCell>{leave.Category}</TableCell>
                                    <TableCell>{leave.Reason}</TableCell>
                                    <TableCell>{leave.Status}</TableCell>
                                    {user.role === 'HR' && (
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleStatusChange(leave.Id, 'Approved')}
                                                disabled={leave.Status === 'Approved' || leave.Status === 'Rejected'}
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton
                                                color="secondary"
                                                onClick={() => handleStatusChange(leave.Id, 'Rejected')}
                                                disabled={leave.Status === 'Approved' || leave.Status === 'Rejected'}
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
                                count={leaves.length}
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

export default ViewLeave;
