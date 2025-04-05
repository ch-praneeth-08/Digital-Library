// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res, next) => {
  // Zod already validated: name, email, password exist and are valid types/formats.
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      // This specific business logic check is still needed
      return res.status(400).json({ message: 'User already exists' });
    }

    // Mongoose will still apply its own schema rules (like unique email index)
    const user = await User.create({
      name,
      email,
      password,
      role, // Pass role; Mongoose default applies if undefined
    });

    // Respond with user info and token
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error("Registration Controller Error:", error);
    // Handle potential Mongoose errors (e.g., unique constraint violation)
    // You might want more sophisticated error handling here or pass to a dedicated error handler
    if (error.code === 11000) { // Mongoose duplicate key error
         return res.status(400).json({ message: 'Email already registered.' });
    }
     if (error.name === 'ValidationError') { // Mongoose validation error (though Zod catches most)
         return res.status(400).json({ message: error.message });
     }
    res.status(500).json({ message: 'Server Error during registration' });
    // Or: next(error); // Pass to a centralized error handler if you implement one
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
   // Zod already validated: email, password exist and email is valid format.
  const { email, password } = req.body;

  // REMOVED: Basic check: if (!email || !password) { ... }

  try {
    const user = await User.findOne({ email }).select('+password');

    // Check user existence and password match
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      // This logic remains crucial for authentication failure
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login Controller Error:", error);
    res.status(500).json({ message: 'Server Error during login' });
    // Or: next(error);
  }
};
const getUserProfile = async (req, res) => {
    // req.user is attached by the 'protect' middleware
    if (req.user) {
      res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      });
    } else {
       // Should not happen if 'protect' works correctly
       res.status(404).json({ message: 'User not found (error in middleware linkage?)' });
    }
  };
  
  
  // --- Add getUserProfile to the module exports ---
  module.exports = {
    registerUser,
    loginUser,
    getUserProfile, // Add the new function here
  };