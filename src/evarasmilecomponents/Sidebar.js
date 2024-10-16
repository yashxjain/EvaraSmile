import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, Box, Slide } from '@mui/material';
import HRSmileLogo from '../evarasmileassets/HRSmileLogo.png';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useAuth } from './auth/AuthContext';

function Sidebar({ mobileOpen, onDrawerToggle }) {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuth();

    const routes = [
        { path: '/evara-smile-dashboard', name: 'Dashboard' },
        { path: '/evara-smile-holiday', name: 'Holiday' },
        { path: '/evara-smile-policy', name: 'Policy' },
        { path: '/evara-smile-attendance', name: 'Attendance' },
        { path: '/evara-smile-notification', name: 'Notification' },
        { path: '/evara-smile-leave', name: 'Leave' },
        { path: '/evara-smile-expense', name: 'Expense' },
        { path: '/evara-smile-visit', name: 'Visit' },
    ];

    // Conditionally include the "Employees" tab based on the user's role
    if (user && user.role === 'HR') {
        routes.splice(1, 0, { path: '/evara-smile-employees', name: 'Employees' });
    }

    const drawer = (
        <Box
            sx={{
                width: 240,
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                bgcolor: 'teal',
                overflow: 'hidden',
            }}
        >
            {/* Fixed logo area */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <img src={HRSmileLogo} alt="HRMS Logo" style={{ width: '150px', marginBottom: '20px' }} />
            </Box>

            {/* Scrollable list area without visible scrollbar */}
            <Box sx={{ overflowX: 'auto', flex: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                <List>
                    {routes.map((route, index) => (
                        <ListItem
                            button
                            key={index}
                            component={Link}
                            to={route.path}
                            sx={{
                                backgroundColor: location.pathname === route.path ? 'white' : 'transparent',
                                color: location.pathname === route.path ? 'orange' : 'white',
                                '&:hover': {
                                    backgroundColor: 'orange',
                                    color: 'white',
                                },
                                transition: 'background-color 0.3s ease, color 0.3s ease',
                                borderRadius: '10px',
                            }}
                            onClick={isMobile ? onDrawerToggle : null}
                        >
                            <ListItemText primary={route.name} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <Slide direction="left" in={mobileOpen} mountOnEnter unmountOnExit>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={onDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 240,
                            zIndex: theme.zIndex.appBar + 1,
                            backgroundColor: 'teal',
                            overflowY: 'hidden',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Slide>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 240,
                        backgroundColor: 'teal',
                        overflowY: 'hidden',
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
}

export default Sidebar;
