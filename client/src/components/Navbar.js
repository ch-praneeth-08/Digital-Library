import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { authToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      alert('An error occurred during logout.');
    }
  };

  const isAdminOrFaculty = user && (user.role === 'faculty' || user.role === 'admin');

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={authToken ? "/dashboard" : "/"}>📚 Digital Library</Link>
      </div>

      <button className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        ☰
      </button>

      <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        {authToken ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/physical-books">Physical Books</Link></li>
            {/* <li><Link to="/discussions">Discussions</Link></li> */}
            {isAdminOrFaculty && <li><Link to="/upload">Upload</Link></li>}
            {/* <li><Link to="/request">Request</Link></li> */}
            {isAdminOrFaculty && <li><Link to="/admin/requests">Requests</Link></li>}
            {isAdminOrFaculty && <li><Link to="/admin/bookings">Bookings</Link></li>}
            <li>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </li>
            <li className="navbar-user">Hi, {user.name} ({user.role})</li>
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
