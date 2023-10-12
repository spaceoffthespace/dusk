import React, { useEffect, useState, useContext } from 'react';
import { DataGrid, GridOverlay, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import axios from 'axios';

import { Container, Typography, Button, Modal, Box, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { AuthContext } from '../../Context/authContext';
import CloseIcon from '@mui/icons-material/Close';

import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './Withdraw.css'
import { Chart, ArcElement, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
Chart.register(ChartDataLabels);

Chart.register(ArcElement, CategoryScale, Title, Tooltip, Legend);
const CustomLoadingOverlay = () => {
  return (
    <GridOverlay>
      <CircularProgress />
    </GridOverlay>
  );
};

const WithdrawalsDashboard = () => {

    const apiUrl = process.env.REACT_APP_API_URL;

    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, isLoading, authTokens } = useContext(AuthContext);
    const [imgSrc, setImgSrc] = useState('');
    const [open, setOpen] = useState(false);

    const [uniqueYears, setUniqueYears] = useState([]);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Set the default to the current year



    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/requested-withdraw/`, {
          headers: {
              Authorization: `Bearer ${authTokens.access}`,
          },
        });
    
        // Sort the withdrawals by date in descending order
        const sortedWithdrawals = response.data.sort((a, b) => new Date(b.request_date) - new Date(a.request_date));
        
        // Add a unique id to each withdrawal based on the array index
        const withdrawalsWithIds = sortedWithdrawals.map((withdrawal, index) => ({
          id: index, // Use the index as the unique id
          ...withdrawal,
        }));
    
        setWithdrawals(withdrawalsWithIds);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };


   const updateStatus = (withdrawalId, status) => {
    axios.patch(`${apiUrl}/withdrawals/${withdrawalId}/`, { status }, {
        headers: {
            'Authorization': `Bearer ${authTokens.access}`
        }
    })
    .then(() => {
        fetchWithdrawals();
    })
    .catch((error) => {
        console.error('Failed to update status:', error);
    });
};
    
    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleOpen = (imageUrl) => {
        setImgSrc(imageUrl);
        setOpen(true);
      };

    const handleClose = () => {
        setOpen(false);
    };

    const handleInspect = (withdrawalId) => {
        console.log('Inspect withdrawal:', withdrawalId);
    };

    const handleEdit = (withdrawalId) => {
        console.log('Edit withdrawal:', withdrawalId);
    };

    const handleDelete = (withdrawalId) => {
        console.log('Delete withdrawal:', withdrawalId);
    };

    const handleApprove = (withdrawalId) => {
        console.log('Approve withdrawal:', withdrawalId);
        updateStatus(withdrawalId, 'approved');
    };

    const handleDeny = (withdrawalId) => {
        console.log('Deny withdrawal:', withdrawalId);
        updateStatus(withdrawalId, 'denied');
    };

    const totalwithdrawAmount = withdrawals.reduce((total, withdrawal) => {
        if (withdrawal.amount) {
          return total + parseFloat(withdrawal.amount);
        }
        return total;
      }, 0);


    const totalApprovedWithdrawlAmount = withdrawals.reduce((total, withdrawal) => {
        if (withdrawal.status === 'approved' && withdrawal.amount) {
          return total + parseFloat(withdrawal.amount);
        }
        return total;
      }, 0);


    const totalPendingWithdrawAmount = withdrawals.reduce((total, withdrawal) => {
        if (withdrawal.status === 'pending' && withdrawal.amount) {
          return total + parseFloat(withdrawal.amount);
        }
        return total;
      }, 0);
    
      // Calculate total amount of frozen transactions
    const totalFrozenAmount = withdrawals.reduce((total, withdrawal) => {
        if (withdrawal.status === 'frozen' && withdrawal.amount) {
          return total + parseFloat(withdrawal.amount);
        }
        return total;
      }, 0);


    const getYearsFromWithdrawals = () => {
        const yearsSet = new Set(withdrawals.map(t => new Date(t.request_date).getFullYear()));
        console.log([...yearsSet]);
        return [...yearsSet];

    };

    const yearFilteredWithdrawals = withdrawals.filter(withdrawal => {
        return new Date(withdrawal.request_date).getFullYear() === selectedYear;
    });
  
    useEffect(() => {
      const computedUniqueYears = getYearsFromWithdrawals();
      setUniqueYears(computedUniqueYears);
  }, [withdrawals]);


  const getMonthlyWithdrawalData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyCounts = Array(12).fill(0);

    yearFilteredWithdrawals.forEach(withdrawal => {
        const month = new Date(withdrawal.request_date).getMonth();
        monthlyCounts[month] += 1;
    });

    return {
        labels: monthNames,
        datasets: [{
            data: monthlyCounts,
            backgroundColor: 'blue',
            borderColor: 'black',
            borderWidth: 1
        }]
    };
};

const getApprovedWithdrawalsForYear = (year) => {
    return withdrawals.filter(withdrawal => {
        return withdrawal.status === "approved" && new Date(withdrawal.request_date).getFullYear() === year;
    });
  };
  const getMonthlyApprovedWithdrawalAmounts = (withdrawals = []) => { 
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const totals = Array(12).fill(0);
  
    if (!Array.isArray(withdrawals)) { 
      console.error('Transactions is not an array.');
      return;
    }
  
    withdrawals.forEach(withdrawal => {
      if (withdrawal.status === "approved" && withdrawal.request_date) {
        const amount = parseFloat(withdrawal.amount);
        if (!isNaN(amount)) { 
          const date = new Date(withdrawal.request_date);
          if (!isNaN(date.getTime())) { 
            const month = date.getMonth();
            totals[month] += amount;
          }
        }
      }
    });

    return {
        labels: monthNames,
        datasets: [
          {
            label: 'Total Approved Amount',
            data: totals,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      };
    };

    const approvedAmounts = getMonthlyApprovedWithdrawalAmounts(withdrawals); 
      const modalBody = (
        <Box 
          sx={{
            position: 'absolute',
            width: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <IconButton 
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <h2 id="simple-modal-title">Image</h2>
          <img src={imgSrc} alt="Uploaded" style={{ width: '100%', height: 'auto' }} />
        </Box>
      );

        const getPieChartData = () => {
        const statusCounts = withdrawals.reduce((acc, withdrawal) => {
          acc[withdrawal.status] = (acc[withdrawal.status] || 0) + 1;
          return acc;
        }, {});
      
        return {
          labels: Object.keys(statusCounts),
          datasets: [
            {
              data: Object.values(statusCounts),
              backgroundColor: ['red', 'green', 'blue'], // Define your colors here
            },
          ],
        };
      };
      const options = {
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Transaction Status Distribution',
          },
          datalabels: {
            color: '#fff',
            display: (context) => context.dataset.data[context.dataIndex] > 0,
            font: {
              weight: 'bold',
            },
            formatter: (value) => value,
          },
        },
      };

  
  


    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'user', headerName: 'User', width: 130 },
        { field: 'amount', headerName: 'Amount', width: 130 },
        { field: 'request_date', headerName: 'Date', width: 130 },
        { field: 'status', headerName: 'Status', width: 130 },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            width: 300,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <IconButton color="primary" size="small" onClick={() => handleInspect(params.row.id)}>
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton color="inherit" size="small" onClick={() => handleEdit(params.row.id)}>
                        <EditIcon style={{ color: 'green' }}/>
                    </IconButton>
                    <IconButton color="secondary" size="small" onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon />
                    </IconButton>
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

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <Container maxWidth="xl">
            <Container maxWidth="xl" className="withdrawals-container" style={{ padding: '20px', marginBottom: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <h2>Withdrawals</h2>
                <Grid container spacing={4} alignItems="flex-start"> 
                    <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth>
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
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Bar data={getMonthlyWithdrawalData()} options={{
                            scales: {
                                y: { beginAtZero: true }
                            },
                            plugins: {
                            legend: { display: false },
                                title: { display: true, text: 'Monthly Transaction Count' }
                            }
                        }} />
                    </Grid>


                    <Grid item xs={12} md={6}>
                        <Bar data={getMonthlyApprovedWithdrawalAmounts(getApprovedWithdrawalsForYear(selectedYear))} options={{
                            scales: {
                                y: { beginAtZero: true }
                            },
                            plugins: {
                                legend: { display: true },
                                title: {
                                    display: true,
                                    text: 'Monthly Total Approved Amounts'
                                }
                            }
                        }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    <div style={{ height: '250px' }}>
                                        <Pie data={getPieChartData()} options={options} />
                                    </div>
                                    <Typography variant="h6" color="primary" gutterBottom></Typography>
                                    Total Requested Amount: ${totalwithdrawAmount.toFixed(2)}
                                </Typography>
                            </Grid>
                    <Grid item xs={12}>

                    <Typography variant="h6" color="primary" gutterBottom>
                        Total Withdrawals: {withdrawals.length}
                    </Typography>
                    </Grid>
                    <Grid item xs={12}>

                    <Typography variant="h6" color="primary" gutterBottom>
                        Total  amount : {totalwithdrawAmount}
                    </Typography>
                    </Grid>
                    <Grid item xs={12}>

                    <Typography variant="h6" color="primary" gutterBottom>
                        Total approved amount : {totalApprovedWithdrawlAmount}
                    </Typography>
                    </Grid>
                    <Grid item xs={12}>

                    <Typography variant="h6" color="primary" gutterBottom>
                        Total pending amount : {totalPendingWithdrawAmount}
                    </Typography>
                    </Grid>
                </Grid>
       
           
            
            </Container>

            <Container maxWidth="xl" className="withdraw-datagrid-container" style={{ height: 400, width: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '20px' }}>
            
                <DataGrid
                    rows={withdrawals}
                    columns={columns}
                    pageSize={5}
                    loading={loading}
                    components={{ LoadingOverlay: CustomLoadingOverlay, 
                    Toolbar: () => (
                        <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                          <GridToolbarColumnsButton />
                          <GridToolbarFilterButton />
                          <GridToolbarExport />
                        </div>
                     ),
                }}
                />
            
                 </Container>
            </Container>
    );
}

export default WithdrawalsDashboard;
