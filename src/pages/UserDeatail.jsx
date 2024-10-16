import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Avatar,
    IconButton,
} from '@mui/material';
import { useParams } from 'react-router-dom';

const UserDetail = () => {
    const [user, setUser] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editedUser, setEditedUser] = useState({});
    const { userId } = useParams();
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setOpenImageDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenImageDialog(false);
        setSelectedImage(null);
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(
                    `https://namami-infotech.com/EvaraBackend/src/user/get_user.php?user_id=${userId}`
                );
                if (response.data.message === 'User details fetched successfully') {
                    setUser(response.data.user);
                    setEditedUser(response.data.user); // Initialize editedUser with current user data
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, [userId]);

    const handleEditClick = () => {
        setEditOpen(true);
    };

    const handleClose = () => {
        setEditOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setEditedUser((prevState) => ({
            ...prevState,
            [name]: files[0], // Handle file uploads
        }));
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(
                `https://namami-infotech.com/EvaraBackend/src/user/edit_user.php`,
                editedUser
            );
            if (response.data.message === 'User updated successfully') {
                setUser(editedUser);
                setEditOpen(false);
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container>
            <Typography variant="h4" style={{ color: "orange" }} gutterBottom>{user.username}'s Profile</Typography>

            <Card sx={{ display: 'flex', p: 2 }}>
                <Avatar
                    alt={user.username}
                    sx={{ width: 100, height: 100, mr: 2 }}
                />
                <CardContent>
                    <Typography variant="h6">User ID: {user.user_id}</Typography>
                    <Typography variant="h6">Username: {user.username}</Typography>
                    <Typography variant="h6">Email: {user.email}</Typography>
                    <Typography variant="h6">Phone Number: {user.phone_number}</Typography>
                    <Typography variant="h6">User Type: {user.user_type}</Typography>
                    <Typography variant="h6">Mailing Address: {user.mailing_address}</Typography>
                    <Typography variant="h6">Delivery Address: {user.delivery_address}</Typography>
                </CardContent>
            </Card>

            <Grid container spacing={2} mt={2}>
                {user.gst_doc && (
                    <Grid item xs={6} md={3}>
                        <CardMedia
                            component="img"
                            src={`data:image/jpeg;base64,${user.gst_doc}`} // Assuming gst_doc is base64
                            alt="GST Document"
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }} // Set fixed height and width
                            onClick={() => handleImageClick(user.gst_doc)}
                        />
                        <Typography>GST Document</Typography>
                    </Grid>
                )}
                {user.trade_lic && (
                    <Grid item xs={6} md={3}>
                        <CardMedia
                            component="img"
                            src={`data:image/jpeg;base64,${user.trade_lic}`} // Assuming trade_lic is base64
                            alt="Trade License"
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }} // Set fixed height and width
                            onClick={() => handleImageClick(user.trade_lic)}
                        />
                        <Typography>Trade License</Typography>
                    </Grid>
                )}
                {user.dl_pic && (
                    <Grid item xs={6} md={3}>
                        <CardMedia
                            component="img"
                            src={`data:image/jpeg;base64,${user.dl_pic}`} // Assuming dl_pic is base64
                            alt="DL Picture"
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }} // Set fixed height and width
                            onClick={() => handleImageClick(user.dl_pic)}
                        />
                        <Typography>DL Picture</Typography>
                    </Grid>
                )}
                {user.aadhar_pic && (
                    <Grid item xs={6} md={3}>
                        <CardMedia
                            component="img"
                            src={`data:image/jpeg;base64,${user.aadhar_pic}`} // Assuming aadhar_pic is base64
                            alt="Aadhar Details"
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }} // Set fixed height and width
                            onClick={() => handleImageClick(user.aadhar_pic)}
                        />
                        <Typography>Aadhar Details</Typography>
                    </Grid>
                )}
            </Grid>

            {/* Dialog for viewing larger image */}
            <Dialog open={openImageDialog} onClose={handleCloseDialog} maxWidth="md" style={{ width: '400px' }}>
                <DialogTitle>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleCloseDialog}
                        aria-label="close"
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        *
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedImage && (
                        <CardMedia
                            component="img"
                            src={`data:image/jpeg;base64,${selectedImage}`} // Display larger image
                            alt="Enlarged View"
                            style={{ width: '100%' }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Box mt={3}>
                <Button variant="contained" style={{ backgroundColor: "#008080", color: "orange" }} onClick={handleEditClick}>
                    Edit Profile
                </Button>
            </Box>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onClose={handleClose}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Username"
                        name="username"
                        value={editedUser.username}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        name="email"
                        value={editedUser.email}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Phone Number"
                        name="phone_number"
                        value={editedUser.phone_number}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Mailing Address"
                        name="mailing_address"
                        value={editedUser.mailing_address}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Delivery Address"
                        name="delivery_address"
                        value={editedUser.delivery_address}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="GST No"
                        name="gst_no"
                        value={editedUser.gst_no}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="PAN No"
                        name="pan_no"
                        value={editedUser.pan_no}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    {/* File Uploads */}
                    <Button variant="contained" component="label">
                        Upload GST Document
                        <input type="file" name="gst_doc" hidden onChange={handleFileChange} />
                    </Button>
                    <Button variant="contained" component="label">
                        Upload Trade License
                        <input type="file" name="trade_lic" hidden onChange={handleFileChange} />
                    </Button>
                    <Button variant="contained" component="label">
                        Upload DL Picture
                        <input type="file" name="dl_pic" hidden onChange={handleFileChange} />
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserDetail;
