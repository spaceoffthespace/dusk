import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Hidden,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './Navbar.css';

import { AuthContext } from '../../Context/authContext';
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  let { user, logoutUser } = useContext(AuthContext);

  const drawer = (
    <div>
      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemText primary="Home" />
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <AppBar position="static" className="AppBar">
      <Toolbar>
        <Hidden smUp implementation="css">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Typography variant="h6" className="navbar-title"></Typography>
        <Hidden xsDown implementation="css">
          <Button color="inherit" component={Link} to="/dashboard">
            Home
          </Button>
          {/* <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button> */}
        
          {user ? (
            <Button color="inherit" onClick={logoutUser}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Hidden>
      </Toolbar>
      <nav className="mobile-nav">
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
    </AppBar>
  );
};

export default Navbar;
