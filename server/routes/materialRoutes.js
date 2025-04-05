// routes/materialRoutes.js
const express = require('express');
const { uploadMaterial, getMaterials, deleteMaterial} = require('../controllers/materialController'); // Controller
const { protect, authorize } = require('../middleware/authMiddleware'); // Auth middleware
const { uploadMaterial: multerUpload, handleUploadError } = require('../middleware/uploadMiddleware'); // Multer middleware


const validateRequest = require('../middleware/validateRequest');
const { materialUploadSchema, materialQuerySchema } = require('../validations/materialValidation');
const router = express.Router();

// Route definition for uploading materials
router.post(
  '/upload', // Path: /api/materials/upload
  protect, // 1. Ensure user is logged in
  authorize('faculty', 'admin'), // 2. Ensure user role is faculty or admin
  multerUpload, // 3. Use Multer to handle 'materialFile' upload *before* validation/controller
  handleUploadError, // 4. Handle specific Multer errors (e.g., file size, type filter)
  uploadMaterial // 6. Finally, run the controller logic
);

router.get('/',validateRequest(materialQuerySchema), getMaterials);

router.delete(
    '/:id', 
    protect, 
    deleteMaterial
);
module.exports = router;