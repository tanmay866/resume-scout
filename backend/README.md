# Resume Scout Backend

This is the backend API for Resume Scout, built with Express.js and MySQL.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=3004
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=resume_scout
   SESSION_SECRET=your_session_secret
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:3000
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set the environment variables in the Vercel dashboard
4. Deploy the application

## Database Setup

For production, we recommend using PlanetScale for MySQL database hosting:

1. Create an account on [PlanetScale](https://planetscale.com/)
2. Create a new database
3. Set up your database schema using the SQL in `/config/schema.sql`
4. Get your connection details (host, username, password)
5. Update the environment variables in your Vercel backend project

## Environment Variables

- `PORT`: Port for the server (default: 3004)
- `NODE_ENV`: Environment (development/production)
- `DB_HOST`: MySQL database host
- `DB_USER`: MySQL database user
- `DB_PASSWORD`: MySQL database password
- `DB_NAME`: MySQL database name
- `SESSION_SECRET`: Secret for session management
- `GEMINI_API_KEY`: API key for Google's Gemini AI
- `FRONTEND_URL`: URL of the frontend application (for CORS)

## API Endpoints

All endpoints are prefixed with `/api`:

- `/api/auth`: Authentication endpoints
- `/api/upload-resume`: Resume upload and parsing
- `/api/candidate`: Candidate management
- `/api/job-matching`: Job matching functionality
- `/api/profile`: User profile management
- `/api/chatbot`: AI chatbot functionality
- `/api/resume-analysis`: Resume analysis endpoints
