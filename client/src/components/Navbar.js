// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
    const { authToken, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log('[Navbar] handleLogout called.'); // <-- Add log 1
        try {
            if (typeof logout !== 'function') {
                 console.error('[Navbar] Logout function from context is not a function!', logout);
                 alert('Logout functionality error. Please contact support.'); // User feedback
                 return;
            }
            console.log('[Navbar] Calling context logout function...'); // <-- Add log 2
            logout(); // Call logout function from context
            console.log('[Navbar] Context logout function finished.'); // <-- Add log 3
            console.log('[Navbar] Navigating to /login...'); // <-- Add log 4
            navigate('/login'); // Redirect to login page after logout
            console.log('[Navbar] Navigation complete (or initiated).'); // <-- Add log 5
        } catch (error) {
             console.error('[Navbar] Error during handleLogout:', error);
             alert('An error occurred during logout.'); // User feedback
        }
    };

    // ... rest of the component (return statement) ...
     const isAdminOrFaculty = user && (user.role === 'faculty' || user.role === 'admin'); // **CONFIRM ROLES**

     return (
         <nav className="navbar">
              <div className="navbar-brand">
                 <Link to={authToken ? "/dashboard" : "/"}>Digital Library</Link>
             </div>
             <ul className="navbar-links">
                 {authToken ? (
                     <>
                         <li><Link to="/dashboard">Dashboard</Link></li>
                         {isAdminOrFaculty && <li><Link to="/upload">Upload Material</Link></li>}
                         <li><Link to="/request">Request Material</Link></li>
                         {isAdminOrFaculty && <li><Link to="/admin/requests">Manage Requests</Link></li>}
                         {user && <li className="navbar-user">Welcome, {user.name}! ({user.role})</li>}
                         <li><button onClick={handleLogout} className="logout-button">Logout</button></li> {/* Ensure onClick is here */}
                     </>
                 ) : (
                     <>
                         <li><Link to="/">Home</Link></li>
                         <li><Link to="/login">Login</Link></li>
                         <li><Link to="/register">Register</Link></li>
                     </>
                 )}
             </ul>
         </nav>
     );
}

export default Navbar;