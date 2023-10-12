import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';
const apiUrl = process.env.REACT_APP_API_URL;

function ResetUserButton({ userId }) {
    const [status, setStatus] = useState('');

    const resetUser = async () => {
        try {
            const response = await axios.get(`${apiUrl}/reset-user/${userId}/`); // adjust the endpoint as necessary
            setStatus(response.data.message);
            alert(response.data.message); // or handle the success response as you see fit
        } catch (error) {
            console.error('There was an error resetting the user!', error);
            setStatus('There was an error resetting the user!');
        }
    };

    return (
        <div>
            <Button 
                variant="contained" 
                color="secondary" 
                onClick={resetUser} 
                style={{ marginLeft: '10px' }}  // Adjusted marginLeft
            >
                Reset User
            </Button>
            {status && <p>{status}</p>}
        </div>
    );
}

export default ResetUserButton;
