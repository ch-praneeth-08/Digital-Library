// routes/bookingRoutes.js
const express = require('express');
const {
    createBooking,
    getMyBookings,       // Import new function
    getAllBookings,      // Import new function
    returnBooking        // Import new function
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Optional: Zod Validation imports...

const router = express.Router();

// --- Create Booking ---
router.post('/', protect, createBooking);

// --- View Bookings ---
// GET /api/bookings/my - Get bookings for the logged-in user
router.get(
    '/my',
    protect, // Must be logged in
    getMyBookings
);

// GET /api/bookings - Get all bookings (for admins/faculty)
router.get(
    '/',
    protect, // Must be logged in
    authorize('admin', 'faculty'), // Restricted access
    getAllBookings
);

// --- Return Booking ---
// PATCH /api/bookings/:id/return - Mark a booking as returned
router.patch(
    '/:id/return', // :id refers to the Booking ID
    protect, // Must be logged in
    authorize('admin', 'faculty'), // Only admin/faculty can mark return
    // Add Zod validation for ID param if needed
    returnBooking
);


module.exports = router;