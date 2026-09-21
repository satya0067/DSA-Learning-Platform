const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All routes here strictly require JWT Authentication and Admin privileges
router.use(authMiddleware, adminOnly);

// 1. Stats and Metrics
router.get('/stats', adminController.getStats);

// 2. User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// 3. Problem Management
router.get('/problems', adminController.getAdminProblems);
router.post('/problems', adminController.createProblemWithTestCases);
router.put('/problems/:id', adminController.updateProblemWithTestCases);
router.delete('/problems/:id', adminController.deleteProblem);

// 4. Contest Management
router.get('/contests', adminController.getAdminContests);
router.delete('/contests/:id', adminController.deleteContest);

// 5. Quiz Management
router.get('/quizzes', adminController.getAdminQuizzes);
router.delete('/quizzes/:id', adminController.deleteQuiz);

module.exports = router;
