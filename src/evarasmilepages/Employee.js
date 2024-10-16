import React from 'react';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import EmployeeList from '../evarasmilecomponents/employee/EmployeeList';

function Employee() {
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 240;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Navbar />
                <Box sx={{ mt: 4 }}>
                    <EmployeeList />
                </Box>
            </Box>
        </Box>
    );
}

export default Employee;
