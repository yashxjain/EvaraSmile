import React, { useState } from 'react';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import { Box, Button, useMediaQuery } from '@mui/material';
import ApplyLeave from '../evarasmilecomponents/leave/ApplyLeave';
import ViewLeave from '../evarasmilecomponents/leave/ViewLeave';
import { useAuth } from '../evarasmilecomponents/auth/AuthContext'; // Assuming AuthContext is where you get user info


function Leave() {
    const { user } = useAuth();
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 25;
    const [openApplyLeaveDialog, setOpenApplyLeaveDialog] = useState(false);

    const handleOpenApplyLeaveDialog = () => setOpenApplyLeaveDialog(true);
    const handleCloseApplyLeaveDialog = () => setOpenApplyLeaveDialog(false);

    const handleLeaveApplied = () => {
        // Handle the leave application success here if needed
        // For example, showing a confirmation message or refreshing data
        handleCloseApplyLeaveDialog();
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, ml: drawerWidth }}>
                <Navbar />
                <div style={{ marginTop: "20px" }}>
                    <Button variant="contained" color="primary" onClick={handleOpenApplyLeaveDialog} style={{ backgroundColor: "teal" }}>
                        Apply for Leave
                    </Button>
                    <ApplyLeave
                        open={openApplyLeaveDialog}
                        onClose={handleCloseApplyLeaveDialog}
                        onLeaveApplied={handleLeaveApplied}
                    />
                    {user && user.emp_id && <ViewLeave EmpId={user.emp_id} />}
                </div>
            </Box>
        </Box>
    );
}

export default Leave;
