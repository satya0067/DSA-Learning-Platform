const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

// Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/change-password', authController.changePassword);
router.put('/forgot-password', authController.forgotPassword);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;