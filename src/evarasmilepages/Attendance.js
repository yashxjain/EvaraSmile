import React from 'react';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import AttendanceList from '../evarasmilecomponents/activity/AttendanceList';


function Attendance() {
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 225;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Navbar />
                <Box sx={{ mt: 4 }}>
                    <AttendanceList />
                </Box>
            </Box>
        </Box>
    );
}

export default Attendance;
