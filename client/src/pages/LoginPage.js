// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import './FormStyles.css'; // Reuse the same form styles

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // **IMPORTANT: Confirm API endpoint and response structure with backend dev**
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'; // Use environment variable or default
    const loginUrl = `${backendUrl}/api/users/login`; // Example endpoint - CONFIRM THIS

    try {
      const response = await axios.post(loginUrl, {
        email,
        password,
      });

      // **IMPORTANT: Confirm the structure of the response data**
      // Assuming the backend sends back { token: '...', user: {...} }
      if (response.data && response.data.token) {
        // Store the token in localStorage
        localStorage.setItem('authToken', response.data.token);

        // Optional: Store user info if needed later
        // localStorage.setItem('user', JSON.stringify(response.data.user));

        setLoading(false);
        // Redirect to the dashboard or main app page
        navigate('/dashboard');
      } else {
        // Handle cases where login is successful but no token is received (shouldn't happen ideally)
        throw new Error('Login successful, but no token received.');
      }

    } catch (err) {
      setLoading(false);
      // Improve error message parsing based on backend response
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Login Page</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default LoginPage;