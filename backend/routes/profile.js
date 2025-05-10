const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all profile routes
// This is kept for extra security even with global middleware to ensure these routes are always protected
router.use(authMiddleware.isAuthenticated);

// Get profile page
router.get('/', profileController.getProfilePage);

// Update profile
router.post('/update', profileController.updateProfile);

// Upload profile picture
router.post('/upload-picture', profileController.uploadProfilePicture);

// Remove profile picture
router.post('/remove-picture', profileController.removeProfilePicture);

// Delete resume
router.post('/resume/delete/:id', profileController.deleteResume);

module.exports = router;