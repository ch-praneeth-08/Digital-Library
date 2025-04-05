// controllers/forumCategoryController.js
const ForumCategory = require('../models/ForumCategory');

// @desc    Get all forum categories
// @route   GET /api/forum-categories
// @access  Public (usually categories are visible to all)
const getCategories = async (req, res) => {
    try {
        const categories = await ForumCategory.find().sort({ name: 1 }); // Sort alphabetically
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ success: false, message: 'Server error fetching categories.' });
    }
};

// @desc    Create a new forum category
// @route   POST /api/forum-categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    // Basic validation (can enhance with Zod later)
    if (!name) {
         return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    try {
        // Check if category already exists (case-insensitive check recommended)
        const existingCategory = await ForumCategory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
         if (existingCategory) {
            return res.status(400).json({ success: false, message: `Category '${name}' already exists.` });
        }

        const category = await ForumCategory.create({ name, description });
        res.status(201).json({ success: true, message: 'Category created.', data: category });
    } catch (error) {
         console.error("Create Category Error:", error);
          if (error.name === 'ValidationError' || error.code === 11000) { // Handle mongoose validation or duplicate key error
              return res.status(400).json({ success: false, message: error.message });
          }
         res.status(500).json({ success: false, message: 'Server error creating category.' });
    }
};

// @desc    Get a single forum category by ID
// @route   GET /api/forum-categories/:id
// @access  Public
 const getCategoryById = async (req, res) => {
    try {
        const category = await ForumCategory.findById(req.params.id);
         if (!category) {
             return res.status(404).json({ success: false, message: 'Forum category not found.' });
        }
        res.status(200).json({ success: true, data: category });
     } catch (error) {
         console.error("Get Category By ID Error:", error);
         if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid ID format: ${req.params.id}`});
        res.status(500).json({ success: false, message: 'Server error fetching category.' });
     }
 };


// @desc    Update a forum category
// @route   PUT /api/forum-categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
    const { name, description } = req.body;
     // Basic validation
     if (!name) {
        return res.status(400).json({ success: false, message: 'Category name cannot be empty.' });
     }

    try {
         // Ensure new name doesn't clash with *another* existing category (case-insensitive)
         const existingCategory = await ForumCategory.findOne({
            _id: { $ne: req.params.id }, // Exclude the current category itself
             name: { $regex: `^${name}$`, $options: 'i' }
         });
         if (existingCategory) {
            return res.status(400).json({ success: false, message: `Another category with name '${name}' already exists.` });
        }

        // Find and update
        const category = await ForumCategory.findByIdAndUpdate(
            req.params.id,
             { name, description },
            { new: true, runValidators: true } // Return updated doc, run schema validators
         );

         if (!category) {
             return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        res.status(200).json({ success: true, message: 'Category updated.', data: category });
    } catch (error) {
        console.error("Update Category Error:", error);
         if (error.name === 'ValidationError' || error.code === 11000) return res.status(400).json({ success: false, message: error.message });
         if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid ID format: ${req.params.id}`});
        res.status(500).json({ success: false, message: 'Server error updating category.' });
    }
};

// @desc    Delete a forum category
// @route   DELETE /api/forum-categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
    try {
        
        const category = await ForumCategory.findByIdAndDelete(req.params.id);
         if (!category) {
             return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.status(200).json({ success: true, message: 'Category deleted.', data: {} });
    } catch (error) {
        console.error("Delete Category Error:", error);
         if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid ID format: ${req.params.id}`});
        res.status(500).json({ success: false, message: 'Server error deleting category.' });
    }
};


module.exports = {
    getCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
};