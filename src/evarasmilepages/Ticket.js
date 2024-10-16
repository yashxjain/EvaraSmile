import React from 'react';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import { useAuth } from '../evarasmilecomponents/auth/AuthContext';
import ViewTickets from '../evarasmilecomponents/ticket/ViewTickets';



function Ticket() {
    const { user } = useAuth();

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




                    <br />
                    <br />
                    {/* Uncomment and update the ViewLeave component as needed */}
                    {user && user.emp_id && <ViewTickets empId={user.emp_id} />}
                </div>
            </Box>
        </Box>
    );
}

export default Ticket;
