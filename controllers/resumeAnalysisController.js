const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const db = require('../config/db');

// Process uploaded resume
exports.processResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const { id: userId } = req.session.user || {};
    const { filename, originalname, path: filePath, size, mimetype } = req.file;
    
    // Insert resume record into database
    const [resumeResult] = await db.query(
      'INSERT INTO resumes (user_id, filename, original_filename, file_path, file_size, file_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, filename, originalname, filePath, size, mimetype, 'pending']
    );
    
    const resumeId = resumeResult.insertId;
    
    // Get user's information for the analysis
    const userName = req.session.user.name;
    const userEmail = req.session.user.email;
    const userPhone = req.session.user.phone || '(Not provided)';
    const userLocation = req.session.user.location || 'Not specified';
    
    // Perform basic analysis on the resume
    // In a real implementation, this would use an AI service or library for parsing
    const analysisResult = {
      contact_info: {
        name: userName,
        email: userEmail,
        phone: userPhone,
        address: userLocation
      },
      skills: [
        'JavaScript', 'HTML', 'CSS', 'React', 'Node.js',
        'Python', 'Database Management', 'Git', 'Agile'
      ],
      education: [
        {
          institution: 'University of Technology',
          degree: 'Bachelor of Science, Computer Science',
          date: '2015-2019'
        }
      ],
      experience: [
        {
          title: 'Software Developer',
          company: 'Tech Solutions Inc.',
          location: 'Anytown, USA',
          date_range: '2019-Present',
          description: 'Developed web applications using modern JavaScript frameworks.'
        },
        {
          title: 'Intern',
          company: 'Web Innovations',
          location: 'Anytown, USA',
          date_range: '2018-2019',
          description: 'Assisted in frontend and backend development tasks.'
        }
      ],
      summary: 'Experienced software developer with a background in web technologies and computer science.'
    };
    
    // Store parsed data in database
    await db.query(
      'INSERT INTO resume_data (resume_id, name, email, phone, summary, parsed_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        resumeId,
        analysisResult.contact_info.name,
        analysisResult.contact_info.email,
        analysisResult.contact_info.phone,
        analysisResult.summary,
        JSON.stringify(analysisResult)
      ]
    );
    
    // Update resume status
    await db.query('UPDATE resumes SET status = ? WHERE id = ?', ['processed', resumeId]);
    
    // Insert skills
    for (const skill of analysisResult.skills) {
      // Check if skill exists
      let [skillRows] = await db.query('SELECT id FROM skills WHERE name = ?', [skill.toLowerCase()]);
      
      let skillId;
      if (skillRows.length === 0) {
        // Create new skill
        const [newSkill] = await db.query('INSERT INTO skills (name) VALUES (?)', [skill.toLowerCase()]);
        skillId = newSkill.insertId;
      } else {
        skillId = skillRows[0].id;
      }
      
      // Link skill to resume
      await db.query('INSERT INTO resume_skills (resume_id, skill_id) VALUES (?, ?)', [resumeId, skillId]);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      resumeId,
      data: analysisResult
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get resume analysis results
exports.getResumeAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.session.user ? req.session.user.id : null;
    
    // Get resume data
    const [resumeData] = await db.query(
      `SELECT r.id, r.filename, r.original_filename, r.status, r.user_id,
              rd.name, rd.email, rd.phone, rd.summary, rd.parsed_json
       FROM resumes r
       LEFT JOIN resume_data rd ON r.id = rd.resume_id
       WHERE r.id = ?`,
      [resumeId]
    );
    
    if (resumeData.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    
    const resume = resumeData[0];
    
    // If this resume belongs to the logged-in user, use their current information
    if (userId && resume.user_id === userId) {
      resume.name = req.session.user.name;
      resume.email = req.session.user.email;
      resume.phone = req.session.user.phone || resume.phone || '(Not provided)';
      
      // Also update the parsed_json if it exists
      if (resume.parsed_json) {
        const parsedData = JSON.parse(resume.parsed_json);
        if (parsedData.contact_info) {
          parsedData.contact_info.name = req.session.user.name;
          parsedData.contact_info.email = req.session.user.email;
          parsedData.contact_info.phone = req.session.user.phone || parsedData.contact_info.phone;
        }
        resume.parsed_json = JSON.stringify(parsedData);
      }
    }
    
    // Get skills
    const [skills] = await db.query(
      `SELECT s.name
       FROM resume_skills rs
       JOIN skills s ON rs.skill_id = s.id
       WHERE rs.resume_id = ?`,
      [resumeId]
    );
    
    resume.skills = skills.map(s => s.name);
    
    if (resume.parsed_json) {
      resume.parsed_data = JSON.parse(resume.parsed_json);
      delete resume.parsed_json;
    }
    
    return res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    console.error('Error getting resume analysis:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}; 