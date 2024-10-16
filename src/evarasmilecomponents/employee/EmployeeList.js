import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Typography,
    IconButton,
    Grid,
    TablePagination,
    Box,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [offices, setOffices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDetail, setOpenDetail] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({
        EmpId: '',
        Name: '',
        Password: '',
        Mobile: '',
        EmailId: '',
        Role: '',
        OTP: '',
        IsOTPExpired: 1,
        IsGeofence: 0,
        Tenent_Id: null,
        IsActive: 1,
        OfficeId: null,
        OfficeName: '',
        LatLong: '',
        Distance: '',
        OfficeIsActive: 1,
        RM: '',
        Shift: ''
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    


    useEffect(() => {
        fetchEmployees();
        fetchOffices();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/EvaraBackend/SalesSmile/src/employee/list_employee.php');
            console.log('Employees response:', response.data); // Debugging line
            if (response.data.success) {
                setEmployees(response.data.data);
            } else {
                console.error('Error fetching employees:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchOffices = async () => {
        try {
            const response = await axios.get('https://namami-infotech.com/EvaraBackend/SalesSmile/src/employee/get_office.php');
            console.log('Offices response:', response.data); // Debugging line
            if (response.data.success) {
                setOffices(response.data.data);
            } else {
                console.error('Error fetching offices:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching offices:', error);
        }
    };


    const handleCloseDetail = () => {
        setOpenDetail(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenForm = (mode, employee = null) => {
        setFormMode(mode);
        if (mode === 'edit' && employee) {
            setFormData({
                EmpId: employee.EmpId,
                Name: employee.Name,
                Password: '', // Assuming Password is not updated on edit
                Mobile: employee.Mobile,
                EmailId: employee.EmailId,
                Role: employee.Role,
                OTP: employee.OTP,
                IsOTPExpired: employee.IsOTPExpired || 1,
                IsGeofence: employee.IsGeofence || 0,
                Tenent_Id: employee.Tenent_Id || 123, // Default value if not present
                IsActive: employee.IsActive || 1,
                OfficeId: employee.OfficeId || null,
                OfficeName: employee.OfficeName || '',
                LatLong: employee.LatLong || '',
                Distance: employee.Distance || '',
                OfficeIsActive: employee.OfficeIsActive || 1,
                RM: employee.RM,
                Shift: employee.Shift
            });
        } else {
            setFormData({
                EmpId: '',
                Name: '',
                Password: '',
                Mobile: '',
                EmailId: '',
                Role: '',
                OTP: '123456', // Default OTP
                IsOTPExpired: 1,
                IsGeofence: 0,
                Tenent_Id: 123, // Default Tenant ID
                IsActive: 1,
                OfficeId: null,
                OfficeName: '',
                LatLong: '',
                Distance: '',
                OfficeIsActive: 1,
                RM: '',
                Shift: ''
            });
        }
        setOpenForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Ensure all required fields are populated
        const requiredFields = ['EmpId', 'Name', 'Password', 'Mobile', 'EmailId', 'Role', 'OfficeName', 'LatLong', 'Distance'];
        for (let field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in all required fields. Missing: ${field}`);
                return;
            }
        }

        const formattedFormData = {
            EmpId: formData.EmpId,
            Name: formData.Name,
            Password: formData.Password,
            Mobile: formData.Mobile,
            EmailId: formData.EmailId,
            Role: formData.Role,
            OTP: formData.OTP || '123456', // Provide a default OTP if not provided
            IsOTPExpired: formData.IsOTPExpired || 1,
            IsGeofence: formData.IsGeofence || 0,
            Tenent_Id: formData.Tenent_Id || 123,
            IsActive: formData.IsActive || 1,
            RM: formData.RM,
            Shift: formData.Shift,
            DOB: formData.DOB || '', // Default value if DOB is not provided
            JoinDate: formData.JoinDate || '', // Default value if JoinDate is not provided
            Offices: [
                {
                    OfficeName: formData.OfficeName,
                    LatLong: formData.LatLong
                }
            ]
        };

        console.log('Formatted Form Data:', formattedFormData); // Log formatted data

        const url = formMode === 'add'
            ? 'https://namami-infotech.com/EvaraBackend/SalesSmile/src/employee/add_employee.php'
            : 'https://namami-infotech.com/EvaraBackend/SalesSmile/src/employee/edit_employee.php';

        try {
            const response = await axios.post(url, formattedFormData);
            console.log('Response:', response.data); // Log response data
            if (response.data.success) {
                handleCloseForm();
                fetchEmployees();
            } else {
                console.error('Error:', response.data.message);
            }
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    const handleOfficeChange = (event) => {
        const selectedOfficeId = event.target.value;
        console.log('Selected Office ID:', selectedOfficeId); // Debugging line

        const selectedOffice = offices.find(o => o.Id === selectedOfficeId);
        console.log('Selected Office:', selectedOffice); // Debugging line

        setFormData(prevFormData => ({
            ...prevFormData,
            OfficeId: selectedOfficeId,
            OfficeName: selectedOffice?.OfficeName || '',
            LatLong: selectedOffice?.LatLong || '',
            Distance: selectedOffice?.Distance || ''
        }));
    };

    const handleCloseForm = () => {
        setOpenForm(false);
    };

    const handleDisableEmployee = async (employee) => {
        if (!employee || !employee.EmpId) {
            console.error('Please provide both Employee ID and action');
            return;
        }
        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/SalesSmile/src/employee/disable_employee.php', {
                EmpId: employee.EmpId,
                action: 'disable'
            });
            if (response.data.success) {
                fetchEmployees();
            } else {
                console.error('Error:', response.data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredEmployees = employees.filter(employee => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return Object.keys(employee).some(key =>
            employee[key].toString().toLowerCase().includes(lowerCaseSearchTerm)
        );
    });

    

    return (
        <div>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search Employee"
                        margin="normal"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ backgroundColor: "teal" }}
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenForm('add')}
                    >
                        Add Employee
                    </Button>
                </Grid>
            </Grid>
            <Box sx={{ overflowX: 'auto', mt: 2 }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead style={{ backgroundColor: "teal" }}>
                            <TableRow>
                                <TableCell style={{ color: "white" }}>EmpID</TableCell>
                                <TableCell style={{ color: "white" }}>Name</TableCell>
                                <TableCell style={{ color: "white" }}>Mobile</TableCell>
                                <TableCell style={{ color: "white" }}>Email</TableCell>
                                <TableCell style={{ color: "white" }}>Role</TableCell>
                                {/* <TableCell style={{ color: "white" }}>RM</TableCell> */}
                                <TableCell style={{ color: "white" }}>Shift</TableCell>
                                <TableCell style={{ color: "white" }}>Status</TableCell>
                                <TableCell style={{ color: "white" }}>Actions</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(employee => (

                                <TableRow key={employee.EmpId}>

                                    <TableCell component={Link} to={employee.EmpId} style={{ textDecoration: 'none' }}>{employee.EmpId}</TableCell>

                                    <TableCell component={Link} to={employee.EmpId} style={{ textDecoration: 'none' }}>{employee.Name}</TableCell>
                                    <TableCell component={Link} to={employee.EmpId} style={{ textDecoration: 'none' }}>{employee.Mobile}</TableCell>
                                    <TableCell component={Link} to={employee.EmpId} style={{ textDecoration: 'none' }}>{employee.EmailId}</TableCell>
                                    <TableCell component={Link} to={employee.EmpId} style={{ textDecoration: 'none' }}>{employee.Role}</TableCell>
                                    {/* <TableCell>{employee.RM}</TableCell> */}
                                    <TableCell>{employee.Shift}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color={employee.IsActive ? "green" : "red"}
                                        >
                                            {employee.IsActive ? 'Active' : 'Inactive'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{display:"flex"}}>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenForm('edit', employee)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDisableEmployee(employee)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                       
                                       
                                    </TableCell>
                                </TableRow>

                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredEmployees.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
            <Dialog open={openForm} onClose={handleCloseForm}>
                <DialogTitle>{formMode === 'add' ? 'Add Employee' : 'Edit Employee'}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleFormSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Employee ID"
                                    value={formData.EmpId}
                                    onChange={(e) => setFormData({ ...formData, EmpId: e.target.value })}
                                    required
                                    disabled={formMode === 'edit'}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={formData.Name}
                                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    value={formData.Password}
                                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Mobile"
                                    value={formData.Mobile}
                                    onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.EmailId}
                                    onChange={(e) => setFormData({ ...formData, EmailId: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Role"
                                    value={formData.Role}
                                    onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="RM"
                                    value={formData.RM}
                                    onChange={(e) => setFormData({ ...formData, RM: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Date of Birth (YYYY-MM-DD)"
                                    value={formData.DOB}
                                    onChange={(e) => setFormData({ ...formData, DOB: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Date of Joining"
                                    value={formData.JoinDate}
                                    onChange={(e) => setFormData({ ...formData, JoinDate: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Shift</InputLabel>
                                    <Select
                                        value={formData.Shift}
                                        onChange={(e) => setFormData({ ...formData, Shift: e.target.value })}
                                        label="Shift"
                                    >
                                        <MenuItem value="9:00 AM - 6:00 PM">9:00 AM - 6:00 PM</MenuItem>
                                        <MenuItem value="9:30 AM - 6:30 PM">9:30 AM - 6:30 PM</MenuItem>
                                        <MenuItem value="10:00 AM - 7:00 PM">10:00 AM - 7:00 PM</MenuItem>
                                        <MenuItem value="11:00 AM - 8:00 PM">11:00 AM - 8:00 PM</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Office</InputLabel>
                                    <Select
                                        value={formData.OfficeId || ''}
                                        onChange={handleOfficeChange}
                                        label="Office"
                                    >
                                        {offices.map(office => (
                                            <MenuItem key={office.Id} value={office.Id}>
                                                {office.OfficeName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Latitude/Longitude"
                                    value={formData.LatLong}
                                    onChange={(e) => setFormData({ ...formData, LatLong: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Distance"
                                    value={formData.Distance}
                                    onChange={(e) => setFormData({ ...formData, Distance: e.target.value })}
                                    required
                                />
                            </Grid>
                        </Grid>
                        <DialogActions>
                            <Button onClick={handleCloseForm} color="primary">Cancel</Button>
                            <Button onClick={handleCloseForm} type="submit" color="primary">Submit</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={openDetail} onClose={handleCloseDetail}>
                <DialogTitle>Employee Details</DialogTitle>
                <DialogContent>
                    {/* You can add employee details here */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetail} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
}

export default EmployeeList;
