// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Removed Link for now, will add back strategically
import './App.css';

// Import page components
import HomePage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
// Import other protected pages as needed (e.g., ProfilePage, MaterialUploadPage)

// Import utility/context components
import { useAuth } from './context/AuthContext'; // To conditionally render nav links
import ProtectedRoute from './components/ProtectedRoute'; // Import the protector
import Navbar from './components/Navbar'; // We will create this next

function App() {
  const { authToken, isLoading } = useAuth(); // Use auth state for conditional rendering

  // Don't render the main app until the initial auth check is done
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Use the Navbar component */}
        <h1>Digital Academic Library</h1>
        <hr />

        {/* Define Routes */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}> {/* Wrap protected routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Add other protected routes here inside the wrapper */}
            {/* Example: <Route path="/profile" element={<ProfilePage />} /> */}
            {/* Example: <Route path="/upload" element={<MaterialUploadPage />} /> */}
          </Route>

          {/* Optional: Add a catch-all route for 404 Not Found */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;