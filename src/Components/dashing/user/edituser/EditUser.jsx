import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container } from '@mui/material';
import './EditUser.css'
import { AuthContext } from '../../../Context/authContext';

function EditUser() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;


  const { user, isLoading, authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${apiUrl}/users/${id}`, {
          'Authorization': `Bearer ${authTokens.access}`,
        });
        setUserData(res.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${apiUrl}/users/${id}`, updatedData, {
        headers: {
          'Authorization': `Bearer ${authTokens.access}`,
        }
      });      setUserData(res.data);
      setSuccessMessage('User details updated successfully!');
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="sm">
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <TextField
            label="Username"
            name="username"
            value={updatedData.username || userData.username}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="Email"
            name="email"
            value={updatedData.email || userData.email}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="First Name"
            name="first_name"
            value={updatedData.first_name || userData.first_name || ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="Last Name"
            name="last_name"
            value={updatedData.last_name || userData.last_name || ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="Balance"
            name="balance"
            value={updatedData.balance || userData.balance}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="Delivery Address"
            name="deliveryAddress"
            value={updatedData.deliveryAddress || userData.deliveryAddress || ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="Code"
            name="code"
            value={updatedData.code || userData.code || ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="Recommended By"
            name="recommended_by"
            value={updatedData.recommended_by || userData.recommended_by || ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
            lock
          />
        </div>
        <Button type="submit" variant="contained" color="primary">
          Save Changes
        </Button>
      </form>
      {successMessage && <div>{successMessage}</div>}
    </Container>
  );
}

export default EditUser;
