const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Make sure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = process.env.PORT || 3004;

// Google Generative AI Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'resume-scout-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Debug middleware to log session info
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`Session exists: ${!!req.session}`);
  console.log(`User in session: ${req.session && req.session.user ? 'Yes (ID: ' + req.session.user.id + ')' : 'No'}`);
  next();
});

// Root route for API information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Resume Scout API',
    version: '1.0.0',
    status: 'online',
    endpoints: [
      '/api - Home API',
      '/api/auth - Authentication',
      '/api/upload-resume - Resume Upload',
      '/api/candidate - Candidate Management',
      '/api/job-matching - Job Matching',
      '/api/profile - User Profile',
      '/api/chatbot - AI Chatbot',
      '/api/resume-analysis - Resume Analysis'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Import routes
const homeRoutes = require('./routes/home');
const aboutRoutes = require('./routes/about');
const uploadRoutes = require('./routes/upload');
const candidateRoutes = require('./routes/candidate');
const jobMatchingRoutes = require('./routes/jobMatching');
const contactRoutes = require('./routes/contact');
const faqRoutes = require('./routes/faq');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const profileRoutes = require('./routes/profile');
const chatbotRoutes = require('./routes/chatbot');
const resumeAnalysisRoutes = require('./routes/resumeAnalysis');

// Global authentication middleware
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware.checkAuth);

// Use routes
app.use('/api', homeRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/upload-resume', uploadRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/job-matching', jobMatchingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/data', apiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/resume-analysis', resumeAnalysisRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('chatMessage', async (message) => {
    console.log('Message received:', message);
    
    try {
      // Check if Gemini API key is configured
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.error('Invalid Gemini API key. Please set a valid key in your .env file.');
        socket.emit('botReply', "I'm sorry, the Gemini API key is not configured correctly. Please contact the administrator.");
        return;
      }
      
      // Generate AI response using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are a helpful assistant for a resume analysis website called "Resume Scout." 
      You provide advice on resume writing, job search strategies, interview preparation, 
      and career development. Answer in a professional, helpful tone.
      
      IMPORTANT FORMATTING INSTRUCTIONS:
      1. Always provide information in a clean, organized format
      2. For complex answers, use a step-by-step approach with numbered steps
      3. Use bullet points for lists and options
      4. Keep your answers concise but thorough
      5. Break down complicated concepts into simple explanations
      6. When appropriate, organize information into clear sections with headings
      7. Use bold formatting for important terms or keywords using markdown syntax
      
      User question: ${message}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();
      
      // Format the response with basic HTML support for structure
      const formattedResponse = aiResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
        .replace(/\n\n/g, '<br><br>')                      // Paragraphs
        .replace(/\n(\d+\. )/g, '<br>$1')                  // Numbered lists
        .replace(/\n(• )/g, '<br>• ')                      // Bullet points
        .replace(/\n(- )/g, '<br>• ');                     // Convert dashes to bullet points
      
      socket.emit('botReply', formattedResponse);
    } catch (error) {
      console.error('Error generating AI response:', error.message);
      if (error.response) {
        console.error('API error status:', error.response.status);
        console.error('API error data:', error.response.data);
      }
      socket.emit('botReply', `I'm sorry, I encountered an error processing your request. Error: ${error.message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Server Error', 
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message 
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
