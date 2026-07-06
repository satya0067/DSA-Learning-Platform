const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Leaderboard standings can be viewed without auth
router.get('/', leaderboardController.getLeaderboard);

// Editorial downloads require token authentication
router.get('/editorial/:problemId', authMiddleware, leaderboardController.getEditorial);

module.exports = router;
