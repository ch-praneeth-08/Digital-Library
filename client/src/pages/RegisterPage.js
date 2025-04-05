// src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './FormStyles.css'; // We'll create this CSS file next

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default page reload
    setError('');
    setSuccess('');
    setLoading(true);

    // **IMPORTANT: Confirm API endpoint and payload structure with backend dev**
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'; // Use environment variable or default
    const registerUrl = `${backendUrl}/api/users/register`; // Correct endpoint // Example endpoint

    try {
      const response = await axios.post(registerUrl, {
        name,
        email,
        password,
        role, // Make sure backend expects 'role'
      });

      setSuccess('Registration successful! Please log in.');
      setLoading(false);
      // Clear form (optional)
      setName('');
      setEmail('');
      setPassword('');
      setRole('student');
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500); // Redirect after 1.5 seconds

    } catch (err) {
      setLoading(false);
      // Handle errors (improve error message parsing based on backend response)
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Registration Page</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
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
            minLength={6} // Example: Enforce minimum password length
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            {/* Add other roles if needed, confirm with backend */}
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;