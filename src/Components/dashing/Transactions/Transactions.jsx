import React, { useEffect, useState, useContext } from 'react';
import { DataGrid, GridOverlay, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography, Button, Modal, Box, Grid, FormControl, InputLabel, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Container } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Transactions.css'
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../../Context/authContext';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Link } from 'react-router-dom'; // Import the Link component from React Router

import { Bar } from 'react-chartjs-2';

Chart.register(ChartDataLabels);
Chart.register(ArcElement, CategoryScale, Title, Tooltip, Legend);
const apiUrl = process.env.REACT_APP_API_URL;

const CustomLoadingOverlay = () => {
  return (
    <GridOverlay>
      <CircularProgress />
    </GridOverlay>
  );
};



const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const totalTransactions = transactions.length;
    const [editedAmounts, setEditedAmounts] = useState({});
    const [uniqueYears, setUniqueYears] = useState([]);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Set the default to the current year

    const [deletedFileName, setDeletedFileName] = useState('');
    
    const [selectedYearForApprovedAmounts, setSelectedYearForApprovedAmounts] = useState(new Date().getFullYear());

    const { user, isLoading, authTokens } = useContext(AuthContext);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);


    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/transactions/`, {
          headers: {
            'Authorization': `Bearer ${authTokens.access}`,
          }
        });
        // Sort the transactions array in reverse order based on the date field
        const sortedTransactions = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(sortedTransactions);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleOpen = (imageUrl) => {
        setImgSrc(imageUrl);
        setOpen(true);
      };

      const handleClose = () => {
        setOpen(false);
    };


    const handleDelete = async (transactionId) => {
      try {
          const response = await axios.post(`${apiUrl}/delete-image/${transactionId}/`, null, {
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${authTokens.access}`,
              },
          });
  
          if (response.status === 200) {
              console.log('Image deleted:', response.data);
              setTransactions(prevTransactions => prevTransactions.map(transaction => {
                  if (transaction.id === transactionId) {
                      return {
                          ...transaction, 
                          image_url: response.data.filename, 
                          imageDeleted: true // Add this line
                      };  
                  }
                  return transaction;
              }));
          } else {
              console.error('Failed to delete the image');
          }
      } catch (error) {
          console.error('Error deleting the image:', error);
      }
  };

 

    const handleInspect = (transactionId) => {
        // Handle inspect action here
        console.log('Inspect transaction:', transactionId);
      };

      const handleEdit = (transactionId) => {
        // Handle edit action here
        console.log('Edit transaction:', transactionId);
      };

  

      
      const handleDeny = (transactionId) => {
        // Handle deny action here
        console.log('Deny transaction:', transactionId);
        updateStatus(transactionId, 'denied');
      };
      const handleApprove = (transactionId) => {
        const currentAmount = editedAmounts[transactionId] || transactions.find(trans => trans.id === transactionId).amount;
        console.log(`Approve transaction: ${transactionId} with amount: ${currentAmount}`);
        updateStatus(transactionId, 'approved', currentAmount);
    };
    

    const updateStatus = (transactionId, status, amount) => {
      axios.patch(`${apiUrl}/transactions/${transactionId}/`, 
        { status, amount }, 
        {
          headers: {
            'Authorization': `Bearer ${authTokens.access}`, // Use authTokens from the AuthContext
          }
        }
      )
      .then((response) => {
          console.log(response);
          fetchTransactions();
      })
      .catch((error) => {
          console.error('Failed to update status:', error);
      });
    };

    const handleCellEdit = (params) => {
      console.log('Cell edit event triggered', params);
      
      if (params.field === 'amount') {
          const updatedAmount = params.value;
          const transactionId = params.id;
  
          setEditedAmounts(prev => ({
              ...prev,
              [transactionId]: updatedAmount
          }));
      }
  };
    
    const totalRequestedAmount = transactions.reduce((total, transaction) => {
      if (transaction.amount) {
        return total + parseFloat(transaction.amount);
      }
      return total;
    }, 0);
  
    // Calculate total amount of approved transactions
    const totalApprovedAmount = transactions.reduce((total, transaction) => {
      if (transaction.status === 'approved' && transaction.amount) {
        return total + parseFloat(transaction.amount);
      }
      return total;
    }, 0);
  
    // Calculate total amount of pending transactions
    const totalPendingAmount = transactions.reduce((total, transaction) => {
      if (transaction.status === 'pending' && transaction.amount) {
        return total + parseFloat(transaction.amount);
      }
      return total;
    }, 0);
  
    // Calculate total amount of frozen transactions
    const totalFrozenAmount = transactions.reduce((total, transaction) => {
      if (transaction.status === 'frozen' && transaction.amount) {
        return total + parseFloat(transaction.amount);
      }
      return total;
    }, 0);


    const getYearsFromTransactions = () => {
      const yearsSet = new Set(transactions.map(t => new Date(t.date).getFullYear()));
      return [...yearsSet];
  };

  const yearFilteredTransactions = transactions.filter(transaction => {
      return new Date(transaction.date).getFullYear() === selectedYear;
  });

  useEffect(() => {
    const computedUniqueYears = getYearsFromTransactions();
    setUniqueYears(computedUniqueYears);
}, [transactions]);

  const getMonthlyTransactionData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyCounts = Array(12).fill(0);

    yearFilteredTransactions.forEach(transaction => {
        const month = new Date(transaction.date).getMonth();
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
const getApprovedTransactionsForYear = (year) => {
  return transactions.filter(transaction => {
      return transaction.status === "approved" && new Date(transaction.date).getFullYear() === year;
  });
};
const getMonthlyApprovedAmounts = (transactions = []) => { 
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const totals = Array(12).fill(0);

  if (!Array.isArray(transactions)) { 
    console.error('Transactions is not an array.');
    return;
  }

  transactions.forEach(transaction => {
    if (transaction.status === "approved" && transaction.date) {
      const amount = parseFloat(transaction.amount);
      if (!isNaN(amount)) { 
        const date = new Date(transaction.date);
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

const approvedAmounts = getMonthlyApprovedAmounts(transactions); 
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

      


     const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'user', headerName: 'User', width: 130 },
  { field: 'amount', headerName: 'Amount', width: 130, editable: true },
  { field: 'date', headerName: 'Date', width: 200 },
  { field: 'status', headerName: 'Status', width: 130 },
  {
    field: 'image_url',
    headerName: 'Image',
    width: 130,
    renderCell: (params) => (
      <div>
        <Button onClick={() => handleOpen(params.value)}>View Image</Button>
      </div>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    width: 300, // Adjust the width as needed
    headerAlign: 'center', // Center align the header text
    align: 'center', // Center align the cell content
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <Link to={`/show-user/${params.row.user}`}>
          <IconButton color="primary" size="small">
            <VisibilityIcon />
          </IconButton>
        </Link>
        <IconButton color="inherit" size="small" onClick={() => handleEdit(params.row.id)}>
          <EditIcon style={{ color: 'green' }}/>
        </IconButton>
        <IconButton color="secondary" size="small" onClick={() => {
          setSelectedTransactionId(params.row.id);
          setDeleteDialogOpen(true);
      }}>
          <DeleteIcon /> Img
      </IconButton>
        
        {params.row.status === 'pending' && (
      <>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => handleApprove(params.row.id, params.row.amount)}
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
    
     {params.row.imageDeleted && (
                <Typography variant="body2">
                    Deleted File: {params.row.image_url}
                </Typography>
            )}
  </Box>
    ),
    
  },
  
];





const getPieChartData = () => {
  const statusCounts = transactions.reduce((acc, transaction) => {
    acc[transaction.status] = (acc[transaction.status] || 0) + 1;
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




    return (
    <Container maxWidth="xl">
    <Container maxWidth="xl" className='trans-analytics-container'>
        <h2>Deposits</h2>

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
           
                {/* Bar chart for Monthly Transaction Distribution */}
                <Bar data={getMonthlyTransactionData()} options={{
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
                <Bar data={getMonthlyApprovedAmounts(getApprovedTransactionsForYear(selectedYear))} options={{
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
                                    Total Requested Amount: ${totalRequestedAmount.toFixed(2)}
                                </Typography>
                            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                    Total Transactions: {transactions.length}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                    Total Approved Amount: ${totalApprovedAmount.toFixed(2)}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                    Total Pending Amount: ${totalPendingAmount.toFixed(2)}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                    Total Frozen Amount: ${totalFrozenAmount.toFixed(2)}
                </Typography>
            </Grid>
        </Grid>
        <button onClick={() => handleCellEdit({ field: 'amount', props: { value: 999 }, id: 1 })}>Test Edit</button>
          </Container>
        <div className="transactions-container" style={{ height: 400, width: '100%', background: 'white' }}>
            <DataGrid
                editMode="cell"
                onEditCellChange={handleCellEdit}
                rows={transactions}
                columns={columns}
                
                loading={loading}
                components={{
                    LoadingOverlay: CustomLoadingOverlay,
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

        <Modal open={open} onClose={handleClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
            {modalBody}
        </Modal>
        <Dialog
    open={deleteDialogOpen}
    onClose={() => setDeleteDialogOpen(false)}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
>
    <DialogTitle id="alert-dialog-title">{"Delete Image"}</DialogTitle>
    <DialogContent>
        <DialogContentText id="alert-dialog-description">
            Make sure to download the image before deleting it. Do you want to proceed?
        </DialogContentText>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
        </Button>
        <Button 
            onClick={() => {
                setDeleteDialogOpen(false); 
                handleDelete(selectedTransactionId);
            }} 
            color="primary" 
            autoFocus
        >
            Delete
        </Button>
    </DialogActions>
</Dialog>
</Container>


    );
}

export default Transactions;
