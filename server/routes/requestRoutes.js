// routes/requestRoutes.js
const express = require('express');
const {
    createRequest,
    getMyRequests,
    getAllRequests,
    updateRequestStatus,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Optional: Zod Validation ---
// const validateRequest = require('../middleware/validateRequest');
// const { createRequestSchema, updateRequestStatusSchema } = require('../validations/requestValidation'); // Create this if using Zod

const router = express.Router();

// POST /api/requests - Create a new request
router.post(
    '/',
    protect, // Must be logged in
    authorize('student', 'faculty'), // Students or Faculty can request
    // validateRequest(createRequestSchema), // Optional: Zod validation for request body
    createRequest
);

// GET /api/requests/my - Get requests for the logged-in user
router.get(
    '/my',
    protect, // Must be logged in
    getMyRequests
);

// GET /api/requests - Get all requests (for admins/faculty)
router.get(
    '/',
    protect, // Must be logged in
    authorize('admin', 'faculty'), // Only Admins or Faculty can see all
    // Add optional Zod query validation here if needed
    getAllRequests
);

// PATCH /api/requests/:id/status - Update request status (for admins/faculty)
router.patch(
    '/:id/status',
    protect, // Must be logged in
    authorize('admin', 'faculty'), // Only Admins or Faculty can update status
    // validateRequest(updateRequestStatusSchema), // Optional: Zod validation for update body & ID param
    updateRequestStatus
);


module.exports = router;