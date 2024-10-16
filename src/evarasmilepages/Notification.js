import React from 'react';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import AddNotification from '../evarasmilecomponents/notification/AddNotification';
import ViewNotifications from '../evarasmilecomponents/notification/ViewNotification';



function Notification() {

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
                    <AddNotification />

                    <ViewNotifications />
                </div>

            </Box>
        </Box>
    );
}

export default Notification;
