// routes/forumCategoryRoutes.js
const express = require('express');
const {
    getCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/forumCategoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Optional: Zod Validation setup if needed later
// const validateRequest = require('../middleware/validateRequest');
// const { categorySchema } = require('../validations/forumValidation');

const router = express.Router();

// Public route to get all categories
router.get('/', getCategories);

// Public route to get a single category
router.get('/:id', getCategoryById);

// Protected Admin routes
router.post(
    '/',
    protect,
    authorize('admin'), // Only admins can create
    // validateRequest(categorySchema), // Add Zod validation later if needed
    createCategory
);

router.put(
    '/:id',
    protect,
    authorize('admin'), // Only admins can update
    // validateRequest(categorySchema), // Add Zod validation later if needed
    updateCategory
);

router.delete(
    '/:id',
    protect,
    authorize('admin'), // Only admins can delete
    deleteCategory
);

module.exports = router;