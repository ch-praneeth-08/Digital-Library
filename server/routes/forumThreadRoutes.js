// routes/forumThreadRoutes.js
const express = require('express');
const {
    createThread,
    getThreads
    // ADD other thread controllers later (getThreadById, update, delete etc.)
} = require('../controllers/forumThreadController');
// *** Import Post Controllers ***
const {
    createPost,
    getPostsForThread
} = require('../controllers/forumPostController');
// *** End Import ***

const { protect, authorize } = require('../middleware/authMiddleware'); // Need 'protect'

// Optional: Zod validation imports...

const router = express.Router();

// --- Thread Routes ---
router.post('/', protect, createThread);
router.get('/', getThreads);
// router.get('/:id', ...) // Add route for single thread later

// --- Post Routes (Nested under threads) ---

// POST /api/forum-threads/:threadId/posts - Create a post in a thread
router.post(
    '/:threadId/posts', // Use threadId from the URL parameter
    protect,            // Must be logged in to post
    // Add Zod validation if needed for post content
    createPost
);

// GET /api/forum-threads/:threadId/posts - Get posts for a thread
router.get(
    '/:threadId/posts', // Use threadId from the URL parameter
    getPostsForThread   // Publicly viewable posts
);

module.exports = router;