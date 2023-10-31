import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Snackbar } from '@mui/material';
import Users from '../user/User';
import Transactions from '../Transactions/Transactions';
import Navbar from '../Sidebar/Navbar';
import WithdrawalsDashboard from '../Withdraw/Withdraw';
import axios from 'axios';
import { AuthContext } from '../../Context/authContext';
import Switch from '@mui/material/Switch';

const MainPage = () => {
  const { authTokens } = useContext(AuthContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const { user } = useContext(AuthContext);
  const [isNotificationsEnabled, setNotificationsEnabled] = useState(null); // default is true, you can fetch the actual state from the API when the component mounts


  const apiUrl = process.env.REACT_APP_API_URL;

  const isHR = user && user.role === 'hr';

  const handleClearCaptchas = async () => {
    try {
      const response = await axios.post(`${apiUrl}/clear-captchas/`, null, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.access}`,
        },
      });

      if (response.status === 200) {
        setSnackbarSeverity('success');
        setSnackbarMessage('Expired captchas cleared successfully.');
        setSnackbarOpen(true);
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to clear expired captchas.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error clearing captchas:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('An error occurred while clearing captchas.');
      setSnackbarOpen(true);
    }
  };
  const handleDownloadData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/download-tran/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens.access}`,
        },
        responseType: 'blob', // This is important
      });
  
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'transactions.zip'); // You can name your file here
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link); // Remove the link element from the DOM
  
        setSnackbarSeverity('success');
        setSnackbarMessage('Downloading...');
        setSnackbarOpen(true);
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to download the data.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error :', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('An error occurred while trying to download the data.');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const fetchNotificationStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/toggle_telegram_notification/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokens.access}`,
          },
        });
  
        if (response.status === 401) {
          // Handle unauthorized access here (e.g., redirect to login)
        } else if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNotificationsEnabled(data.current_status);
          } else {
            console.error('Error fetching notifications status:', data.error);
          }
        } else {
          console.error('Request failed:', response.statusText);
        }
      } catch (error) {
        console.error('An error occurred while fetching status:', error);
      }
    };
  
    fetchNotificationStatus();
  }, []);
  
  const handleToggleNotifications = async () => {
    try {
      const response = await fetch(`${apiUrl}/toggle_telegram_notification/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.access}`,
        },
      });
  
      if (response.status === 401) {
        // Handle unauthorized access here (e.g., redirect to login)
      } else if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotificationsEnabled(data.current_status);
          // You can also show a toast message or alert to inform the user about the change
        } else {
          console.error('Error toggling notifications:', data.error);
        }
      } else {
        console.error('Request failed:', response.statusText);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  

  const handleDeleteImages = async () => {
    try {
        const response = await axios.post(`${apiUrl}/delete-images/`, null, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authTokens.access}`,
            },
        });

        if (response.status === 200) {
            setSnackbarSeverity('success');
            setSnackbarMessage('Images deleted successfully.');
            setSnackbarOpen(true);
        } else {
            setSnackbarSeverity('error');
            setSnackbarMessage('Failed to delete images.');
            setSnackbarOpen(true);
        }
    } catch (error) {
        console.error('Error deleting images:', error);
        setSnackbarSeverity('error');
        setSnackbarMessage('An error occurred while deleting images.');
        setSnackbarOpen(true);
    }
};

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  
 
  return (
    <div>
      <Navbar />
      <Box
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        bgcolor="#f0f0f0"
        padding="16px"
      >
        <Typography variant="h3" color="primary" gutterBottom>
          MAIN
        </Typography>
        <div>

         
        {isHR && (
          <div>

         <div className='notification-toggle'>
            <span>Notifications</span>
            <Switch
          checked={isNotificationsEnabled === true}
          onChange={handleToggleNotifications}
          color="primary"
          disabled={isNotificationsEnabled === null}
      />
      <div>/</div>
        <div className='admin-action-buttons'>
          <Button variant="contained" color="primary" onClick={handleClearCaptchas}>
            Clear Captchas
          </Button>
          <Button variant="contained" color="secondary" onClick={handleDownloadData}>
            Download Transaction images
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteImages}>
            Delete Transaction images
          </Button>
         </div>
        </div>
         </div>
         
      )}
      </div>
      
        <div className="main-user-container" style={{ margin: '10px', width: '100%', paddingTop: '20px', paddingBottom: '20px' }}>
          <Users />
        </div>
        <div className="main-transactions-container" style={{ width: '100%', paddingTop: '20px', paddingBottom: '20px'}}>
          <Transactions />
        </div>
        <div className="main-withdraw-container" style={{ width: '100%', paddingTop: '20px', paddingBottom: '20px'}}>
          <WithdrawalsDashboard />
        </div>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  );
};

export default MainPage;
