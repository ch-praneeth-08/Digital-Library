// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // We'll create this CSS file next

function Navbar() {
    const { authToken, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Call logout function from context
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to={authToken ? "/dashboard" : "/"}> {/* Link logo to dashboard if logged in, else home */}
                   Digital Library
                </Link>
            </div>
            <ul className="navbar-links">
                {authToken ? (
                    // Links shown when logged IN
                    <>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        {/* Add other protected links here, e.g., Profile, Upload */}
                        {user && <li className="navbar-user">Welcome, {user.name}!</li>} {/* Display user name if available */}
                        <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                    </>
                ) : (
                    // Links shown when logged OUT
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