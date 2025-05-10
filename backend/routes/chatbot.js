const express = require('express');
const router = express.Router();

// Render the chatbot page
router.get('/', (req, res) => {
  res.render('pages/chatbot', { 
    title: 'Resume Scout AI Assistant',
    user: req.session.user || null
  });
});

module.exports = router; 