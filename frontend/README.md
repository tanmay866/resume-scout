# Resume Scout Frontend

This is the frontend application for Resume Scout, built with Next.js.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app
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

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: URL of the backend API (required)

## Project Structure

- `/src/components`: Reusable React components
- `/src/pages`: Next.js pages
- `/src/styles`: CSS styles
- `/src/utils`: Utility functions
- `/public`: Static assets
