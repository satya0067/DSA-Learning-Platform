const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route to view discussion lists
router.get('/problem/:problemId', discussionController.getDiscussions);
router.get('/thread/:id', discussionController.getDiscussionById);

// Authentication required for posting threads, writing comments, and liking
router.post('/', authMiddleware, discussionController.createDiscussion);
router.post('/thread/:id/comments', authMiddleware, discussionController.createComment);
router.post('/thread/:id/like', authMiddleware, discussionController.toggleLikeDiscussion);
router.post('/comment/:id/like', authMiddleware, discussionController.toggleLikeComment);

module.exports = router;
