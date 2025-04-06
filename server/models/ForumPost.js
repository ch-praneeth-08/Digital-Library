
// models/ForumPost.js
const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
    thread: { // Reference to the parent thread
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ForumThread',
        index: true, // Index for efficient post retrieval by thread
    },
    author: { // Reference to the user who wrote the post
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    content: { // The actual text content of the reply/post
        type: String,
        required: [true, 'Post content cannot be empty.'],
        trim: true,
    },
    // Optional fields
    isEdited: {
        type: Boolean,
        default: false,
    },
    // quotedPost: { // For quoting another post (optional advanced feature)
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'ForumPost',
    // },
}, {
    timestamps: true // Adds createdAt, updatedAt
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost;