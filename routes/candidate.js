const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

// Get candidate profile page
router.get('/:id', candidateController.getCandidateProfile);

// Get candidate feedback
router.get('/:id/feedback', candidateController.getCandidateFeedback);

module.exports = router; 