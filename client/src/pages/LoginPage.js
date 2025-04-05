// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './FormStyles.css';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    const loginUrl = `${backendUrl}/api/users/login`;

    try {
      const response = await axios.post(loginUrl, { email, password });

      if (response.data && response.data.token) {
        const token = response.data.token;
        const userData = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        };

        login(token, userData);
        setLoading(false);
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

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title">Welcome Back</h2>
        <p className="form-subtitle">Please login to your account</p>
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="register-text">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
