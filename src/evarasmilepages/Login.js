import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../evarasmilecomponents/auth/AuthContext';
import {
    Container, TextField, Button, Box, Typography, Avatar, CircularProgress, Grid, IconButton, InputAdornment,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import logo from '../evarasmileassets/HRSmileLogo.png';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#f50057',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

function Login() {
    const [empId, setEmpId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/SalesSmile/src/auth/login.php', {
                EmpId: empId,
                password: password,
            });

            if (response.data.success) {
                login(response.data.data);
                setTimeout(() => {
                    setLoading(false);
                    navigate('/evara-smile-dashboard');
                }, 1500);
            } else {
                setLoading(false);
                setError(response.data.message);
            }
        } catch (error) {
            setLoading(false);
            setError('An error occurred. Please try again.');
            console.error('Login error:', error);
        }
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleForgotPasswordOpen = () => setForgotPasswordOpen(true);

    const handleForgotPasswordClose = () => {
        setForgotPasswordOpen(false);
        setForgotEmail('');
        setForgotPasswordError('');
        setForgotPasswordSuccess('');
    };

    const handleForgotPasswordSubmit = async () => {
        try {
            setLoading(true);
            const response = await axios.post('https://namami-infotech.com/EvaraBackend/SalesSmile/src/auth/forget_password.php', {
                email: forgotEmail,
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'An email with a new password has been sent.',
                }).then(() => {
                    handleForgotPasswordClose(); // Ensure this runs after the SweetAlert2 alert
                });
            } else {
                setForgotPasswordError(response.data.message || 'Unable to send email. Please try again.');
            }
        } catch (error) {
            setForgotPasswordError('An error occurred. Please try again.');
            console.error('Forgot Password error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            {/* Add the following global styles to reset default margins */}
            <style>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    
                    overflow: hidden;
                }
                .background-video {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                   
                    z-index: -1;
                    pointer-events: none; /* Prevent any interaction with the video */
                }
            `}</style>

            <Box sx={{ position: 'relative', minHeight: '100vh', minWidth: '100vw', overflow: 'hidden' }}>
                {/* Background Video */}
                <iframe
                    className="background-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    style={{ width: "1770.27px",height: "997.333px"}}
                />

                {/* Content Area */}
                <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} md={6}>
                            {/* Semi-Transparent White Card for Login Form */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img
    src={logo}
    alt="Pushpratan Logo"
    style={{
        width: '150px',
        marginBottom: '20px',
    }}
/>

                                    <Avatar sx={{ m: 1, bgcolor: 'teal' }}>
                                        <LockOutlinedIcon />
                                    </Avatar>
                                    
                                    {error && (
                                        <Typography variant="body2" color="error" align="center">
                                            {error}
                                        </Typography>
                                    )}
                                    <form onSubmit={handleLogin} style={{ width: '100%' }}>
                                        <TextField
                                            fullWidth
                                            label="Username"
                                            margin="normal"
                                            variant="outlined"
                                            value={empId}
                                            onChange={(e) => setEmpId(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            margin="normal"
                                            variant="outlined"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickShowPassword}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            style={{ backgroundColor: "teal" }}
                                            type="submit"
                                            sx={{ mt: 3, py: 1.5 }}
                                            disabled={loading}
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'Login'}
                                        </Button>
                                    </form>

                                    <Button variant="text" color="primary" sx={{ mt: 2 }} onClick={handleForgotPasswordOpen}>
                                        Forgot Password?
                                    </Button>
                                </Box>
                        </Grid>
                    </Grid>
                </Container>

                {/* Forgot Password Dialog */}
                <Dialog open={forgotPasswordOpen} onClose={handleForgotPasswordClose}>
                    <DialogTitle>Forgot Password</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Enter your email address and we'll send you a new password to reset your password.
                        </DialogContentText>
                        {forgotPasswordError && (
                            <Typography variant="body2" color="error">
                                {forgotPasswordError}
                            </Typography>
                        )}
                        {forgotPasswordSuccess && (
                            <Typography variant="body2" color="success">
                                {forgotPasswordSuccess}
                            </Typography>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Email Address"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleForgotPasswordClose} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleForgotPasswordSubmit} color="primary" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}

export default Login;
