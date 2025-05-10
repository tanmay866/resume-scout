const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Resume analysis page route - handles both with and without ID
router.get('/', async (req, res) => {
  const resumeId = req.query.id;
  
  if (!resumeId) {
    // If no ID provided, show the upload form
    return res.render('pages/upload', {
      title: 'Upload Resume',
      user: req.session.user || null
    });
  }
  
  try {
    // Check if resume exists
    const connection = await pool.getConnection();
    try {
      const [resumeRows] = await connection.execute(
        'SELECT id, status FROM resumes WHERE id = ?', 
        [resumeId]
      );
      
      if (resumeRows.length === 0) {
        return res.status(404).render('pages/404', {
          title: 'Resume Not Found',
          user: req.session.user || null
        });
      }
      
      // Resume found, render the analysis page (client-side JS will fetch the data)
      return res.render('pages/resume-analysis', {
        title: 'Resume Analysis',
        user: req.session.user || null
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error checking resume:', error);
    return res.status(500).render('pages/error', {
      title: 'Server Error',
      message: 'Failed to retrieve resume information.',
      user: req.session.user || null
    });
  }
});

module.exports = router; 