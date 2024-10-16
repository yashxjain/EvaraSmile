import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

function VisitTable() {
    const [visits, setVisits] = useState([]);
    const { user } = useAuth();
    const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [markers, setMarkers] = useState([]);
    const [directions, setDirections] = useState(null); // Store directions data
    const [distances, setDistances] = useState([]); // Store the calculated distances
    const [employees, setEmployees] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState(user.role === 'HR' ? '' : user.emp_id);

    useEffect(() => {
       const fetchVisits = async () => {
    try {
        const response = await axios.get(`https://namami-infotech.com/EvaraBackend/SalesSmile/src/visit/view_visit.php?empId=${selectedEmpId}`);
        if (response.data.success) {
            setVisits(response.data.data);
        } else {
            console.error('Failed to fetch visits');
        }
    } catch (err) {
        console.error('Error fetching visits:', err);
    }
};

        fetchVisits();
    }, [selectedEmpId]);

    useEffect(() => {
        // Clear previous markers and directions whenever the date changes
        setMarkers([]);
        setDirections(null);
        setDistances([]);

        const filteredVisits = visits.filter(visit => {
            const visitDate = new Date(visit.VisitTime).toLocaleDateString();
            return visitDate === selectedDate.toLocaleDateString();
        });

        const newMarkers = [];
        const positionCount = {}; // Keep track of the count of positions

        filteredVisits.forEach((visit, index) => {
            const latLong = visit.VisitLatLong.split(',').map(coord => parseFloat(coord.trim()));
            const key = latLong.join(',');

            // Increment the count for this position
            if (!positionCount[key]) {
                positionCount[key] = 0;
            }
            positionCount[key] += 1;

            // Create a slight offset based on the count
            const offset = positionCount[key] * 0.0001; // Adjust the value to suit your needs
            const markerPosition = {
                lat: latLong[0] + offset,
                lng: latLong[1] + offset,
            };

            newMarkers.push({
                ...markerPosition,
                label: `${String.fromCharCode(65 + index)}`, // Include visit time in the label
            });
        });

        setMarkers(newMarkers);
    }, [selectedDate, visits]);
 useEffect(() => {
        if (user.role === 'HR') {
            const fetchEmployees = async () => {
                try {
                    const response = await axios.get('https://namami-infotech.com/EvaraBackend/SalesSmile/src/employee/list_employee.php');
                    setEmployees(response.data.data);
                } catch (error) {
                    console.log('Error fetching employee list: ' + error.message);
                }
            };
            fetchEmployees();
        }
    }, [user.role]);
    // Calculate real route directions using DirectionsService
    useEffect(() => {
        if (markers.length > 1) {
            const origin = { lat: markers[0].lat, lng: markers[0].lng };
            const destination = { lat: markers[markers.length - 1].lat, lng: markers[markers.length - 1].lng };
            const waypoints = markers.slice(1, markers.length - 1).map(marker => ({
                location: { lat: marker.lat, lng: marker.lng },
                stopover: true,
            }));

            const service = new window.google.maps.DirectionsService();

            service.route(
                {
                    origin,
                    destination,
                    waypoints,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (response, status) => {
                    if (status === "OK") {
                        setDirections(response); // Set the directions response to display the route
                        const totalDistances = response.routes[0].legs.map(leg => leg.distance.text);
                        setDistances(totalDistances); // Store the distances between each leg
                    } else {
                        console.error('Error calculating directions:', status);
                    }
                }
            );
        }
    }, [markers]);

    const handleDateChange = (event) => {
        setSelectedDate(new Date(event.target.value));
    };

    const createGoogleMapsLink = (locations) => {
        const baseUrl = "https://www.google.com/maps/dir/";
        const formattedLocations = locations.join("/");
        return `${baseUrl}${formattedLocations}`;
    };

    const generateMapsLink = () => {
        if (markers.length > 0) {
            const locations = markers.map(marker => `${marker.lat},${marker.lng}`);
            return createGoogleMapsLink(locations);
        }
        return '';
    };

    return (
        <>
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
            <TextField
                type="date"
                value={selectedDate.toISOString().substr(0, 10)}
                onChange={handleDateChange}
                variant="outlined"
            />
            <br/> <br/>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead style={{ backgroundColor: "teal" }}>
                        <TableRow>
                            <TableCell style={{ color: "white" }}><Typography variant="h6">Dealer Name</Typography></TableCell>
                            <TableCell style={{ color: "white" }}><Typography variant="h6">Visit Time</Typography></TableCell>
                            <TableCell style={{ color: "white" }}><Typography variant="h6">Visit S.No</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visits.filter(visit => {
                            const visitDate = new Date(visit.VisitTime).toLocaleDateString();
                            return visitDate === selectedDate.toLocaleDateString();
                        }).map((visit, index) => (
                            <TableRow key={`${visit.DealerID}-${index}`}>
                                <TableCell>{visit.DealerName}</TableCell>
                                <TableCell>{new Date(visit.VisitTime).toLocaleString()}</TableCell>
                                <TableCell>{visit.VisitCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <br />
            <LoadScript googleMapsApiKey="AIzaSyBtEmyBwz_YotZK8Iabl_nQQldaAtN0jhM">
                <GoogleMap
                    mapContainerStyle={{ height: "400px", width: "100%" }}
                    zoom={10}
                    center={markers.length > 0 ? markers[0] : mapCenter} // Default center if no markers
                >
                    {markers.map((position, index) => (
                        <Marker
                            key={index}
                            position={position}
                            label={{ text: position.label, color: "white" }} // Label for the marker
                        />
                    ))}
                    {directions && (
                        <DirectionsRenderer
                            directions={directions} // Render the calculated directions
                        />
                    )}
                </GoogleMap>
            </LoadScript>
            <br />
            {distances.length > 0 && (
                <div>
                    <Typography variant="h6">Distances Between Visits:</Typography>
                    {distances.map((distance, index) => (
                        <Typography key={index}>
                            From {String.fromCharCode(65 + index)} to {String.fromCharCode(66 + index)}: {distance}
                        </Typography>
                    ))}
                </div>
            )}
            <br />
            
            <Button
                variant="contained"
                style={{backgroundColor:"teal", color:"white"}}
                onClick={() => window.open(generateMapsLink(), "_blank")}
                disabled={markers.length === 0}
            >
                Open Directions in Google Maps
            </Button>
           
        </>
    );
}

export default VisitTable;
