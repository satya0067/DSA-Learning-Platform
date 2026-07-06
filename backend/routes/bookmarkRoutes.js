const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, bookmarkController.getBookmarks);
router.post('/toggle', authMiddleware, bookmarkController.toggleBookmark);

module.exports = router;
