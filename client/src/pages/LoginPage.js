// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './FormStyles.css';
import { useAuth } from '../context/AuthContext'; // Import useAuth

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    const loginUrl = `${backendUrl}/api/users/login`;

    try {
      const response = await axios.post(loginUrl, {
        email,
        password,
      });

      if (response.data && response.data.token) {
        // Extract token and user data from response (as confirmed before)
        const token = response.data.token;
        const userData = {
            id: response.data._id,
            name: response.data.name,
            email: response.data.email,
            role: response.data.role,
        };

        // Call the login function from AuthContext
        login(token, userData);

        setLoading(false);
        // Redirect after successful context update
        navigate('/dashboard');
      } else {
        throw new Error('Login successful, but no token received.');
      }

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err.response?.data || err.message);
    }
  };

  // ... rest of the component (return statement) remains the same
    return (
        <div className="form-container">
        <h2>Login Page</h2>
        <form onSubmit={handleSubmit}>
            {/* ... form inputs ... */}
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