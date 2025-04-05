// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Need User model to find the user from token payload
const dotenv = require('dotenv');

dotenv.config();

// Middleware to protect routes - verify token and attach user to request
const protect = async (req, res, next) => {
  let token;

  // Check for token in the Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(' ')[1]; // ["Bearer", "token"]

      // 2. Verify token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user details from the token's payload (id)
      // Exclude the password when fetching user
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         // Handle case where user associated with token no longer exists
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Token is valid, user is found, proceed to the next middleware/controller
      next();

    } catch (error) {
      console.error('Token verification failed:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Not authorized, token failed (invalid signature)' });
      } else if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is found in the header
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};


// Middleware to restrict routes based on user role(s)
// Takes an array or string of allowed roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if req.user was attached by the 'protect' middleware
    if (!req.user || !req.user.role) {
         // This should technically not happen if 'protect' runs first, but good failsafe
         return res.status(401).json({ message: 'User not authenticated for role check' });
    }

    // Check if the user's role is included in the allowed roles for the route
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ // 403 Forbidden - authenticated but not permitted
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`,
      });
    }
    // User has the required role, proceed
    next();
  };
};


module.exports = { protect, authorize };