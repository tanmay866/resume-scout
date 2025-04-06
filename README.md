# Resume Scout - AI-Powered Resume Analyzer

## 🚀 Project Overview
Resume Scout is a dynamic, fully responsive, and scalable AI-powered Resume Analyzer Website developed as part of a Second-Year College Project. It includes features such as resume uploads, authentication, and AI-powered job matching.

## 📸 Screenshots
![image](https://github.com/user-attachments/assets/16476c0c-9e94-4248-a2a7-e93850555911)
![image](https://github.com/user-attachments/assets/bcc25d08-8705-46c2-a1f9-70773d0caaf9)
![image](https://github.com/user-attachments/assets/ff008df0-7155-4966-b3dd-c3e44cb1b2df)
![image](https://github.com/user-attachments/assets/e7e44e2e-754e-47bc-88f0-c1d852f087f9)
![image](https://github.com/user-attachments/assets/b51b5604-dea9-4b30-888f-c620fbf729c8)






## 💻 Technical Stack
**🖥️ Frontend**
-HTML, CSS (Tailwind CSS), JavaScript, EJS (Embedded JavaScript Templates)

**🛠️ Backend**
-Node.js with Express.js framework, RESTful API architecture

**🗃️ Database**
-MySQL(Used for storing user data, resumes, and analysis results)

**📄 File Processing**
-Multer – Middleware for handling file uploads, pdf-parse – For extracting text from PDF resumes, mammoth – For extracting text from DOCX files

**🔐 Authentication**
-bcryptjs – For secure password hashing, express-session – For session management

**🤖 AI Integration**
-Google Generative AI (Gemini API), Resume parsing and skill extraction, Matching resumes with job descriptions

**🧰 Development Tools**
-nodemon – Auto-restarting development server, dotenv – Managing environment variables

**🚀 Deployment**
-GitHub – Version control and collaboration, Local Server Deployment – Runs on http://localhost:3004 

## ✨ Features
- **Resume Upload & Analysis**: Upload resumes in PDF or DOCX format for AI-powered analysis
- **Job Matching**: Find the best-matched candidates for job descriptions using AI
- **User Authentication**: Register and login to save and manage resumes
- **Responsive Design**: Fully responsive UI that works on all screen sizes
- **Feedback System**: Get AI-generated feedback on resume improvements
- **Color-coded Matching**: Green (75-100%), Yellow (50-74%), Red (0-49%)

## 🎨 Color Theme
- **Primary Color:** Dark Blue (#1E3A8A)
- **Secondary Color:** Light Blue (#3B82F6)
- **Background:** White (#FFFFFF)
- **Text Color:** Dark Gray (#1F2937)
- **Accent:** Soft Gray (#E5E7EB)

## 📌 Website Structure (Pages)
- **Home Page** (`/`): Hero section, features, and CTA
- **About Page** (`/about`): Overview and benefits of Resume Scout
- **Upload Resume Page** (`/upload-resume`): Drag-and-drop file upload
- **Candidate Profile Page** (`/candidate/:id`): View analyzed resume data
- **Job Matching Page** (`/job-matching`): Match job descriptions with candidates
- **Contact Page** (`/contact`): Contact form and information
- **FAQ Page** (`/faq`): Common questions and answers
- **Authentication Pages** (`/auth/login`, `/auth/register`): User login and registration

## 🛠️ Installation

### Prerequisites
- Node.js (v14+ recommended)
- MySQL

### Steps
1. Clone the repository:
```bash
git clone https://github.com/tanmay866/resume-scout.git
cd resume-scout
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following:
```
PORT=3004
DB_HOST=localhost
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=resume_scout
SESSION_SECRET=your_session_secret
GEMINI_API_KEY=your_gemini_api_key
```

4. Create the MySQL database:
```bash
mysql -u root -p
CREATE DATABASE resume_scout;
```

5. Start the server:
```bash
npm start
```

## 🔍 Project Structure
```
resume-scout/
├── config/              # Configuration files
│   ├── db.js            # Database connection
│   └── schema.sql       # Database schema
├── controllers/         # Route controllers
├── models/              # Database models
├── public/              # Static assets
│   ├── css/             # CSS files
│   ├── js/              # JavaScript files
│   └── images/          # Images
├── routes/              # Route definitions
├── uploads/             # Uploaded resumes
├── views/               # EJS templates
│   ├── pages/           # Page templates
│   └── partials/        # Reusable components
├── .env                 # Environment variables
├── package.json         # Project dependencies
├── server.js            # Entry point
└── README.md            # Project documentation
```

## 🔒 Security Considerations
- User passwords are hashed using bcrypt
- Environment variables for sensitive information
- Input validation on all forms
- File type validation for resume uploads

## ⚡ Future Enhancements
- Implement actual AI/ML algorithms for resume parsing
- Add social login (Google, LinkedIn)
- Develop admin dashboard for managing users and resumes
- Create API endpoints for third-party integrations
- Add email notifications for job matches

## 📄 License
This project is part of a Second-Year College Project.

## 👨‍💻 Team
This project was created by Tanmay, Rudra, Nainil and Tanmay.
