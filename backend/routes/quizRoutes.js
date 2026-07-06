const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

const authMiddleware = require('../middleware/authMiddleware');

// IMPORTANT: order matters
router.get('/random', quizController.getRandomQuiz);

router.post('/submit/:id', authMiddleware.optional, quizController.submitQuiz);

router.get('/', quizController.getQuizzes);

router.post('/', quizController.createQuiz);

router.get('/:id', quizController.getQuizById);

module.exports = router;