import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { Container, IconButton, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './User.css';
import { Link } from 'react-router-dom'; // Import the Link component from React Router
import { AuthContext } from '../../Context/authContext';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import { LinearScale } from 'chart.js/auto';
import { FlagIcon } from 'react-flag-kit';
import PersonIcon from '@mui/icons-material/Person';
import BanUserComponent from './showuser/Banuser';
import { Grid } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL;

function Users() {
  const [data, setData] = useState([]);
  const { user, isLoading, authTokens } = useContext(AuthContext);
  const [pieChartData, setPieChartData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [uniqueYears, setUniqueYears] = useState([]);
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/users/`, {
          headers: {
            'Authorization': `Bearer ${authTokens.access}`,
          },
        });
        
        const sortedData = res.data.sort((a, b) => b.id - a.id);  // Sort by id in descending order
        setData(sortedData);
  
        // Calculate the number of users and those recommended by others
        const totalUsers = res.data.length;
        const recommendedUsers = res.data.filter(user => user.recommended_by).length;

        const years = new Set(sortedData.map(user => new Date(user.date_joined).getFullYear()));
        setUniqueYears([...years]);
        // Set the data for the pie chart
        setPieChartData({
          labels: ['Total Users', 'Recommended By Others'],
          datasets: [
            {
              data: [totalUsers, recommendedUsers],
              backgroundColor: ['#36A2EB', '#FFCE56'],
              hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    fetchUsers();
  }, []);
  
const getUsersPerMonthForYear = (year) => {
  const months = Array(12).fill(0);
  data.forEach(user => {
    if (new Date(user.date_joined).getFullYear() === year) {
      const month = new Date(user.date_joined).getMonth();
      months[month]++;
    }
  });
  return months;
};

  const handleInspect = (userId) => {
    // Handle inspect action here
    console.log('Inspect user:', userId);
  };

  const handleEdit = (userId) => {
    // Handle edit action here
    console.log('Edit user:', userId);
  };

  const handleDelete = (userId) => {
    // Handle delete action here
    console.log('Delete user:', userId);
  };

  const getUsersPerMonth = (users) => {
    const months = Array(12).fill(0);
    users.forEach(user => {
        const month = new Date(user.date_joined).getMonth();
        months[month]++;
    });
      return months;
  };

  const usersPerMonth = getUsersPerMonth(data);

  const joinData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        label: 'Users Joined',
        data: getUsersPerMonthForYear(selectedYear),
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
        <div className="info-card">

          <span className="info-title">Total Users</span>
          <span className="info-value">{data.length}</span>
        </div>
        <div className="info-card">
          <span className="info-title">Recommended By Others</span>
          <span className="info-value">{data.filter(user => user.recommended_by).length}</span>
        </div>
       
          
      </div>

      <Grid item xs={12}>
        <FormControl variant="outlined" style={{ width: '150px' }}>
            <InputLabel>Year</InputLabel>
            <Select
                label="Select Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                variant="outlined"
                fullWidth
            >
                {uniqueYears.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
            </Select>
        </FormControl>
      <div style={{ height: '250px' }}> 
        <Line data={joinData} />
        </div>
    </Grid>
   
    </Container>
          <div
            className="user-container"
            style={{
              height: 400, // Set a fixed height for the DataGrid container
              width: '100%', // Set width to '100%' to make it responsive
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <DataGrid
              rows={data}
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
            />
          </div>
    </Container>
  );
}

export default Users;
