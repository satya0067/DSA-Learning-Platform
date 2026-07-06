const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/daily', authMiddleware.optional, challengeController.getDailyChallenge);
router.get('/weekly', authMiddleware.optional, challengeController.getWeeklyChallenge);
router.get('/achievements', authMiddleware.optional, challengeController.getAchievements);

module.exports = router;
