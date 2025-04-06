const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const resumeAnalysisController = require('../controllers/resumeAnalysisController');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../config/db');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

// Initialize multer with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Resume upload and analysis endpoint
router.post('/resume/upload', authMiddleware.isAuthenticated, upload.single('resume'), resumeAnalysisController.processResume);

// Get resume details with full data (specific route must come before general route)
router.get('/resume/details/:id', async (req, res) => {
    const resumeId = req.params.id;
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        // Get resume data with parsed_json
        const [resumeResults] = await connection.execute(`
            SELECT r.id, r.filename, r.original_filename, r.file_path, 
                   r.file_size, r.file_type, r.status, r.uploaded_at as created_at,
                   rd.name, rd.email, rd.phone, rd.location, rd.summary, rd.parsed_json,
                   f.feedback_text, f.resume_strength
            FROM resumes r
            LEFT JOIN resume_data rd ON r.id = rd.resume_id
            LEFT JOIN feedback f ON r.id = f.resume_id
            WHERE r.id = ?
        `, [resumeId]);
        
        if (resumeResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }
        
        const resume = resumeResults[0];
        
        // Parse the JSON data if it exists
        if (resume.parsed_json) {
            try {
                resume.parsed_data = JSON.parse(resume.parsed_json);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                resume.parsed_data = {};
            }
            delete resume.parsed_json; // Remove the raw JSON string
        }
        
        // Get skills
        const [skillResults] = await connection.execute(`
            SELECT s.name
            FROM resume_skills rs
            JOIN skills s ON rs.skill_id = s.id
            WHERE rs.resume_id = ?
        `, [resumeId]);
        
        // Add skills to the resume object
        resume.skills = skillResults.map(skill => skill.name);
        
        return res.json({
            success: true,
            resume
        });
    } catch (error) {
        console.error('Error fetching resume:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error when fetching resume details'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Get resume analysis endpoint - using resumeAnalysisController
router.get('/resume/:resumeId', resumeAnalysisController.getResumeAnalysis);

// Job matching endpoint
router.post('/job-match', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { jobDescription, resumeIds } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required' });
    }
    
    // If specific resumes are provided, match only those
    // Otherwise, match all processed resumes
    let resumesToMatch = [];
    
    if (resumeIds && resumeIds.length > 0) {
      // Match specific resumes
      resumesToMatch = resumeIds;
    } else {
      // Get all processed resumes
      const db = require('../config/db');
      const [rows] = await db.query('SELECT id FROM resumes WHERE status = ?', ['processed']);
      resumesToMatch = rows.map(row => row.id);
    }
    
    // Simple job matching algorithm for demonstration
    const db = require('../config/db');
    const matches = [];
    
    // Get keywords from job description
    const keywords = jobDescription.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Get resume data for matching
    for (const resumeId of resumesToMatch) {
      // Get resume data
      const [resumeData] = await db.query(
        `SELECT r.id, rd.name, rd.email, rd.phone, rd.summary
         FROM resumes r
         LEFT JOIN resume_data rd ON r.id = rd.resume_id
         WHERE r.id = ?`,
        [resumeId]
      );
      
      if (resumeData.length === 0) continue;
      
      // Get skills
      const [skillsRows] = await db.query(
        `SELECT s.name
         FROM resume_skills rs
         JOIN skills s ON rs.skill_id = s.id
         WHERE rs.resume_id = ?`,
        [resumeId]
      );
      
      const skills = skillsRows.map(row => row.name);
      
      // Calculate match score based on skills and keywords
      let matchCount = 0;
      const matchingSkills = [];
      
      for (const skill of skills) {
        if (keywords.some(keyword => skill.toLowerCase().includes(keyword))) {
          matchCount++;
          matchingSkills.push(skill);
        }
      }
      
      // Random factor for demonstration
      const randomBoost = Math.floor(Math.random() * 20);
      
      // Calculate match percentage
      const totalScore = skills.length > 0 ? 
        Math.min(100, Math.floor((matchCount / skills.length) * 100) + randomBoost) : 
        randomBoost;
      
      matches.push({
        resumeId,
        name: resumeData[0].name,
        email: resumeData[0].email,
        score: totalScore,
        matchingSkills: matchingSkills.length > 0 ? matchingSkills : skills.slice(0, 3)
      });
    }
    
    // Sort by match score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    return res.status(200).json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Error in job matching:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile
router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    return res.json({
        success: true,
        user: req.session.user
    });
});

module.exports = router; 