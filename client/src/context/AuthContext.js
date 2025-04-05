// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // We might need axios later for token validation or user fetching

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('user'); // Clear invalid data
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true); // Indicate initial loading state

    useEffect(() => {
        // This effect runs once on component mount to check initial auth state
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (token) {
            setAuthToken(token);
             // Optionally: Validate token with backend here or fetch fresh user data
            // If you stored user data, try to parse and set it
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error("Failed to parse initial user data", error);
                    localStorage.removeItem('user'); // Clean up if corrupted
                    // Consider logging out if user data is essential and corrupt
                    // logout(); // If needed
                }
            }
            // TODO: Set axios default header if using axios globally
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            // Ensure axios header is clear if no token
             delete axios.defaults.headers.common['Authorization'];
        }
        setIsLoading(false); // Finished initial check
    }, []);

    // Login function updates context and local storage
    const login = (token, userData) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setAuthToken(token);
        setUser(userData);
         // Set axios default header
         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    // Logout function clears context and local storage
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setAuthToken(null);
        setUser(null);
        // Clear axios default header
        delete axios.defaults.headers.common['Authorization'];
    };

    // Value provided to consuming components
    const value = {
        authToken,
        user,
        isLoading, // Provide loading state
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};