// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Users from './Components/dashing/user/User';
import { AuthProvider } from './Components/Context/authContext';
import { AuthContext } from './Components/Context/authContext';
import Login from './Components/login/Login';
import MainPage from './Components/dashing/Main/Main';
import Navbar from './Components/dashing/Sidebar/Navbar';
import EditUser from './Components/dashing/user/edituser/EditUser';
import Task from './Components/dashing/Tasks/Tasks';
import ShowUser from './Components/dashing/user/showuser/ShowUser';
import WithdrawalsDashboard from './Components/dashing/Withdraw/Withdraw';

function App() {

  return (
    <div className="App">

      <Grid container>
        <Grid item xs={12}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" roles={['hr', 'housekeeping']} element={<MainPage />} />
            <Route exact path="/tasks" element={<Task />} />
            <Route exact path="/edit-user/:id" element={<EditUser />} />
            <Route exact path="/show-user/:id" element={<ShowUser />} />
            <Route exact path="/withdraw" element={<WithdrawalsDashboard />} />
          </Routes>
        </Grid>
      </Grid>

    </div>
  );
}

export default App;
