# Deploying Resume Scout to Netlify

## Important: Limitations of Netlify for Full-Stack Applications

Resume Scout is a full-stack Node.js application with several features that don't work well with Netlify's static hosting model:

1. **Server-side rendering with EJS**: Netlify doesn't support server-side template engines like EJS.
2. **MySQL database**: Netlify doesn't provide database hosting.
3. **File uploads**: Netlify doesn't support traditional file system operations.
4. **Session management**: Express sessions work differently in serverless environments.

## Recommended Alternative: Render.com

For a Node.js application with database and file upload requirements, we highly recommend using a platform like Render.com instead.

## If You Must Use Netlify: Required Changes

To fully migrate this application to Netlify, you would need to:

1. **Convert to a JAMstack architecture**:
   - Replace EJS with a static site generator or client-side framework (React, Vue, etc.)
   - Move all server logic to serverless functions
   - Restructure the entire application

2. **Database alternatives**:
   - Use a cloud database service (PlanetScale, MongoDB Atlas, etc.)
   - Update all database connection code

3. **File storage alternatives**:
   - Use Netlify's Blob storage or a service like AWS S3
   - Completely rewrite the upload functionality

4. **Authentication alternatives**:
   - Use Netlify Identity or a service like Auth0
   - Rewrite all authentication logic

## Partial Deployment Setup (Current Status)

This repository includes a basic setup for Netlify Functions:

- `netlify.toml`: Basic configuration file
- `netlify/functions/api.js`: A starter serverless function 

This is only a starting point and **will not work** with the current application architecture.

## Deployment Steps for Render.com (Recommended)

1. Sign up at [Render.com](https://render.com/)
2. Connect your GitHub repository
3. Create a new Web Service
4. Choose Node.js as the environment
5. Set the build command to `npm install`
6. Set the start command to `node server.js`
7. Set up your environment variables
8. Deploy your application 