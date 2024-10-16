import React from 'react';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import PolicyList from '../evarasmilecomponents/policy/PolicyList';
import AddPolicy from '../evarasmilecomponents/policy/AddPolicy'


function Policy() {

    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 25;
    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, ml: drawerWidth }}>
                <Navbar />
                <div style={{ marginTop: "20px" }}>
                    <AddPolicy />
                    <PolicyList />
                </div>

            </Box>
        </Box>
    );
}

export default Policy;
