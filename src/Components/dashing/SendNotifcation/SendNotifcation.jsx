import React, { useState, useContext } from 'react';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { 
    TextField, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Box,
    TextareaAutosize,
    Grid
} from '@mui/material';

import { AuthContext } from '../../Context/authContext';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const SendNotifications = ({ userId }) => {

    const apiUrl = process.env.REACT_APP_API_URL;


    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('info');
    const [link, setLink] = useState(''); 
    const { authTokens } = useContext(AuthContext);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertData, setAlertData] = useState({
        severity: 'success',
        message: 'Notification sent successfully!'
    });

    const iconMapping = {
        info: <InfoIcon />,
        success: <CheckCircleIcon />,
        warning: <WarningIcon />,
        error: <ErrorIcon />,
    };

    const handleSubmit = async (e) => {

    e.preventDefault();

    try {
        const response = await axios.post(`${apiUrl}/send_notification/`, {
            user: userId,   
            title,
            content,
            type,
            link  // only include this if you're using the optional link in your notification model
        }, {
            headers: {
                Authorization: `Bearer ${authTokens.access}`
            }
        });

        if (response.status === 201) {
            console.log("Notification sent successfully.");
            
            // Set the success alert message and open the snackbar
            setAlertData({
                severity: 'success',
                message: 'Notification sent successfully!'
            });
            setSnackbarOpen(true);

            // Reset the form
            setTitle('');
            setContent('');
            setType('info');
            setLink('');
        } else {
            // Handle unexpected status codes by displaying an error snackbar
            setAlertData({
                severity: 'error',
                message: 'Failed to send notification.'
            });
            setSnackbarOpen(true);
        }
    } catch (error) {
        console.error('Error sending notification:', error);

        // Set the error alert message and open the snackbar
        setAlertData({
            severity: 'error',
            message: 'Error sending notification!'
        });
        setSnackbarOpen(true);
    }
}

    return (
<Box component="form" onSubmit={handleSubmit} padding={3} boxShadow={2} borderRadius={2}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField 
                        fullWidth 
                        label="Title" 
                        variant="outlined"
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextareaAutosize
                        minRows={4}
                        placeholder="Content"
                        style={{ width: '100%', padding: '10px' }}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        required
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                        fullWidth 
                        label="Link (optional)" 
                        variant="outlined"
                        value={link}
                        onChange={e => setLink(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Type</InputLabel>
                        <Select
                            label="Type"
                            value={type}
                            onChange={e => setType(e.target.value)}
                            IconComponent={() => iconMapping[type]}
                        >
                            <MenuItem value="info"><InfoIcon style={{ marginRight: '10px' }}/> Info</MenuItem>
                            <MenuItem value="success"><CheckCircleIcon style={{ marginRight: '10px' }}/> Success</MenuItem>
                            <MenuItem value="warning"><WarningIcon style={{ marginRight: '10px' }}/> Warning</MenuItem>
                            <MenuItem value="error"><ErrorIcon style={{ marginRight: '10px' }}/> Error</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" type="submit">Send Notification</Button>
                </Grid>
            </Grid>
            <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
            <Alert onClose={() => setSnackbarOpen(false)} severity={alertData.severity} variant="filled">
                {alertData.message}
            </Alert>
        </Snackbar>
        </Box>
    );
}

export default SendNotifications;
