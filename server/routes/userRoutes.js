// routes/userRoutes.js
const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile, // Import the new controller function
} = require('../controllers/userController');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema } = require('../validations/userValidation');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import protect and authorize

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);

router.get('/profile', protect, getUserProfile);




module.exports = router;