const express = require('express');
const router = express.Router();
const jobMatchingController = require('../controllers/jobMatchingController');

// Get job matching page
router.get('/', jobMatchingController.getJobMatchingPage);

// Match job with candidates
router.post('/', jobMatchingController.matchJob);

module.exports = router; 