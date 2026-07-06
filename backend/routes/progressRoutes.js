const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes
router.get('/', authMiddleware, progressController.getProgress);
router.post('/', authMiddleware, progressController.updateProgress);

module.exports = router;
