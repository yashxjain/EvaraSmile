import React from 'react';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import AddHoliday from '../evarasmilecomponents/holiday/AddHoliday';
import ViewHoliday from '../evarasmilecomponents/holiday/ViewHoliday';

import { useAuth } from '../evarasmilecomponents/auth/AuthContext';

function Holiday() {
    const { user } = useAuth(); // Get the current user from the AuthContext
    console.log(user)
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
                    {user && user.role === 'HR' ? <AddHoliday /> : null}

                    <ViewHoliday />
                </div>

            </Box>
        </Box>
    );
}

export default Holiday;
