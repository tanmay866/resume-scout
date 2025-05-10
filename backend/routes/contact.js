const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Get contact page
router.get('/', contactController.getContactPage);

// Simple form submission (no AJAX)
router.post('/simple-submit', contactController.simpleSubmitForm);

// Submit contact form (AJAX)
router.post('/', contactController.submitContactForm);

module.exports = router; 