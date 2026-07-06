const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:problemId', authMiddleware, noteController.getNote);
router.post('/', authMiddleware, noteController.saveNote);
router.delete('/:problemId', authMiddleware, noteController.deleteNote);

module.exports = router;
