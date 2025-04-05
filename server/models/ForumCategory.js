// models/ForumCategory.js
const mongoose = require('mongoose'); // Should ONLY require mongoose (and maybe others like bcrypt if needed *for the model*)

const forumCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required.'],
        unique: true, // Ensure category names are unique
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '', // Optional description
    },
    // Optional: order field for custom sorting
    // order: { type: Number, default: 0 }
}, {
    timestamps: true // Adds createdAt, updatedAt
});

// Indexes (optional but good)
 // Index name for faster lookups

// Export the Mongoose Model
const ForumCategory = mongoose.model('ForumCategory', forumCategorySchema);
module.exports = ForumCategory;