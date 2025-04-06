// controllers/forumThreadController.js
const ForumThread = require('../models/ForumThread');
const ForumCategory = require('../models/ForumCategory'); // Needed to check category exists

// @desc    Create a new discussion thread
// @route   POST /api/forum-threads
// @access  Private (Logged-in users)
const createThread = async (req, res) => {
    const { title, content, categoryId } = req.body;
    const authorId = req.user._id;

    // Basic validation (Add Zod later for robustness)
    if (!title || !content || !categoryId) {
         return res.status(400).json({ success: false, message: 'Title, content, and categoryId are required.' });
    }

    try {
        // 1. Verify category exists
        const categoryExists = await ForumCategory.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ success: false, message: `Forum category with ID ${categoryId} not found.` });
        }

        // 2. Create the thread
        const thread = await ForumThread.create({
            title,
            content,
            category: categoryId,
            author: authorId,
            // lastReplyAt defaults to now via schema
        });

        // Optionally populate author details for the response
        await thread.populate('author', 'name email role'); // Adjust fields as needed
        await thread.populate('category', 'name');

        res.status(201).json({ success: true, message: 'Thread created successfully.', data: thread });

    } catch (error) {
        console.error("Create Thread Error:", error);
         if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
         if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid category ID format: ${categoryId}`});
        res.status(500).json({ success: false, message: 'Server error creating thread.' });
    }
};


// @desc    Get all threads, optionally filtered by category
// @route   GET /api/forum-threads?category=<category_id>
// @access  Public
const getThreads = async (req, res) => {
    try {
        // --- Filtering ---
        let filter = {};
        if (req.query.category) {
            const categoryId = req.query.category;
            // Verify category ID format if needed, or let DB query handle CastError
             if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({ success: false, message: `Invalid category ID format: ${categoryId}`});
            }
            // Verify category exists before filtering (optional, good practice)
             const categoryExists = await ForumCategory.findById(categoryId);
             if (!categoryExists) {
                 return res.status(404).json({ success: false, message: `Category with ID ${categoryId} not found.` });
             }
            filter.category = categoryId;
        }

         // --- TODO: Pagination --- (Using manual logic for now)
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 15; // Default 15 threads per page
         const skip = (page - 1) * limit;

         // --- Sorting (Pinned first, then by last reply) ---
         const sort = { isPinned: -1, lastReplyAt: -1 }; // Pinned descending (true first), lastReply descending

         // --- Execute Query ---
         const threads = await ForumThread.find(filter)
             .populate('author', 'name') // Populate author's name
             .populate('category', 'name') // Populate category name
             .sort(sort)
             .skip(skip)
             .limit(limit);

         // --- Get Total Count for Pagination ---
         const totalThreads = await ForumThread.countDocuments(filter);

         // --- Prepare Pagination Data ---
         const totalPages = Math.ceil(totalThreads / limit);
         const pagination = {
             currentPage: page, totalPages: totalPages, totalItems: totalThreads, itemsPerPage: limit,
             nextPage: (page < totalPages) ? page + 1 : null,
             prevPage: page > 1 ? page - 1 : null
         };

        res.status(200).json({
            success: true,
            count: threads.length,
            pagination: pagination,
            data: threads
        });

    } catch (error) {
        console.error("Get Threads Error:", error);
        if (error.name === 'CastError') return res.status(400).json({ success: false, message: `Invalid ID format provided in query.`});
        res.status(500).json({ success: false, message: 'Server error fetching threads.' });
    }
};


// TODO: Implement getThreadById, updateThread, deleteThread, pinThread, lockThread later


module.exports = {
    createThread,
    getThreads,
    // Export other functions as they are implemented
};