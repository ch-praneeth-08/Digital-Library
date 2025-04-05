// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// --- Import Page Components ---
import HomePage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage'; // Import the new Upload page
import RequestPage from './pages/RequestPage';
import AdminRequestListPage from './pages/AdminRequestListPage';

// --- Import Utility/Context/Layout Components ---
import { useAuth } from './context/AuthContext'; // To check loading state
import ProtectedRoute from './components/ProtectedRoute'; // To protect routes
import Navbar from './components/Navbar'; // Main navigation

function App() {
  const { isLoading } = useAuth(); // Use auth state to prevent rendering before auth check

  // Show a global loading indicator while the AuthContext initializes
  // This prevents brief flashes of incorrect views (e.g., seeing login when logged in)
  if (isLoading) {
    // You can replace this with a more sophisticated spinner component later
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading Application...
      </div>
    );
  }

  // Once loading is complete, render the main application
  return (
    <Router> {/* BrowserRouter provides routing capabilities */}
      <div className="App">
        <Navbar />

        {/* Optional: Add a consistent main title or header area */}
        {/* Commented out for now as individual pages have titles */}
        {/*
        <header className="app-header">
             <h1>Digital Academic Library</h1>
        </header>
        */}

        <hr /> {/* Simple visual separator */}

        {/* Main content area where routes are rendered */}
        <main className="app-content">
            <Routes> {/* Defines the available routes */}

              {/* --- Public Routes --- */}
              {/* Routes accessible to everyone */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* --- Protected Routes --- */}
              {/* Routes wrapped by ProtectedRoute require authentication */}
              <Route element={<ProtectedRoute />}>
                {/* Dashboard - Main page after login */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Upload Material Page - Accessible only to authenticated (and potentially authorized) users */}
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/request" element={<RequestPage />} />
                <Route path="/admin/requests" element={<AdminRequestListPage />} />

                {/* Add other protected routes here as needed */}
                {/* Example: <Route path="/profile" element={<ProfilePage />} /> */}
                {/* Example: <Route path="/requests" element={<RequestPage />} /> */}
                {/* Example: <Route path="/manage-books" element={<OfflineBookAdminPage />} /> */}

              </Route>

              {/* --- Catch-all Route (Optional) --- */}
              {/* Renders if no other route matches */}
              {/* Example: Create a NotFoundPage component */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
              <Route path="*" element={<div><h2>404 - Page Not Found</h2><p>Sorry, the page you are looking for does not exist.</p></div>} />


            </Routes>
        </main>

        {/* Optional: Add a consistent footer area */}
        {/*
        <footer className="app-footer">
             <p>© {new Date().getFullYear()} Digital Academic Library</p>
        </footer>
        */}
      </div>
    </Router>
  );
}

export default App;