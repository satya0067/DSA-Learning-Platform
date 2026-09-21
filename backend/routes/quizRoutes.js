const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// IMPORTANT: order matters
router.get('/random', quizController.getRandomQuiz);

router.post('/submit/:id', authMiddleware.optional, quizController.submitQuiz);

router.get('/', quizController.getQuizzes);
router.get('/:id', quizController.getQuizById);

// Admin-only management
router.post('/', authMiddleware, adminOnly, quizController.createQuiz);

module.exports = router;