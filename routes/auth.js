const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register routes
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.registerUser);

// Login routes
router.get('/login', authController.getLoginPage);
router.post('/login', authController.loginUser);

// Logout route
router.get('/logout', authController.logoutUser);

module.exports = router; 