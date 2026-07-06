const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes (require authentication for submission grading and history check)
router.post('/run', authMiddleware.optional, submissionController.runCode);
router.post('/submit', authMiddleware, submissionController.submitCode);
router.get('/history/:problemId', authMiddleware, submissionController.getSubmissionsHistory);

module.exports = router;
