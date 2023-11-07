import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { Container, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './Clients.css';
import { Link } from 'react-router-dom'; // Import the Link component from React Router
import { AuthContext } from '../../Context/authContext';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import { LinearScale } from 'chart.js/auto';
import { FlagIcon } from 'react-flag-kit';
import PersonIcon from '@mui/icons-material/Person';
import BanUserComponent from '../user/showuser/Banuser';
import { Grid } from '@mui/material';
const apiUrl = process.env.REACT_APP_API_URL;

function InvitedUsersComponent() {
    const { authTokens } = useContext(AuthContext);
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [pieChartData, setPieChartData] = useState({});
    const [usersPerMonth, setUsersPerMonth] = useState(Array(12).fill(0)); // Initialize with zeros for each month

  useEffect(() => {
    const fetchInvitedUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/invited-users/`, {
          headers: {
            'Authorization': `Bearer ${authTokens.access}`,
          },
        });

        const sortedData = response.data.sort((a, b) => b.id - a.id); // Sort by id in descending order
        setInvitedUsers(sortedData);

        // Analytics - calculate total and recommended by others
        const totalInvited = sortedData.length;
        const recommendedByOthers = sortedData.filter(user => user.recommended_by).length;
        setPieChartData({
          labels: ['Total Invited Users', 'Recommended By Others'],
          datasets: [
            {
              data: [totalInvited, recommendedByOthers],
              backgroundColor: ['#36A2EB', '#FFCE56'],
              hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
            },
          ],
        });

        // Calculate the number of users per month
        const newUsersPerMonth = sortedData.reduce((acc, user) => {
          const month = new Date(user.date_joined).getMonth();
          acc[month]++;
          return acc;
        }, Array(12).fill(0));
        setUsersPerMonth(newUsersPerMonth);

      } catch (error) {
        console.error('Error fetching invited users:', error);
      }
    };

    fetchInvitedUsers();
  }, [authTokens]);

  const joinData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        label: 'Users Joined',
        data: usersPerMonth,
        fill: false,
        backgroundColor: 'blue',
        borderColor: 'blue',
      },
    ],
  };

  
  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 }, 
    { 
        field: 'country_ip', 
        headerName: 'Country', 
        flex: 1,
        renderCell: (params) => {
            const countryCode = params.value;
            if (countryCode) {
                return (
                    <span>
                        <FlagIcon code={countryCode} size={15} />
                    </span>
                );
            } else {
                return null;
            }
        }
    , flex: 0.5},
    { field: 'username', headerName: 'Phone/Username', flex: 1 },
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'last_name', headerName: 'Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'balance', headerName: 'Balance', type: 'number', flex: 1 },
    {
      field: 'recommended_by',
      headerName: 'Recommended By',
      flex: 1,
      renderCell: (params) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {params.value} {/* This will display the recommender's ID */}
            {params.value && (
              <Link to={`/show-user/${params.value}`}>
                <IconButton color="primary" size="small" title="View Recommender" style={{ marginLeft: '8px' }}>
                  <PersonIcon />
                </IconButton>
              </Link>
  )}
  
              
          </div>
        );
      }
    },
    {
        field: 'actions',
        headerName: 'View',
        sortable: false,
        width: 200,
        renderCell: (params) => (
          <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Link to={`/show-user/${params.row.id}`}>
              <IconButton color="primary" size="small">
                <VisibilityIcon />
              </IconButton>
            </Link>
          </Grid>
          <Grid item>
            <div className='ban-user-divs-home'>
              <BanUserComponent userId={params.row.id} />
            </div>
          </Grid>
        </Grid>
        ),
    }
  ];
  return (
    
    <Container maxWidth="xl">
        <Container maxWidth="xl" className='analytics-container'>
        <h2>User Analytics</h2>
            <div className="analytics-content">
           
            
                
            </div>
            <div style={{ height: '250px' }}> 
                <Line data={joinData} />
            </div>
            <h2>My Invited Users</h2>
            <p>invited {invitedUsers.length} users.</p> {/* This line adds the count of invited users */}
            </Container>
      <Container maxWidth="xl">
      <div
        className="user-container" // Reuse the class name from Users component
        style={{
          height: 400, // Set a fixed height for the DataGrid container
          width: '100%', // Set width to '100%' to make it responsive
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <DataGrid
          rows={invitedUsers}
          columns={columns}
          pageSize={5}
          components={{
            Toolbar: () => (
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarExport />
              </div>
            ),
          }}
          // ... other DataGrid props you might need
        />
      </div>
    </Container>
    </Container>
  );
}

export default InvitedUsersComponent;
