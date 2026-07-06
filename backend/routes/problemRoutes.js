const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// Public routes (Auth optional to allow browsing and solving status checking)
router.get('/', authMiddleware.optional, problemController.getProblems);
router.get('/:id', authMiddleware.optional, problemController.getProblemById);

// Admin-only routes for problem management
router.post('/', authMiddleware, adminOnly, problemController.createProblem);
router.put('/:id', authMiddleware, adminOnly, problemController.updateProblem);
router.delete('/:id', authMiddleware, adminOnly, problemController.deleteProblem);

module.exports = router;
