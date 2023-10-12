import React, { useState, useContext } from 'react';
import { Button, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../../Context/authContext';

function BanUserComponent({ userId }) {

    const apiUrl = process.env.REACT_APP_API_URL;


  const [open, setOpen] = useState(false);
  const [secondPrompt, setSecondPrompt] = useState(false);

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSecondPrompt(false);
  };

  const handleContinue = () => {
    if (secondPrompt) {
      handleBanUser();
    } else {
      setSecondPrompt(true);
    }
  };

  const { user, isLoading, authTokens } = useContext(AuthContext);


  const handleBanUser = async () => {
    try {
      await axios.post(`${apiUrl}/ban-user/`, {
        user_id: userId 
      }, {
        headers: {
          'Authorization': `Bearer ${authTokens.access}`,
        },
      });
      // Optionally, you might update the userData state or redirect the user
      alert('User has been banned successfully');
      setOpen(false);
      setSecondPrompt(false);
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  };

  return (
    <Grid item xs={12}>
         <Button 
                variant="contained" 
                color="error" 
                onClick={handleOpenDialog} 
                style={{ marginLeft: '0px' }}  // Adjusted marginLeft
            >
        Ban
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {secondPrompt ? "This is your final warning! Are you absolutely certain?" : "This will ban the user. Do you want to proceed?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleContinue} color="primary" autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default BanUserComponent;
