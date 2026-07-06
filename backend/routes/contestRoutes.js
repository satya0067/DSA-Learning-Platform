const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/', contestController.getContests);
router.get('/:id', contestController.getContestById);
router.post('/:id/join', authMiddleware, contestController.joinContest);

// Admin-only CRUD contest setup
router.post('/', authMiddleware, adminOnly, contestController.createContest);

module.exports = router;
