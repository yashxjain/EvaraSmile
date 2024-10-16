// src/pages/Dealer.js

import React, { useState } from 'react';
import { Box, useMediaQuery, Button } from '@mui/material';
import Navbar from '../evarasmilecomponents/Navbar';
import Sidebar from '../evarasmilecomponents/Sidebar';
import VisitTable from '../evarasmilecomponents/dealers/VisitTable';

function Visit() {
    const [isVisitOpen, setIsVisitOpen] = useState(false);
    const [isAddDealerOpen, setIsAddDealerOpen] = useState(false);
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
                  
                   <VisitTable />
                </Box>
            </Box>
        </Box>
    );
}

export default Visit;
