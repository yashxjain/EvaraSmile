import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    useMediaQuery
} from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../auth/AuthContext';

const locales = {
    'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date()),
    getDay,
    locales
});

const CustomEvent = ({ event }) => (
    <div style={{ padding: '5px' }}>
        <strong>First In:</strong> {event.firstIn} <br />
        <strong>Last Out:</strong> {event.lastOut} <br />
        <strong>Hours:</strong> {event.workingHours}
    </div>
);

const generateMapUrl = (geoLocation) => {
    if (!geoLocation) {
        return '#'; // Return a dummy link or handle it as needed
    }

    const [latitude, longitude] = geoLocation.split(',');

    // Check if latitude and longitude are present after splitting
    if (!latitude || !longitude) {
        return '#'; // Handle missing latitude or longitude
    }

    // Ensure latitude and longitude are valid numbers
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
        return '#'; // Handle invalid latitude or longitude
    }

    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&zoom=15&basemap=satellite&markercolor=red`;
};

const AttendanceList = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState(user.role === 'HR' ? '' : user.emp_id);
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('calendar');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const isMobile = useMediaQuery('(max-width:600px)');

    const getShiftStartTime = (shift) => {
        const [startTime] = shift.split(' - ');
        return startTime;
    };

    const parseTime = (timeString) => {
        const [time, modifier] = timeString.split(' ');
        let [hours, minutes] = time.split(':');

        // Ensure hours is a string before calling padStart
        hours = String(hours);

        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM' && hours !== '12') {
            hours = String(parseInt(hours, 10) + 12);
        } else if (modifier === 'AM' && hours === '12') {
            hours = '00';
        }

        return `${hours.padStart(2, '0')}:${minutes}`;
    };

    const compareTimes = (attendanceTime, shiftTime) => {
        if (attendanceTime === 'N/A') {
            return 'red';
        }

        const shiftStartTime = parseTime(shiftTime.split(' - ')[0]); // Convert shift start time to 24-hour format
        const attendanceTime24 = parseTime(attendanceTime); // Convert attendance time to 24-hour format

        const shiftStart = new Date(`1970-01-01T${shiftStartTime}:00`);
        const attendance = new Date(`1970-01-01T${attendanceTime24}:00`);

        const diffInMinutes = (attendance - shiftStart) / (1000 * 60); // Difference in minutes

        // Time comparison logic
        if (diffInMinutes >= -10) {
            // Early or on time within 10 minutes
            return 'green';
        } else {
            // Late by more than 30 minutes
            return 'red';
        }
    };



    useEffect(() => {
        if (user.role === 'HR') {
            const fetchEmployees = async () => {
                try {
                    const response = await axios.get('https://namami-infotech.com/EvaraBackend/SalesSmile/src/employee/list_employee.php');
                    setEmployees(response.data.data);
                } catch (error) {
                    setError('Error fetching employee list: ' + error.message);
                }
            };
            fetchEmployees();
        }
    }, [user.role]);

    useEffect(() => {
        const fetchAttendance = async () => {
            setError(null);

            try {
                const response = await axios.get(
                    `https://namami-infotech.com/EvaraBackend/SalesSmile/src/attendance/view_attendance.php`,
                    { params: { EmpId: selectedEmpId } }
                );

                if (response.data.success) {
                    const attendanceData = response.data.data.map(activity => {
                        const [day, month, year] = activity.date.split('/');
                        const formattedDate = new Date(`${year}-${month}-${day}`);

                        const shiftStartTime = getShiftStartTime(user.shift); // Parse shift start time from user
                        const eventColor = compareTimes(shiftStartTime, activity.firstIn); // Compare times and get color

                        return {
                            title: `First In: ${activity.firstIn}, Last Out: ${activity.lastOut}, Hours: ${activity.workingHours}`,
                            start: formattedDate,
                            end: formattedDate,
                            firstIn: activity.firstIn,
                            lastOut: activity.lastOut,
                            firstInLocation: activity.firstInLocation,
                            lastOutLocation: activity.lastOutLocation,
                            workingHours: activity.workingHours,
                            allDay: true,
                            color: eventColor,
                            firstEvent: activity.firstEvent
                        };
                    });
                    attendanceData.forEach((record) => {
                        const attendanceColor = compareTimes(record.firstIn, user.shift);
                        console.log(`Date: ${record.date}, First In: ${record.firstIn}, Color: ${attendanceColor}`);
                    });
                    setActivities(attendanceData);
                } else {
                    setError('Failed to fetch attendance data');
                }
            } catch (error) {
                setError('Error fetching attendance: ' + error.message);
            }
        };

        if (selectedEmpId) {
            fetchAttendance();
        }
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const exportToCsv = () => {
        const csvRows = [
            ['Emp ID', 'Date', 'In', 'Out', 'Working Hours', 'Last Event'],
        ];

        activities.forEach(({ empId, date, firstIn, lastOut, lastOutLocation, workingHours, lastEvent }) => {
            csvRows.push([empId, date, firstIn, lastOut, lastOutLocation, workingHours, lastEvent]);
        });

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'attendance.csv');
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
           
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                     {user.role === 'HR' && (
                    <FormControl variant="outlined" sx={{ mb: 2, width: "200px" }}>
                        <InputLabel id="select-empId-label">Select Employee</InputLabel>
                        <Select
                            labelId="select-empId-label"
                            value={selectedEmpId}
                            onChange={(e) => setSelectedEmpId(e.target.value)}
                            label="Select Employee"
                            sx={{ borderColor: "white" }}
                        >
                            {employees.map(employee => (
                                <MenuItem key={employee.EmpId} value={employee.EmpId}>
                                    {employee.Name} ({employee.EmpId})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    )}
                    <div

                        style={{
                            color: "teal",
                            fontSize: '1rem',
                            cursor: "pointer"
                        }}
                        onClick={() => setViewMode(viewMode === 'calendar' ? 'table' : 'calendar')}
                    >
                        {viewMode === 'calendar' ? 'View in Tabular Form' : 'View in Calendar Form'}
                    </div>

                </div>
            

            {error && <Alert severity="error">{error}</Alert>}

            {viewMode === 'calendar' ? (
                <div style={{ height: '600px' }}>
                    <Calendar
                        localizer={localizer}
                        events={activities}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 580, color: "#000000" }}
                        components={{ event: CustomEvent }}
                        views={{ month: true, agenda: true }}
                        defaultView="month"
                        eventPropGetter={(event) => ({
                            style: {
                                backgroundColor: event.color, // Use the color from the event
                                color: '#fff',
                                fontSize: "10px"
                            }
                        })}
                        defaultDate={new Date()}
                    />
                </div>
            ) : (
                <div>
                    <Button
                        variant="contained"
                        style={{ backgroundColor: "teal", color: "white" }}
                        onClick={exportToCsv}
                        sx={{ m: 2 }}
                    >
                        Export to CSV
                    </Button>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead style={{ backgroundColor: "teal" }}>
                                    <TableRow>
                                        <TableCell style={{ color: "white" }}>Date</TableCell>
                                        {!isMobile && <TableCell style={{ color: "white" }}>Work Mode</TableCell>}
                                        {!isMobile && <TableCell style={{ color: "white" }}>In</TableCell>}
                                        {!isMobile && <TableCell style={{ color: "white" }}>Out</TableCell>}
                                        <TableCell style={{ color: "white" }}>Working Hours</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {activities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((activity, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{format(activity.start, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{(activity.firstEvent)} </TableCell>
                                            {!isMobile && (
                                                <TableCell>
                                                    <a
                                                        href={generateMapUrl(activity.firstInLocation)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'teal', textDecoration: 'none' }}
                                                    >
                                                        {activity.firstIn}
                                                    </a>
                                                </TableCell>
                                            )}
                                            {!isMobile && (
                                                <TableCell>
                                                    <a
                                                        href={generateMapUrl(activity.lastOutLocation)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'teal', textDecoration: 'none' }}
                                                    >
                                                        {activity.lastOut}
                                                    </a>
                                                </TableCell>
                                            )}
                                            <TableCell>{activity.workingHours}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={activities.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </div>
            )}
        </>
    );
};


export default AttendanceList;
