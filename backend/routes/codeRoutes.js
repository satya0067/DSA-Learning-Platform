const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const authMiddleware = require('../middleware/authMiddleware');

// Code execution is available without login for learning and quick testing.
router.post('/execute', authMiddleware.optional, codeController.executeCode);
router.get('/history', authMiddleware, codeController.getCodeHistory);

module.exports = router;
