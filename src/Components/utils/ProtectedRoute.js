
import React, { useState, useContext } from 'react';
import { AuthContext } from '../Context/authContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function ProtectedRoute({ roles, ...props }) {
    const { user } = useContext(AuthContext);

    // Check if the user is authenticated and if their role matches one of the allowed roles.
    if (user && roles.includes(user.role)) {
        return <Route {...props} />;
    }

    // Redirect to login
    return <Navigate to="/" replace />;
}
