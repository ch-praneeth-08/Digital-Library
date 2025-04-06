// models/ForumThread.js
const mongoose = require('mongoose');

const forumThreadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Thread title is required.'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters.'],
    },
    content: { // The initial content/post that starts the thread
        type: String,
        required: [true, 'Initial thread content is required.'],
        trim: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the user who created the thread
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ForumCategory', // Reference to the category it belongs to
    },
    isPinned: { // For sticky threads (admin feature)
        type: Boolean,
        default: false,
    },
    isLocked: { // To prevent further replies (admin/moderator feature)
        type: Boolean,
        default: false,
    },
    // Track posts and replies (Simplified for now - complex relation later if needed)
    postCount: { // Number of replies (posts) in the thread
         type: Number,
         default: 0, // Starts with 0 replies (initial content is part of thread)
    },
    lastReplyAt: { // Timestamp of the last reply (or thread creation if no replies)
         type: Date,
         default: Date.now // Initially set to creation time
     },
    // Optional: views: { type: Number, default: 0 }
}, {
    timestamps: true // Adds createdAt, updatedAt
});

// Indexes for common query patterns
forumThreadSchema.index({ category: 1, lastReplyAt: -1 }); // Good for getting threads in a category sorted by activity
forumThreadSchema.index({ isPinned: -1, lastReplyAt: -1 }); // Help fetching pinned threads first

// Middleware to update lastReplyAt on creation if needed
 forumThreadSchema.pre('save', function(next) {
     if (this.isNew) {
         this.lastReplyAt = this.createdAt; // Ensure lastReplyAt matches createdAt for new threads
     }
     next();
 });


const ForumThread = mongoose.model('ForumThread', forumThreadSchema);

module.exports = ForumThread;