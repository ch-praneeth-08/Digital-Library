// controllers/forumPostController.js
const ForumPost = require('../models/ForumPost');
const ForumThread = require('../models/ForumThread'); // Need thread model to update count/lastReply

// @desc    Create a new post (reply) in a thread
// @route   POST /api/forum-threads/:threadId/posts
// @access  Private (Logged-in users)
const createPost = async (req, res) => {
    const { content } = req.body;
    const authorId = req.user._id;
    const threadId = req.params.threadId; // Get thread ID from route parameter

    // Basic validation (Add Zod later)
    if (!content) {
        return res.status(400).json({ success: false, message: 'Post content cannot be empty.' });
    }
    if (!threadId?.match(/^[0-9a-fA-F]{24}$/)) {
         return res.status(400).json({ success: false, message: `Invalid thread ID format.` });
    }

    try {
        // 1. Find the parent thread & check if it's locked
        const parentThread = await ForumThread.findById(threadId);
        if (!parentThread) {
            return res.status(404).json({ success: false, message: `Thread with ID ${threadId} not found.` });
        }
        if (parentThread.isLocked) {
             return res.status(403).json({ success: false, message: `Thread is locked. No replies allowed.` });
        }

        // 2. Create the new post
        const post = await ForumPost.create({
            thread: threadId,
            author: authorId,
            content,
        });

        // 3. **IMPORTANT:** Update the parent thread's post count and last reply timestamp
        parentThread.postCount = (parentThread.postCount || 0) + 1; // Increment count
        parentThread.lastReplyAt = post.createdAt; // Update timestamp to now
        await parentThread.save();

        // 4. Populate author details for the response
        await post.populate('author', 'name role'); // Send back basic author info

        res.status(201).json({ success: true, message: 'Reply posted successfully.', data: post });

    } catch (error) {
        console.error("Create Post Error:", error);
        if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
         if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid thread ID format: ${threadId}`});
        res.status(500).json({ success: false, message: 'Server error creating post.' });
    }
};


// @desc    Get all posts for a specific thread (with pagination)
// @route   GET /api/forum-threads/:threadId/posts
// @access  Public
const getPostsForThread = async (req, res) => {
    const threadId = req.params.threadId;
    if (!threadId?.match(/^[0-9a-fA-F]{24}$/)) {
         return res.status(400).json({ success: false, message: `Invalid thread ID format.` });
    }

    try {
        // Optional: Verify thread exists first (good practice)
         const threadExists = await ForumThread.findById(threadId);
         if (!threadExists) {
            return res.status(404).json({ success: false, message: `Thread with ID ${threadId} not found.` });
         }

        // --- Pagination --- (Manual logic for now)
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 20; // Default 20 posts per page
         const skip = (page - 1) * limit;

        // --- Find Posts ---
        // Fetch posts for the specific thread, sorted chronologically
        const posts = await ForumPost.find({ thread: threadId })
             .populate('author', 'name role') // Get author details
             .sort({ createdAt: 1 }) // Show oldest posts first within a page
             .skip(skip)
             .limit(limit);

        // --- Get Total Count for Pagination ---
         const totalPosts = await ForumPost.countDocuments({ thread: threadId });

        // --- Prepare Pagination Data ---
         const totalPages = Math.ceil(totalPosts / limit);
         const pagination = {
             currentPage: page, totalPages: totalPages, totalItems: totalPosts, itemsPerPage: limit,
             nextPage: (page < totalPages) ? page + 1 : null,
             prevPage: page > 1 ? page - 1 : null
         };

        res.status(200).json({
            success: true,
            count: posts.length,
            pagination: pagination,
            data: posts
        });

    } catch (error) {
        console.error("Get Posts for Thread Error:", error);
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid ID format provided in request.`});
        res.status(500).json({ success: false, message: 'Server error fetching posts.' });
    }
};


// TODO: Add controllers for updatePost, deletePost later


module.exports = {
    createPost,
    getPostsForThread,
    // Export others later
};