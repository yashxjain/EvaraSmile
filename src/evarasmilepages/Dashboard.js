import React from 'react';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import { Box, useMediaQuery, Container, Grid } from '@mui/material';
import DashboardData from '../evarasmilecomponents/dashboard/DashboardData';

function Dashboard() {
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
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{ mt: 4 }}>
                                <DashboardData />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

export default Dashboard;
