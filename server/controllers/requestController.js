// controllers/requestController.js
const Request = require('../models/Request');
const User = require('../models/User'); // Needed if populating user details

// @desc    Create a new material request
// @route   POST /api/requests
// @access  Private (Students, Faculty)
const createRequest = async (req, res) => {
    // Zod validation for body should run before this
    const { title, authors, publicationYear, description } = req.body;
    const requestedByUserId = req.user._id; // From 'protect' middleware

    try {
        // Helper function (similar to material controller)
        const parseToArray = (input) => {
            if (!input) return [];
            if (Array.isArray(input)) return input.map(item => item.trim()).filter(Boolean);
            return input.split(',').map(item => item.trim()).filter(Boolean);
        };

        const requestData = {
            title,
            authors: parseToArray(authors),
            publicationYear: publicationYear ? Number(publicationYear) : undefined,
            description,
            requestedBy: requestedByUserId,
            // status defaults to 'pending' via schema
        };

        const newRequest = await Request.create(requestData);

        res.status(201).json({
            success: true,
            message: 'Request submitted successfully.',
            data: newRequest,
        });
    } catch (error) {
        console.error("Create Request Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: `Validation Error: ${error.message}` });
        }
        res.status(500).json({ success: false, message: 'Server error submitting request.' });
    }
};

// @desc    Get requests submitted by the logged-in user
// @route   GET /api/requests/my
// @access  Private
const getMyRequests = async (req, res) => {
    try {
        const myRequests = await Request.find({ requestedBy: req.user._id })
                                        .sort({ requestedAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            count: myRequests.length,
            data: myRequests,
        });
    } catch (error) {
        console.error("Get My Requests Error:", error);
        res.status(500).json({ success: false, message: 'Server error retrieving your requests.' });
    }
};

// @desc    Get all requests (for admin/faculty), filterable by status
// @route   GET /api/requests
// @access  Private (Admin, Faculty)
const getAllRequests = async (req, res) => {
    try {
        let filter = {};
        // Allow filtering by status (e.g., /api/requests?status=pending)
        if (req.query.status && ['pending', 'approved', 'rejected', 'fulfilled'].includes(req.query.status)) {
            filter.status = req.query.status;
        }
         // TODO: Add pagination using api-query-params or manually if needed for many requests

        const allRequests = await Request.find(filter)
                                          .populate('requestedBy', 'name email role') // Show who requested it
                                          .sort({ requestedAt: -1 });

        res.status(200).json({
            success: true,
            count: allRequests.length,
            data: allRequests,
        });
    } catch (error) {
        console.error("Get All Requests Error:", error);
        res.status(500).json({ success: false, message: 'Server error retrieving requests.' });
    }
};


// @desc    Update the status of a request (and optionally add notes/link material)
// @route   PATCH /api/requests/:id/status
// @access  Private (Admin, Faculty)
const updateRequestStatus = async (req, res) => {
    // Zod should validate req.body (status, notes, fulfilledMaterialId)
    const { status, actionNotes, fulfilledMaterialId } = req.body;
    const requestId = req.params.id;

    // Validate status if not using Zod (though Zod is preferred)
     const validStatuses = ['approved', 'rejected', 'fulfilled'];
     if (!status || !validStatuses.includes(status)) {
         return res.status(400).json({ success: false, message: `Invalid status provided. Must be one of: ${validStatuses.join(', ')}` });
     }

    try {
        // Find the request
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }

        // Prevent re-updating if already rejected or fulfilled? (Optional business logic)
        // if (request.status === 'rejected' || request.status === 'fulfilled') {
        //    return res.status(400).json({ success: false, message: `Request status cannot be updated from '${request.status}'`});
        // }

        // Update fields
        request.status = status;
        if (actionNotes) {
            request.actionNotes = actionNotes;
        }
         // If marking as fulfilled, potentially link the actual material
        if (status === 'fulfilled' && fulfilledMaterialId) {
            // TODO: Validate fulfilledMaterialId corresponds to a real Material document (optional check)
             request.fulfilledMaterial = fulfilledMaterialId;
         } else if (status !== 'fulfilled') {
            // Ensure link is removed if status changed away from fulfilled
             request.fulfilledMaterial = null;
             if(status !== 'rejected') { // Clear notes unless rejecting
                 request.actionNotes = actionNotes ?? ''; // Allow clearing notes
             }
         }

        const updatedRequest = await request.save(); // Save the changes

        res.status(200).json({
            success: true,
            message: `Request status updated to '${status}'.`,
            data: updatedRequest,
        });

    } catch (error) {
        console.error("Update Request Status Error:", error);
         if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: `Validation Error: ${error.message}` });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: `Invalid request ID format: ${requestId}` });
        }
        res.status(500).json({ success: false, message: 'Server error updating request status.' });
    }
};


module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
};