import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Grid,
    Divider,
    CircularProgress,
    LinearProgress,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import dayjs from 'dayjs';

const EmployeeData = ({ EmpId }) => {
    const [employeeData, setEmployeeData] = useState(null);
    const [leaveDetails, setLeaveDetails] = useState(null);
    const [expenseDetails, setExpenseDetails] = useState(null);
    const [attendanceDetails, setAttendanceDetails] = useState([]);
    const [assetDetails, setAssetDetails] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const response = await axios.get(`https://namami-infotech.com/EvaraBackend/SalesSmile/src/employee/view_employee.php?EmpId=${EmpId}`);
                const leaveResponse = await axios.get(`https://namami-infotech.com/EvaraBackend/SalesSmile/src/leave/balance_leave.php?empid=${EmpId}`);
                const expenseResponse = await axios.get(`https://namami-infotech.com/EvaraBackend/SalesSmile/src/expense/get_expense.php?EmpId=${EmpId}`);
                const attendanceResponse = await axios.get(`https://namami-infotech.com/EvaraBackend/SalesSmile/src/attendance/view_attendance.php?EmpId=${EmpId}`);
                const assetResponse = await axios.get(`https://namami-infotech.com/EvaraBackend/SalesSmile/src/assets/get_issue_asset.php?EmpId=${EmpId}`);

                setEmployeeData(response.data.data);
                setLeaveDetails(leaveResponse.data.data);
                setExpenseDetails(expenseResponse.data.data);
                setAttendanceDetails(attendanceResponse.data.data);
                setAssetDetails(assetResponse.data.data)

            } catch (err) {
                setError('Failed to fetch employee data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [EmpId]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    const totalApproved = expenseDetails
        ? expenseDetails.reduce((total, expense) => expense.Status === 'Approved' ? total + parseFloat(expense.expenseAmount) : total, 0)
        : 0;
    const totalPending = expenseDetails
        ? expenseDetails.reduce((total, expense) => expense.Status === null ? total + parseFloat(expense.expenseAmount) : total, 0)
        : 0;

    const totalRejected = expenseDetails
        ? expenseDetails.reduce((total, expense) => expense.Status === 'Rejected' ? total + parseFloat(expense.expenseAmount) : total, 0)
        : 0;

    const today = dayjs();
    const pastSevenDays = [...Array(7).keys()].map(i => today.subtract(i, 'day').format('YYYY-MM-DD'));
    const filteredAttendance = pastSevenDays.map(date => {
        const dayEvents = attendanceDetails.filter(att => dayjs(att.MobileDateTime).format('YYYY-MM-DD') === date);
        const firstIn = dayEvents.find(event => event.Event === 'In');
        const lastOut = dayEvents.reverse().find(event => event.Event === 'Out');
        const workingHours = firstIn && lastOut
            ? dayjs(lastOut.MobileDateTime).diff(dayjs(firstIn.MobileDateTime), 'hour', true)
            : 0;

        return {
            date,
            firstInTime: firstIn ? dayjs(firstIn.MobileDateTime).format('HH:mm') : 'N/A',
            lastOutTime: lastOut ? dayjs(lastOut.MobileDateTime).format('HH:mm') : 'N/A',
            workingHours: workingHours.toFixed(2),
        };
    });

    const totalWorkingHours = filteredAttendance.reduce((total, day) => total + parseFloat(day.workingHours), 0);

    return (
        <Box sx={{ padding: 1 }}>
            <Paper elevation={3} sx={{ padding: 3, background: "#efeff1", color: "teal" }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={2} container justifyContent="center" alignItems="center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', width: '100%' }}
                        >
                            <Avatar
                                sx={{ width: 100, height: 100 }}
                                src={employeeData?.profilePicture || 'https://via.placeholder.com/120'}
                                alt={employeeData?.name || 'Employee Profile Picture'}
                                style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' }}
                            />
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} sm={9}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Typography variant="h5" gutterBottom style={{ color: "teal" }}>
                                {employeeData?.Name || 'N/A'} Information
                            </Typography>
                            <Divider sx={{ marginY: 2 }} />
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <Typography variant="body1">EmpId: {employeeData?.EmpId || 'N/A'}</Typography>
                                    <Typography variant="body1">Email: {employeeData?.EmailId || 'N/A'}</Typography>
                                    <Typography variant="body1">Phone: {employeeData?.Mobile || 'N/A'}</Typography>
                                </div>
                                <div>
                                    <Typography variant="body1">Name: {employeeData?.Name || 'N/A'}</Typography>
                                    <Typography variant="body1">Role: {employeeData?.Role || 'N/A'}</Typography>
                                    <Typography variant="body1">Shift: {employeeData?.Shift || 'N/A'}</Typography>
                                </div>
                                <div>
                                    <Typography variant="body1">RM: {employeeData?.RM || 'N/A'}</Typography>
                                </div>
                            </div>
                        </motion.div>
                    </Grid>
                </Grid>
                <Divider sx={{ marginY: 2 }} />

                {/* Tabs Section */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="inherit"
                    variant="fullWidth"
                    sx={{ marginBottom: 3 }}
                >
                    <Tab label="Leave" />
                    <Tab label="Expense" />
                    <Tab label="Attendance" />
                    {/* <Tab label="Salary" />
                    <Tab label="Assets" /> */}

                </Tabs>

                {/* Tab Panels */}
                {activeTab === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}

                        style={{ display: "flex", justifyContent: "space-around" }}
                    >

                       
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1">SL: {leaveDetails?.SL || 0}</Typography>
                            <LinearProgress variant="determinate" value={(leaveDetails?.SL / 12) * 100} sx={{ backgroundColor: "teal" }} />
                        </Box>
                        
                    </motion.div>
                )}
                {activeTab === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-around" }}>

                            <Typography variant="body1">Total Approved: ₹{totalApproved.toFixed(2)}</Typography>
                            <Typography variant="body1">Total Rejected: ₹{totalRejected.toFixed(2)}</Typography>
                            <Typography variant="body1">Total Pending: ₹{totalPending.toFixed(2)}</Typography>

                        </div>

                        <Divider sx={{ marginY: 2 }} />

                        <List>
                            {expenseDetails && expenseDetails.map((expense) => (
                                <ListItem key={expense.detailId} sx={{ marginY: 1 }}>
                                    <ListItemAvatar>
                                        <Avatar alt="Expense Image" src={expense.image} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${expense.expenseType} - ₹${expense.expenseAmount}`}
                                        secondary={`Date: ${expense.expenseDate} | Status: ${expense.Status}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </motion.div>
                )}

                {activeTab === 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >

                        <Typography variant="body1">Total Working Hours This Week: {totalWorkingHours.toFixed(2)} hours</Typography>

                        <Divider sx={{ marginY: 2 }} />

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell> In</TableCell>
                                    <TableCell> Out</TableCell>
                                    <TableCell>Working Hours</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredAttendance.map((day, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{day.date}</TableCell>
                                        <TableCell>{day.firstInTime}</TableCell>
                                        <TableCell>{day.lastOutTime}</TableCell>
                                        <TableCell>{day.workingHours} hrs</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </motion.div>
                )}
                {activeTab === 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Typography variant="h5">Salary Details</Typography>
                        <Typography variant="body1">Salary data will be shown here...</Typography>
                    </motion.div>
                )}
                {activeTab === 4 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <List>
                            {assetDetails && assetDetails.map((asset) => (
                                <ListItem key={assetDetails.id} sx={{ marginY: 1 }}>
                                    <ListItemAvatar>
                                        <Avatar alt="Asset Image" src={asset.image} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${asset.asset_name} - ${asset.make_name}`}
                                        secondary={`Model Name: ${asset.model_name} | Serial Number: ${asset.serial_number}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </motion.div>
                )}
            </Paper>
        </Box>
    );
};

export default EmployeeData;
