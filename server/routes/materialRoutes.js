// backend/routes/materialRoutes.js
const express = require('express');
const {
    uploadMaterial,
    getMaterials,
    deleteMaterial
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Use the correct exported names from uploadMiddleware
const { uploadMiddleware, handleUploadError } = require('../middleware/uploadMiddleware');

// Optional Zod validation imports...

const router = express.Router();

// POST route for Upload
router.post(
    '/upload',
    protect,                       // Check login
    authorize('faculty', 'admin'), // Check role
    uploadMiddleware,              // Use Multer's upload.single('materialFile')
    handleUploadError,             // Handle specific upload errors AFTER attempting upload
    // validateRequest(materialUploadSchema), // Optional: Validate body AFTER file handling
    uploadMaterial                 // Run controller if upload successful
);

// GET for Search/Filter
router.get(
    '/',
    // validateRequest(materialQuerySchema), // Optional: Validate query params
    getMaterials
);

// DELETE Route for Deleting Material
router.delete(
    '/:id',
    protect,                     // Check login (authorization inside controller)
    deleteMaterial
);

module.exports = router;