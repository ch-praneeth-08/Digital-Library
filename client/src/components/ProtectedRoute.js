// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { authToken, isLoading } = useAuth();
    const location = useLocation(); // Get current location

    // Show loading indicator while auth state is being determined
    if (isLoading) {
         // You can replace this with a more sophisticated loading spinner component
        return <div>Loading authentication status...</div>;
    }

    // If finished loading and there's no token, redirect to login
    if (!authToken) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back there after they log in.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the child route components
    return <Outlet />;
};

export default ProtectedRoute;