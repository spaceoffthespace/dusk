import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Grid, Paper, List, ListItem, ListItemText, IconButton, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box } from '@mui/material';
import './showUser.css'
import VisibilityIcon from '@mui/icons-material/Visibility'; // Import the eye icon
import EditIcon from '@mui/icons-material/Edit';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Import the delete icon
import { AuthContext } from '../../../Context/authContext';
import { useTransactions } from '../../../utils/useTransactions'; // Import the custom hook
import { Pie } from 'react-chartjs-2'; // Import for the pie chart
import { Chart } from 'chart.js'; // Import the main Chart.js library
import { ArcElement, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Sidebar/Navbar';
import BanUserComponent from './Banuser';
import ResetUserButton from './Resertuser';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import SendNotications from '../../SendNotifcation/SendNotifcation';
import ClipLoader from "react-spinners/ClipLoader";  // Import the loader
import { FlagIcon } from 'react-flag-kit';

Chart.register(ChartDataLabels);
Chart.register(ArcElement, CategoryScale, Title, Tooltip, Legend);

const apiUrl = process.env.REACT_APP_API_URL;


function ShowUser() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const { user, isLoading, authTokens } = useContext(AuthContext);
  const { transactions, loading, error, fetchTransactions } = useTransactions(authTokens); // Use the custom hook
  const [fetchedUserID, setFetchedUserID] = useState(null);

  const [fetchingData, setFetchingData] = useState(false);  // New state to track if we are fetching data
  const [registerCountry, setRegisterCountry] = useState(null);
  const [lastLoginCountry, setLastLoginCountry] = useState(null);
  const [newAccountType, setNewAccountType] = useState('');
  const [newRole, setNewRole] = useState(''); // Initialize with the current user's role
  const [demoAccountDetails, setDemoAccountDetails] = useState(null);





  const navigate = useNavigate();

  
  const handleUserClick = async (username) => {
   
    try {
        const response = await fetch(`${apiUrl}/get-user-by-username/${username}/`);
        const data = await response.json();

        if (data.id) {
            setFetchedUserID(data.id);
            navigate(`/show-user/${data.id}`);
        } else {
            console.error('User ID not found.');
        }
    } catch (error) {
        console.error('Error fetching user ID:', error);
    }
};

useEffect(() => {
  if (userData) {
    setNewAccountType(userData.account_type);
    setNewRole(userData.role);
  }
}, [userData]);  //

  useEffect(() => {
    const fetchUser = async () => {
      
      try {
        const res = await axios.get(`${apiUrl}/users-data/${id}/`, {
          headers: {
            'Authorization': `Bearer ${authTokens.access}`,
          },
        });
        setUserData(res.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    // Call fetchUser immediately to get initial data
    fetchUser();
  
    // Set up an interval to fetch user data every 5 seconds (5000 milliseconds)
    const intervalId = setInterval(fetchUser, 25000);
  
    // Clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [id, authTokens]);
  

  const handleChangeStatus = async (taskId, newStatus) => {
    try {
      // Log the token to make sure it's correct
      console.log('Access Token:', authTokens.access);
  
      // Update the URL to match the new endpoint for admins
      const response = await axios.put(`${apiUrl}/un-tasks/${taskId}/`, { status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${authTokens.access}`,
        }
      });
  
      // Check for a successful response
      if (response.status === 200) {
        // Update the task status in the userData state
        setUserData((prevUserData) => {
          const updatedTasks = prevUserData.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          return { ...prevUserData, tasks: updatedTasks };
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle the 401 Unauthorized error, perhaps by redirecting to a login page or refreshing the token
        console.error('Unauthorized. Please log in again.');
      } else {
        console.error('Error updating task status:', error);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Send a DELETE request to the API to delete the task
      await axios.delete(`${apiUrl}/us-tasks/${taskId}/`);
      // Update the tasks in the userData state by removing the deleted task
      setUserData((prevUserData) => ({
        ...prevUserData,
        tasks: prevUserData.tasks.filter((task) => task.id !== taskId),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (!userData) {
    return  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <ClipLoader color="#123abc" size={150} />
</div>
  }

  const updateStatus = (transactionId, status) => {
    axios.patch(`${apiUrl}/transactions/${transactionId}/`, { status }, {
        headers: {
            'Authorization': `Bearer ${authTokens.access}`,
        }
    })
    .then((response) => {
        console.log(response);
        fetchTransactions(); // Use the fetchTransactions function provided by the custom hook
    })
    .catch((error) => {
        console.error('Failed to update status:', error);
    });
  };

  const updateWithdraw = (withdrawId, status) => {
    axios.patch(`${apiUrl}/withdrawals/${withdrawId}/`, { status }, {
        headers: {
            'Authorization': `Bearer ${authTokens.access}`,
        }
    })
    .then((response) => {
        console.log(response);
        fetchTransactions(); // Use the fetchTransactions function provided by the custom hook
    })
    .catch((error) => {
        console.error('Failed to update status:', error);
    });
  };



  const handleApprove = (transactionId) => {
    // Handle approve action here
    console.log('Approve transaction:', transactionId);
    updateStatus(transactionId, 'approved');
};

const handleDeny = (transactionId) => {
    // Handle deny action here
    console.log('Deny transaction:', transactionId);
    updateStatus(transactionId, 'denied');
};
  const handleApproveWithdraw = (withdrawId) => {
    // Handle approve action here
    console.log('Approve :', withdrawId);
    updateWithdraw(withdrawId, 'approved');
};

const handleDenyWithdraw = (withdrawId) => {
    // Handle deny action here
    console.log('Deny:', withdrawId);
    updateWithdraw(withdrawId, 'denied');
};



const handleHoldbalance = async () => {
  try {
    await axios.put(`${apiUrl}/hold-balance/`, { user_id: userData.id }, {
      headers: {
        'Authorization': `Bearer ${authTokens.access}`,
      },
    });
    // Optionally, you might update the userData state or redirect the user
    alert('User balance held');
  } catch (error) {
    console.error('Error banning user:', error);
    alert('Failed to hold user balance');
  }
};
const handleReleasebalance = async () => {
  try {
    await axios.put(`${apiUrl}/release-hold-balance/`, { user_id: userData.id }, {
      headers: {
        'Authorization': `Bearer ${authTokens.access}`,
      },
    });
    // Optionally, you might update the userData state or redirect the user
    alert('User balance released');
  } catch (error) {
    console.error('Error banning user:', error);
    alert('Failed to re;ease user balance');
  }
};

const handleCreateDemoAccount = async () => {
  try {
    const response = await axios.post(`${apiUrl}/create-demo-account/${userData.id}/`, {}, {
      headers: {
        'Authorization': `Bearer ${authTokens.access}`,
      },
    });

    if (response.status === 200) {
      // Store the response data in state
      setDemoAccountDetails(response.data);
      alert('Demo account created successfully');
    } else {
      console.error('Failed to create demo account:', response);
      alert('Failed to create demo account');
    }
  } catch (error) {
    console.error('Error creating demo account:', error);
    alert('Failed to create demo account');
  }
};

const toggleUnaffordableTasks = async (userId, toggleValue) => {
  try {
      const response = await axios.put(`${apiUrl}/off-t/`, {
          user_id: userId,
          toggle_value: toggleValue
      }, {
          headers: {
              'Authorization': `Bearer ${authTokens.access}`,
          }
      });

      console.log(response.data.detail);
      // Assuming setUserData is the state setter function for userData
      setUserData(prevData => ({
          ...prevData,
          allow_unaffordable_tasks: toggleValue
      }));
  } catch (error) {
      console.error('Error toggling unaffordable tasks:', error?.response?.data?.detail || error.message);
  }
};

const handleChangeAccountType = async () => {
  try {
    await axios.post(
      `${apiUrl}/change-account-type/${userData.id}/`,
      { new_account_type: newAccountType },
      {
        headers: {
          Authorization: `Bearer ${authTokens.access}`,
        },
      }
    );
    alert('Account type changed successfully');
    // Optionally, you can update the user data in your component
  } catch (error) {
    console.error('Error changing account type:', error);
    alert('Failed to change account type');
  }
};
const handleUpdateUserRole = async () => {
  if (newRole !== userData.role) { // Only make a request if the role has changed
    try {
      const response = await axios.post(
        `${apiUrl}/make-user-housekeeping/${userData.id}/`,
        { new_role: newRole },
        {
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
          },
        }
      );

      if (response.status === 200) {
        alert('User role updated successfully');
        // Optionally update the user data in the state to reflect the changed role
      } else {
        console.error('Failed to update user role:', response);
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  } else {
    alert('Please select a different role to update');
  }
};
  

  // Define columns for the DataGrids
  const taskColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'task_type', headerName: 'Task Type', width: 250 },
    { field: 'price', headerName: 'Price', width: 150, type: 'number' },
    { field: 'created_at', headerName: 'created', width: 150, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={params.row.status}
            onChange={(e) => handleChangeStatus(params.row.id, e.target.value)}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="frozen">Frozen</MenuItem>
          </Select>
        </FormControl>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 150,
      align: 'center',
      renderCell: (params) => (
        <IconButton
          color="secondary"
          size="small"
          onClick={() => handleDeleteTask(params.row.id)} // Call handleDeleteTask function on click
        >
          <DeleteOutlineIcon />
        </IconButton>
      ),
    },
  ];

  const transactionColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'amount', headerName: 'Amount', width: 150, type: 'number' },
    { field: 'date', headerName: 'Date', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 300, // Adjust the width as needed
      headerAlign: 'center', // Center align the header text
      align: 'center', // Center align the cell content
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {params.row.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleApprove(params.row.id)}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDeny(params.row.id)}
              >
                Deny
              </Button>
            </>
          )}
          {params.row.status === 'approved' && (
            <Button variant="contained" color="success" size="small" disabled>
              Approved
            </Button>
          )}
          {params.row.status === 'denied' && (
            <Button variant="contained" color="error" size="small" disabled>
              Denied
            </Button>
          )}
        </Box>
      ),
    },
  ];
  const withdrawColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'amount', headerName: 'Amount', width: 150, type: 'number' },
    { field: 'date', headerName: 'Date', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 300, // Adjust the width as needed
      headerAlign: 'center', // Center align the header text
      align: 'center', // Center align the cell content
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {params.row.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleApproveWithdraw(params.row.id)}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDenyWithdraw(params.row.id)}
              >
                Deny
              </Button>
            </>
          )}
          {params.row.status === 'approved' && (
            <Button variant="contained" color="success" size="small" disabled>
              Approved
            </Button>
          )}
          {params.row.status === 'denied' && (
            <Button variant="contained" color="error" size="small" disabled>
              Denied
            </Button>
          )}
        </Box>
      ),
    },
  ];
  


  const taskStatusCounts = userData ? userData.tasks.reduce((counts, task) => {
    counts[task.status] = (counts[task.status] || 0) + 1;
    return counts;
  }, {}) : {};

  const transactionStatusCounts = userData ? userData.transactions.reduce((counts, transaction) => {
    counts[transaction.status] = (counts[transaction.status] || 0) + 1;
    return counts;
  }, {}) : {};

  const approvedTransactionsTotal = userData.transactions.reduce((total, transaction) => {
    return transaction.status === 'approved' ? total + parseFloat(transaction.amount) : total;
  }, 0);

  const pendingTransactionsTotal = userData.transactions.reduce((total, transaction) => {
    return transaction.status === 'pending' ? total + parseFloat(transaction.amount) : total;
  }, 0);
  
  const frozenTransactionsTotal = userData.transactions.reduce((total, transaction) => {
    return transaction.status === 'frozen' ? total + parseFloat(transaction.amount) : total;
  }, 0);

  const taskStatusData = {
    labels: ['Pending', 'Completed', 'Frozen'],
    datasets: [
      {
        data: [taskStatusCounts.pending || 0, taskStatusCounts.completed || 0, taskStatusCounts.frozen || 0],
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384'],
      },
    ],
  };

  const transactionStatusData = {
    labels: ['Pending', 'Approved', 'Denied'], // Adjust these labels based on your transaction status options
    datasets: [
      {
        data: [transactionStatusCounts.pending || 0, transactionStatusCounts.approved || 0, transactionStatusCounts.denied || 0], // Adjust these counts based on your transaction status options
        backgroundColor: ['#FFCE56', '#27AE60', '#FF6384'],
      },
    ],
  };


  const sortedTransactions = userData.transactions.slice().sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Sorting in descending order
  });
  const sortedWithdrawals = userData.withdrawals.slice().sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Sorting in descending order
  });


  const chartData = {
   
    datasets: [{
        data: [10, 20, 30, 40],  // Replace with your actual data points
    }]
};

  const chartOptions = {
    plugins: {
      datalabels: {

        color: '#000',
        
        formatter: (value, context) => {
          const percentage = context.dataset.data.reduce((a, b) => a + b) ? (value * 100 / context.dataset.data.reduce((a, b) => a + b)).toFixed(0) : 0;
          return `${value} (${percentage}%)`;
        },
      },
      legend: {
        display: true,
        position: 'right',
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  if (!userData) {
    return  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <ClipLoader color="#123abc" size={150} />
</div>
  }

  return (
    <div>
              <Navbar />

    <Container maxWidth="lg" >   
      <Container maxWidth="xl" className='show-user-analytics-container'>

      <Grid Grid container spacing={4}>
        {/* Existing pie charts */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5">
            Task Status Distribution
          </Typography>
          <div style={{ height: '250px' }}>
            <Pie data={taskStatusData} options={chartOptions} />
          </div>
        </Grid>
    
        <Grid item xs={12} md={6}>
          <Typography variant="h5">
            Transaction Status Distribution
          </Typography>
          <div style={{ height: '250px' }}>
            <Pie data={transactionStatusData} options={chartOptions} />
          </div>
        </Grid>
        <div>
        <FormControlLabel
    control={
        <Switch
            key={`allow-unaffordable-tasks-${userData.id}-${userData.allow_unaffordable_tasks}`}
            checked={userData.allow_unaffordable_tasks}
            onChange={(e) => toggleUnaffordableTasks(userData.id, e.target.checked)}
            color="primary"
        />
    }
    label="Allow Unaffordable Tasks"
/>
    </div>
        <Grid container spacing={3} style={{ padding: '7px' }}>
            <Grid item xs={12} md={4}>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    User/phone: {userData.username}
                </Typography>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Name: {userData.first_name} {userData.last_name}
                </Typography>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Email: {userData.email}
                </Typography>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Blance: {userData.balance}
              

                    <Button variant="outlined" color="primary" onClick={handleHoldbalance}>
                      hold
                    </Button>
                </Typography>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Hold Blance: {userData.hold_balance}
               
                    <Button variant="outlined" color="primary" onClick={handleReleasebalance}>
                     Release
                    </Button>
                </Typography>

                <div style={{ marginBottom: '16px' }}>
              <Typography color="primary" style={{ marginBottom: '8px' }} onClick={handleChangeAccountType}>
                Level: {userData.account_type}
              </Typography>
            </div>
            <div>
              <h3>Change Account Type</h3>
              <Select
                value={newAccountType}
                onChange={(e) => setNewAccountType(e.target.value)}
              >
                <MenuItem value="bronze">Bronze</MenuItem>
                <MenuItem value="silver">Silver</MenuItem>
                <MenuItem value="gold">Gold</MenuItem>
                <MenuItem value="platinum">Platinum</MenuItem>
                <MenuItem value="diamond">Diamond</MenuItem>
              </Select>
              <Button variant="contained" color="primary" onClick={handleChangeAccountType}>
                Change Account Type
              </Button>
            </div>
            <div>
  <h3>Change Role</h3>
  <Select
    value={newRole}
    onChange={(e) => setNewRole(e.target.value)}
  >
    {userData.role !== 'user' && <MenuItem value="user">User</MenuItem>}
    {userData.role !== 'housekeeping' && <MenuItem value="housekeeping">Housekeeping</MenuItem>}
  </Select>
  <Button 
    variant="contained" 
    color="primary" 
    onClick={handleUpdateUserRole}
    disabled={newRole === userData.role}  // Disable button if the selected role is the same as the current role
  >
    Change Role
  </Button>
</div>

                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Wallet: {userData.deliveryAddress}
                </Typography>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Joined: {userData.date_joined}
                </Typography>


                <Typography color="primary" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  Invited by: {userData.recommended_by.split("=")[0]}
                  <IconButton 
                    color="primary" 
                    size="small" 
                    style={{ marginLeft: '8px' }} 
                    onClick={() => handleUserClick(userData.recommended_by.split("=")[0])}>
                  <VisibilityIcon />
                  </IconButton>
                </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
            <Typography color="secondary" style={{ marginBottom: '8px' }}>
              Country : <FlagIcon code={userData.country_ip} size={15} />{userData.country_ip}
            </Typography>
            <Typography color="secondary" style={{ marginBottom: '8px' }}>
              Register IP: {registerCountry && <FlagIcon code={registerCountry} size={15} />}{userData.register_ip}
            </Typography>
            <Typography color="secondary" style={{ marginBottom: '8px' }}>
              Last Login IP:<FlagIcon code={userData.last_login_country} size={15} /> {userData.last_login_ip}
            </Typography>
          </Grid>

            <Grid item xs={12} md={4}>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Total Approved Transactions: ${approvedTransactionsTotal}
                </Typography>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Total Pending Transactions: ${pendingTransactionsTotal.toFixed(2)}
                </Typography>
                <Typography color="primary" style={{ marginBottom: '8px' }}>
                    Total Frozen Transactions: ${frozenTransactionsTotal.toFixed(2)}
                </Typography>
            </Grid>

       

          </Grid>
        </Grid>
        <div style={{ display: 'flex', alignItems: 'center' }}>
         
              <BanUserComponent userId={id}/>
          
              <ResetUserButton userId={id}/>


              <Button 
    variant="contained" 
    onClick={handleCreateDemoAccount}
  >
    Create Demo Account
  </Button>

  {demoAccountDetails && (
    <div style={{ marginTop: '20px' }}>
      <p><strong>Message:</strong> {demoAccountDetails.message}</p>
      <p><strong>Demo Phone Number:</strong> {demoAccountDetails.demo_phone_number}</p>
      <p><strong>Default Password:</strong> {demoAccountDetails.default_password}</p>
      <p><strong>Demo Balance:</strong> {demoAccountDetails.demo_balance}</p>
    </div>
  )}
</div>
     
     


      </Container>

      <Container>
      <SendNotications userId={id}/>
      </Container>


      <Grid container spacing={2}>
      <Typography variant="h5" mt={4}>
        Tasks
      </Typography>
        <Grid item xs={12}>
          <Paper elevation={2} style={{ height: 400 }}>
            <DataGrid rows={userData.tasks} columns={taskColumns} pageSize={5} />
          </Paper>
        </Grid>
      </Grid>

      {/* Display user's transactions */}
      <Grid container spacing={2}>
      <Typography variant="h5" mt={4}>
        Transactions
      </Typography>
        <Grid item xs={12}>
          <Paper elevation={2} style={{ height: 400 }}>
            <DataGrid rows={sortedTransactions} columns={transactionColumns} pageSize={5} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
      <Typography variant="h5" mt={4}>
        Withdrawals
      </Typography>
        <Grid item xs={12}>
          <Paper elevation={2} style={{ height: 400 }}>
            <DataGrid rows={sortedWithdrawals} columns={withdrawColumns} pageSize={5} />
          </Paper>
        </Grid>
      </Grid>

    </Container>
    </div>
  );
}

export default ShowUser;
