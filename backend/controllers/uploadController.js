/**
 * Upload Controller
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const util = require('util');
const readFilePromise = util.promisify(fs.readFile);

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get upload resume page
exports.getUploadPage = (req, res) => {
  res.render('pages/upload', {
    title: 'Upload Resume',
    user: req.session.user || null
  });
};

// Helper function to extract text from resume
async function extractTextFromResume(filePath, mimeType) {
  try {
    console.log(`Attempting to extract text from file: ${filePath}, mimetype: ${mimeType}`);
    
    // Check if file exists before proceeding
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return "Error: File not found on the server.";
    }
    
    const fileExt = path.extname(filePath).toLowerCase();
    console.log(`File extension: ${fileExt}`);
    
    // Read the file with try/catch
    let fileBuffer;
    try {
      fileBuffer = await readFilePromise(filePath);
      console.log(`Successfully read file, size: ${fileBuffer.length} bytes`);
    } catch (readError) {
      console.error(`Error reading file: ${readError.message}`);
      return `Error reading file: ${readError.message}`;
    }
    
    // Handle PDF files
    if (fileExt === '.pdf' || mimeType === 'application/pdf') {
      console.log('Processing PDF file...');
      try {
        // Import pdf-parse dynamically
        const pdfParse = require('pdf-parse');
        
        // Parse with better options for more thorough extraction
        const pdfOptions = {
          // No page limit to ensure we get the whole document
          // Additional options to improve text extraction quality
          pagerender: function(pageData) {
            // More detailed extraction that preserves formatting better
            return pageData.getTextContent()
              .then(function(textContent) {
                let lastY, text = '';
                // Sort items by vertical position for better reading order
                const items = textContent.items.sort((a, b) => {
                  if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
                    return a.transform[4] - b.transform[4];
                  }
                  return b.transform[5] - a.transform[5];
                });
                
                for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  if (lastY == item.transform[5] || !lastY) {
                    text += item.str;
                  } else {
                    text += '\n' + item.str;
                  }
                  lastY = item.transform[5];
                }
                return text;
              });
          }
        };
        
        const pdfData = await pdfParse(fileBuffer, pdfOptions);
        const extractedText = pdfData.text || '';
        console.log(`PDF parsed successfully, extracted ${extractedText.length} characters`);
        
        // Log a sample of the extracted text for debugging
        console.log(`Sample of extracted text (first 300 chars):\n${extractedText.substring(0, 300)}`);
        
        if (!extractedText || extractedText.trim().length === 0) {
          console.warn('PDF parsing returned empty text');
          return "Warning: PDF parsing returned empty text. The PDF might be scanned or contain only images.";
        }
        
        // Basic cleanup to improve text processing
        const cleanedText = extractedText
          .replace(/(\r\n|\n|\r)/gm, "\n") // Normalize line breaks
          .replace(/\n\s*\n/g, "\n\n")     // Remove excessive empty lines
          .replace(/\t/g, " ")             // Replace tabs with spaces
          .trim();
          
        return cleanedText;
      } catch (pdfError) {
        console.error(`PDF parsing error: ${pdfError.message}`);
        // Try an alternative approach for problematic PDFs
        try {
          const extractedText = fileBuffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
          console.log('Used fallback text extraction for PDF');
          return `Warning: PDF could not be fully parsed. Basic text extraction: ${extractedText.substring(0, 2000)}`;
        } catch (fallbackError) {
          console.error(`Fallback extraction failed: ${fallbackError.message}`);
          return `Error extracting text from PDF: ${pdfError.message}`;
        }
      }
    } 
    // Handle DOCX files
    else if (fileExt === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Processing DOCX file...');
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        console.log(`DOCX parsed successfully, extracted ${result.value.length} characters`);
        return result.value;
      } catch (docxError) {
        console.error(`DOCX parsing error: ${docxError.message}`);
        return `Error extracting text from DOCX: ${docxError.message}`;
      }
    }
    // Handle DOC files
    else if (fileExt === '.doc' || mimeType === 'application/msword') {
      console.log('Processing DOC file (basic extraction)...');
      try {
        // Basic text extraction for DOC files
        const extractedText = fileBuffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        console.log(`Extracted ${extractedText.length} characters from DOC file`);
        return `DOC file detected. Basic text extraction: ${extractedText.substring(0, 5000)}`;
      } catch (docError) {
        console.error(`DOC parsing error: ${docError.message}`);
        return `Error extracting text from DOC: ${docError.message}`;
      }
    }
    // Handle other file types
    else {
      console.log('Unknown file type, using basic text extraction...');
      try {
        const extractedText = fileBuffer.toString('utf8');
        console.log(`Extracted ${extractedText.length} characters`);
        return extractedText;
      } catch (error) {
        console.error(`Text extraction error: ${error.message}`);
        return `Error extracting text from file: ${error.message}`;
      }
    }
  } catch (error) {
    console.error(`General error in extractTextFromResume: ${error.message}`);
    console.error(error.stack);
    return `Error extracting text from resume file: ${error.message}`;
  }
}

// Analyze resume using Gemini API
async function analyzeResumeWithGemini(resumeText, userName = '') {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    You are an expert resume analyzer for a job searching website called "Resume Scout". 
    I'll provide you with resume text content, and I need you to analyze it thoroughly and extract all the information accurately. It's crucial that you only extract information actually present in the resume, without fabricating or adding any details.
    
    Here's the resume text:
    ${resumeText}
    
    Please provide the following analysis in a properly formatted JSON object:
    
    1. Extract basic information:
       - Full Name (if not found, use: "${userName}")
       - Email Address (look for patterns like xxx@xxx.xxx)
       - Phone Number (look for patterns like XXX-XXX-XXXX, (XXX) XXX-XXXX, etc.)
       - Location (city, state, country, etc.)
       
    2. Identify hard skills (technical skills) - ONLY include skills explicitly mentioned in the resume:
       - Extract all specific technical skills mentioned (even single-word mentions count)
       - Include ALL programming languages, tools, software, platforms, methodologies found
       - Look for skills in skills sections, work experience descriptions, and throughout the entire document
       - Be very thorough and extract even brief mentions of technical tools or systems
       - Examples: "Java", "React.js", "TensorFlow", "Agile Methodology", "SQL", "Python", "Microsoft Excel"
       - Do NOT include skills that aren't explicitly mentioned in the resume
       - If NONE are found, return an empty array []
       
    3. Identify soft skills - ONLY include skills explicitly mentioned in the resume:
       - Extract soft skills that are clearly stated in the resume
       - Look for terms like "communication", "leadership", "teamwork", "problem-solving", etc.
       - Only include skills that are specifically mentioned, not implied
       - If NONE are found, return an empty array []
       
    4. Extract education history - ONLY include education entries explicitly mentioned:
       - Look for degree programs, institutions, graduation dates, and fields of study
       - Be thorough in scanning for education information throughout the document
       - Include details like GPA if mentioned
       - If no education information is found, return an empty array []
       - Format each entry with degree, institution, dates, and field of study
       
    5. Extract work experience (for each position):
       - Job Title (exact title as mentioned)
       - Company Name
       - Duration (start and end dates, or date range)
       - Key Responsibilities (parse as bullet points, at least 3-5 for each position)
       - Achievements (specific accomplishments, metrics, results)
       
    6. Provide a brief professional summary (2-3 sentences that highlight core strengths and experience)
    
    7. Provide resume improvement suggestions (4-6 specific, actionable points)
    
    8. Analyze resume strength on a scale of 1-10 (where 10 is excellent)
    
    Return ONLY the JSON without any additional text, explanations or markdown formatting.
    Remember: ONLY include information actually present in the resume. Don't fabricate or add skills or education not mentioned.
    For both skills and education, if none are explicitly mentioned, return empty arrays instead of making up content.
    
    Format your response EXACTLY as follows:
    {
      "basic_info": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "(123) 456-7890",
        "location": "New York, NY"
      },
      "hard_skills": ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "SQL", "Git", "REST APIs", "CI/CD"],
      "soft_skills": ["Communication", "Leadership", "Problem Solving", "Team Collaboration", "Project Management"],
      "education": [
        {
          "degree": "Bachelor of Science",
          "institution": "University of Technology",
          "graduation_date": "2020",
          "field_of_study": "Computer Science",
          "gpa": "3.8/4.0"
        }
      ],
      "work_experience": [
        {
          "job_title": "Senior Software Engineer",
          "company": "Tech Solutions Inc.",
          "duration": "2018-2022",
          "responsibilities": ["Developed scalable web applications", "Implemented CI/CD pipeline", "Mentored junior developers"],
          "achievements": ["Reduced application load time by 40%", "Led migration to microservices architecture"]
        }
      ],
      "professional_summary": "Experienced software engineer with expertise in full-stack development, cloud infrastructure, and agile methodologies. Strong track record of delivering high-performance applications and leading technical teams.",
      "improvement_suggestions": ["Add measurable achievements to work experience", "Include certifications section", "Highlight leadership experience more prominently"],
      "resume_strength": 8
    }
    
    IMPORTANT: Make sure to extract as much detailed information as possible from the resume, but ONLY information that is actually present. Don't include skills or education details that aren't explicitly mentioned in the resume.`;
    
    console.log('Sending prompt to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    console.log('Received response from Gemini API');
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedJson = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON from Gemini response');
        
        // Ensure the response has all expected fields
        const expectedStructure = {
          basic_info: {},
          hard_skills: [],
          soft_skills: [],
          education: [],
          work_experience: [],
          professional_summary: "",
          improvement_suggestions: [],
          resume_strength: 0
        };
        
        // Fill in any missing fields with defaults
        const result = {
          ...expectedStructure,
          ...parsedJson,
          basic_info: {
            ...expectedStructure.basic_info,
            ...(parsedJson.basic_info || {}),
            name: (parsedJson.basic_info && parsedJson.basic_info.name) || userName || 'Not detected'
          }
        };
        
        return result;
      } catch (error) {
        console.error('Error parsing JSON from Gemini response:', error);
        console.error('Raw response text:', responseText);
        throw new Error('Failed to parse resume analysis results');
      }
    } else {
      console.error('No valid JSON found in response:', responseText);
      throw new Error('Failed to get structured data from resume analysis');
    }
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    throw error;
  }
}

// Handle resume upload
exports.uploadResume = async (req, res) => {
  let connection;
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded. Please select a resume file.' 
      });
    }
    
    // Check uploads directory
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (dirError) {
        console.error('Error creating uploads directory:', dirError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to create uploads directory. Please contact administrator.' 
        });
      }
    }
    
    // Get file details
    const { filename, originalname, path: filePath, size, mimetype } = req.file;
    
    // Verify file exists on disk
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ 
        success: false,
        error: 'File upload failed. File not found on server.' 
      });
    }
    
    // Check database connection
    try {
      connection = await pool.getConnection();
      
      // Test execute a simple query to ensure connection is valid
      await connection.execute('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({ 
        success: false,
        error: 'Database connection failed. Please try again later.' 
      });
    }
    
    // Get user ID
    const userId = req.session.user ? req.session.user.id : null;
    
    // Insert resume into database with 'processing' status
    try {
      console.log(`Inserting resume with user_id: ${userId}, filename: ${filename}, filepath: ${filePath}`);
      
      const [result] = await connection.execute(
        'INSERT INTO resumes (user_id, filename, original_filename, file_path, file_size, file_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, filename, originalname, filePath, size, mimetype, 'processing']
      );
      
      const resumeId = result.insertId;
      console.log(`Resume inserted with ID: ${resumeId}`);
      
      // Send immediate response to client
      res.status(200).json({
        success: true,
        message: 'Resume uploaded successfully. Analysis in progress...',
        resumeId
      });
      
      // Begin asynchronous processing of the resume
      processResumeAsync(resumeId, filePath, mimetype, userId, connection.promise ? connection : connection);
      
    } catch (dbInsertError) {
      console.error('Database insert error:', dbInsertError);
      
      // Check if the error is related to the status enum
      if (dbInsertError.message && dbInsertError.message.includes("Data truncated for column 'status'")) {
        // Try with a different status that might be in the enum
        try {
          const [result] = await connection.execute(
            'INSERT INTO resumes (user_id, filename, original_filename, file_path, file_size, file_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, filename, originalname, filePath, size, mimetype, 'pending']
          );
          
          const resumeId = result.insertId;
          
          // Send response
          res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully. Analysis in progress...',
            resumeId
          });
          
          // Begin processing but update status first
          await connection.execute(
            'UPDATE resumes SET status = ? WHERE id = ?',
            ['processing', resumeId]
          );
          
          // Begin async processing
          processResumeAsync(resumeId, filePath, mimetype, userId, connection.promise ? connection : connection);
          
          return;
        } catch (fallbackError) {
          console.error('Fallback insert failed:', fallbackError);
        }
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Failed to record resume details. Database error.' 
      });
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error during upload: ' + error.message 
    });
  }
};

// Asynchronous resume processing function
async function processResumeAsync(resumeId, filePath, mimetype, userId, connection) {
  let userData = null;
  let needToReleaseConnection = true;
  
  try {
    console.log(`Starting async processing for resume ID: ${resumeId}, file: ${filePath}`);
    
    // If we need a new connection (the passed one was already released)
    if (!connection) {
      needToReleaseConnection = true;
      connection = await pool.getConnection();
    }
    
    // Get user data if user ID exists
    if (userId) {
      try {
        const [userRows] = await connection.execute(
          'SELECT id, name, email, phone FROM users WHERE id = ?',
          [userId]
        );
        
        if (userRows.length > 0) {
          userData = userRows[0];
          console.log(`Found user data for ID ${userId}`);
        } else {
          console.log(`No user data found for ID ${userId}`);
        }
      } catch (userError) {
        console.error(`Error retrieving user data: ${userError.message}`);
      }
    }
    
    const userName = userData ? userData.name : '';
    
    // Extract text from resume file
    console.log('Extracting text from resume file...');
    const resumeText = await extractTextFromResume(filePath, mimetype);
    console.log(`Text extraction complete. Extracted ${resumeText.length} characters`);
    
    // Check if text extraction failed or returned an error message
    if (resumeText.startsWith('Error:') || resumeText.startsWith('Warning:')) {
      console.warn(`Text extraction issue: ${resumeText.substring(0, 200)}...`);
      
      // Still proceed with analysis, but with a notification about the issue
      await connection.execute(
        'UPDATE resumes SET status = ? WHERE id = ?',
        ['processing_limited', resumeId]
      );
    }
    
    // Analyze resume with Gemini - with better error handling
    console.log('Sending resume text to Gemini API for analysis...');
    let analysisResult;
    try {
      analysisResult = await analyzeResumeWithGemini(resumeText, userName);
      console.log('Gemini analysis completed successfully');
      
      // Debug: Log the education and skills that were extracted
      console.log('EXTRACTED EDUCATION:', JSON.stringify(analysisResult.education || [], null, 2));
      console.log('EXTRACTED HARD SKILLS:', JSON.stringify(analysisResult.hard_skills || [], null, 2));
      console.log('EXTRACTED SOFT SKILLS:', JSON.stringify(analysisResult.soft_skills || [], null, 2));
      
      // Ensure we have arrays but don't add placeholder content
      analysisResult.hard_skills = analysisResult.hard_skills || [];
      analysisResult.soft_skills = analysisResult.soft_skills || [];
      analysisResult.education = analysisResult.education || [];
      
    } catch (aiError) {
      console.error(`Gemini API error: ${aiError.message}`);
      
      // Create a fallback analysis result but don't add placeholder skills
      analysisResult = {
        basic_info: {
          name: userName || 'Not detected',
          email: userData?.email || 'Not detected',
          phone: userData?.phone || 'Not detected',
          location: 'Not detected'
        },
        hard_skills: [],
        soft_skills: [],
        education: [],
        work_experience: [],
        professional_summary: 'Resume analysis was limited due to technical issues.',
        improvement_suggestions: [
          'Consider using a different file format',
          'Ensure your resume contains selectable text, not images', 
          'Try uploading a simpler version of your resume'
        ],
        resume_strength: 5
      };
      
      // Update resume status to show partial analysis
      await connection.execute(
        'UPDATE resumes SET status = ? WHERE id = ?',
        ['processed_with_errors', resumeId]
      );
    }
    
    // Update resume status to processed if not already changed
    await connection.execute(
      'UPDATE resumes SET status = ? WHERE id = ?',
      ['processed', resumeId]
    );
    
    // Store basic information
    console.log('Storing resume data in database...');
    const contactInfo = analysisResult.basic_info || {};
    
    try {
      await connection.execute(
        'INSERT INTO resume_data (resume_id, name, email, phone, location, summary, parsed_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          resumeId,
          contactInfo.name || userName || 'Not Specified',
          contactInfo.email || (userData ? userData.email : 'Not Specified'),
          contactInfo.phone || (userData && userData.phone ? userData.phone : 'Not Specified'),
          contactInfo.location || 'Not Specified',
          analysisResult.professional_summary || 'Experienced professional with various skills and qualifications.',
          JSON.stringify(analysisResult)
        ]
      );
    } catch (dataError) {
      console.error(`Error storing resume data: ${dataError.message}`);
      
      // Try without the location field in case schema is missing it
      try {
        await connection.execute(
          'INSERT INTO resume_data (resume_id, name, email, phone, summary, parsed_json) VALUES (?, ?, ?, ?, ?, ?)',
          [
            resumeId,
            contactInfo.name || userName || 'Not Specified',
            contactInfo.email || (userData ? userData.email : 'Not Specified'),
            contactInfo.phone || (userData && userData.phone ? userData.phone : 'Not Specified'),
            analysisResult.professional_summary || 'Experienced professional with various skills and qualifications.',
            JSON.stringify(analysisResult)
          ]
        );
      } catch (fallbackError) {
        console.error(`Fallback insert failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
    
    // Store skills
    console.log('Storing skills in database...');
    const allSkills = [
      ...(analysisResult.hard_skills || []),
      ...(analysisResult.soft_skills || [])
    ];
    
    for (const skill of allSkills) {
      if (!skill) continue;
      
      // Check if skill exists
      const [skillRows] = await connection.execute(
        'SELECT id FROM skills WHERE name = ?',
        [skill.toLowerCase()]
      );
      
      let skillId;
      
      if (skillRows.length > 0) {
        skillId = skillRows[0].id;
      } else {
        // Insert new skill
        const [skillResult] = await connection.execute(
          'INSERT INTO skills (name) VALUES (?)',
          [skill.toLowerCase()]
        );
        
        skillId = skillResult.insertId;
      }
      
      // Link skill to resume
      await connection.execute(
        'INSERT INTO resume_skills (resume_id, skill_id) VALUES (?, ?)',
        [resumeId, skillId]
      );
    }
    
    // Generate and store feedback
    console.log('Storing feedback in database...');
    const suggestions = analysisResult.improvement_suggestions || [];
    const feedbackText = suggestions.length > 0 
      ? 'Here are some suggestions to improve your resume:\n- ' + suggestions.join('\n- ')
      : 'Your resume could be improved by adding more quantifiable achievements. Also, consider adding a professional summary section.';
    
    try {
      await connection.execute(
        'INSERT INTO feedback (resume_id, feedback_text, resume_strength) VALUES (?, ?, ?)',
        [resumeId, feedbackText, analysisResult.resume_strength || 7]
      );
    } catch (feedbackError) {
      console.error(`Error storing feedback: ${feedbackError.message}`);
      
      // Try without resume_strength in case schema is missing it
      try {
        await connection.execute(
          'INSERT INTO feedback (resume_id, feedback_text) VALUES (?, ?)',
          [resumeId, feedbackText]
        );
      } catch (fallbackError) {
        console.error(`Fallback feedback insert failed: ${fallbackError.message}`);
      }
    }
    
    console.log(`Resume ${resumeId} processed successfully with Gemini AI`);
  } catch (error) {
    console.error(`Error processing resume: ${error.message}`);
    console.error(error.stack);
    
    try {
      // Update resume status to error
      if (connection) {
        await connection.execute(
          'UPDATE resumes SET status = ? WHERE id = ?',
          ['error', resumeId]
        );
        
        // Store basic error information
        if (!(await checkResumeDataExists(connection, resumeId))) {
          await connection.execute(
            'INSERT INTO resume_data (resume_id, name, email, phone, summary) VALUES (?, ?, ?, ?, ?)',
            [
              resumeId,
              userData ? userData.name : 'Not Specified',
              userData ? userData.email : 'Not Specified',
              (userData && userData.phone) ? userData.phone : 'Not Specified',
              'Error during resume analysis: ' + error.message
            ]
          );
        }
        
        // Store error feedback
        await connection.execute(
          'INSERT INTO feedback (resume_id, feedback_text) VALUES (?, ?)',
          [resumeId, 'There was an error analyzing your resume: ' + error.message + '. Please try uploading again or contact support.']
        );
      }
    } catch (dbError) {
      console.error(`Database error while handling resume processing error: ${dbError.message}`);
    }
  } finally {
    try {
      if (connection && needToReleaseConnection) {
        connection.release();
      }
    } catch (connError) {
      console.error(`Error releasing connection: ${connError.message}`);
    }
  }
}

// Helper function to check if resume data exists
async function checkResumeDataExists(connection, resumeId) {
  const [rows] = await connection.execute(
    'SELECT id FROM resume_data WHERE resume_id = ?',
    [resumeId]
  );
  return rows.length > 0;
} 