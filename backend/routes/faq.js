const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// Get FAQ page
router.get('/', faqController.getFaqPage);

module.exports = router; 