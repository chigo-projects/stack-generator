// lib/generators/documentation.js
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function generateDocumentation(projectPath, options) {
  const { projectName, frontendTool, typescript, useYarn } = options;
  
  console.log(chalk.blue('\n📝 Generating documentation...\n'));
  
  try {
    // Generate root README.md
    await generateRootReadme(projectPath, options);
    
    // Generate frontend README.md
    await generateFrontendReadme(path.join(projectPath, 'frontend'), options);
    
    // Generate backend README.md
    await generateBackendReadme(path.join(projectPath, 'backend'), options);
    
    console.log(chalk.green('✅ Documentation generated successfully'));
  } catch (error) {
    console.error(chalk.red('Error generating documentation:'), error);
    throw error;
  }
}

async function generateRootReadme(projectPath, options) {
  const { projectName, frontendTool, typescript, useYarn } = options;
  
  const content = `# ${projectName}

## Project Overview
This is a MERN stack application generated using stack-generator. The project uses a monorepo structure with the following technologies:

### Frontend
- React (using ${frontendTool === 'vite' ? 'Vite' : 'Create React App'})
- ${typescript ? 'TypeScript' : 'JavaScript'}
- React Router Dom
- TanStack Query (React Query)
- Axios

### Backend
- Node.js with Express
- MongoDB with Mongoose
- ${typescript ? 'TypeScript' : 'JavaScript'}
- JWT Authentication ready
- Express middleware for security

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB installed locally or a MongoDB Atlas account
- ${useYarn ? 'Yarn' : 'npm'} package manager

### Installation

1. Clone this repository
\`\`\`bash
git clone <your-repo-url>
cd ${projectName}
\`\`\`

2. Install dependencies
\`\`\`bash
${useYarn ? 'yarn' : 'npm install'}
\`\`\`

3. Set up environment variables
   - Navigate to \`backend\` directory
   - Copy \`.env.example\` to \`.env\`
   - Update the MongoDB URI and other variables as needed

4. Start the development servers
\`\`\`bash
${useYarn ? 'yarn dev' : 'npm run dev'}
\`\`\`

This will start both frontend and backend in development mode.
- Frontend: http://localhost:${frontendTool === 'vite' ? '5173' : '3000'}
- Backend: http://localhost:5000

## Adding Common Dependencies

### Frontend

#### Adding Tailwind CSS

1. Install dependencies
\`\`\`bash
cd frontend
${useYarn ? 'yarn add -D' : 'npm install -D'} tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

2. Update \`tailwind.config.js\`:
\`\`\`javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

3. Add to your CSS:
\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

#### Adding shadcn/ui

1. Initialize:
\`\`\`bash
cd frontend
${useYarn ? 'yarn dlx' : 'npx'} shadcn-ui@latest init
\`\`\`

2. Follow the prompts to configure

3. Install components:
\`\`\`bash
${useYarn ? 'yarn dlx' : 'npx'} shadcn-ui@latest add button
\`\`\`

### Backend

#### Adding Authentication

1. Install packages:
\`\`\`bash
cd backend
${useYarn ? 'yarn add' : 'npm install'} jsonwebtoken bcryptjs
${typescript ? `${useYarn ? 'yarn add -D' : 'npm install -D'} @types/jsonwebtoken @types/bcryptjs` : ''}
\`\`\`

2. Update \`.env\`:
\`\`\`
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
\`\`\`

## Available Scripts

In the project root directory:
- \`${useYarn ? 'yarn' : 'npm run'} dev\` - Start both frontend and backend
- \`${useYarn ? 'yarn' : 'npm run'} build\` - Build both projects
- \`${useYarn ? 'yarn' : 'npm run'} start\` - Start the production server

## Project Structure
\`\`\`
${projectName}/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable components
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   ├── App.${typescript ? 'tsx' : 'jsx'}
│   │   └── main.${typescript ? 'tsx' : 'jsx'}
├── backend/               # Express backend application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   └── index.${typescript ? 'ts' : 'js'}
└── README.md             # This file
\`\`\`

## Contributing
[Add contributing guidelines here]

## License
[Add license information here]`;

  await fs.writeFile(path.join(projectPath, 'README.md'), content);
}

async function generateFrontendReadme(frontendPath, options) {
  const { frontendTool, typescript, useYarn } = options;
  
  const content = `# Frontend Documentation

## Overview
React frontend built with ${frontendTool === 'vite' ? 'Vite' : 'Create React App'} using ${typescript ? 'TypeScript' : 'JavaScript'}.

## Quick Start

1. Install dependencies:
\`\`\`bash
${useYarn ? 'yarn' : 'npm install'}
\`\`\`

2. Start development server:
\`\`\`bash
${useYarn ? 'yarn dev' : 'npm run dev'}
\`\`\`

## Project Structure

\`\`\`
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
│   ├── common/     # Shared components
│   └── layouts/    # Layout components
├── pages/          # Page components
├── services/       # API services
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── App.${typescript ? 'tsx' : 'jsx'}
└── main.${typescript ? 'tsx' : 'jsx'}
\`\`\`

## Available Scripts

- \`${useYarn ? 'yarn' : 'npm run'} dev\` - Start development server
- \`${useYarn ? 'yarn' : 'npm run'} build\` - Build for production
- \`${useYarn ? 'yarn' : 'npm run'} lint\` - Run ESLint
- \`${useYarn ? 'yarn' : 'npm run'} format\` - Format with Prettier

## State Management
- Local state: React's useState hook
- Server state: TanStack Query
- For complex state, consider adding Redux Toolkit or Zustand

## Best Practices

1. Component Organization:
   - One component per file
   - Use index.js files for cleaner imports
   - Keep components small and focused

2. TypeScript (if applicable):
   - Define interfaces for all props
   - Use type inference where possible
   - Avoid using 'any'

3. Styling:
   - Use CSS Modules or Tailwind CSS
   - Keep styles close to components
   - Use CSS variables for theming

4. Performance:
   - Use React.memo for expensive computations
   - Lazy load routes
   - Optimize images and assets`;

  await fs.writeFile(path.join(frontendPath, 'README.md'), content);
}

async function generateBackendReadme(backendPath, options) {
  const { typescript, useYarn } = options;
  
  const content = `# Backend Documentation

## Overview
Express.js backend with MongoDB using ${typescript ? 'TypeScript' : 'JavaScript'}.

## Quick Start

1. Install dependencies:
\`\`\`bash
${useYarn ? 'yarn' : 'npm install'}
\`\`\`

2. Set up environment variables:
   - Copy \`.env.example\` to \`.env\`
   - Update variables as needed

3. Start development server:
\`\`\`bash
${useYarn ? 'yarn dev' : 'npm run dev'}
\`\`\`

## Project Structure

\`\`\`
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/        # Mongoose models
├── routes/        # API routes
└── index.${typescript ? 'ts' : 'js'}
\`\`\`

## Available Scripts

- \`${useYarn ? 'yarn' : 'npm run'} dev\` - Start development server
- \`${useYarn ? 'yarn' : 'npm run'} start\` - Start production server
- \`${useYarn ? 'yarn' : 'npm run'} build\` - Build for production (TypeScript)
- \`${useYarn ? 'yarn' : 'npm run'} lint\` - Run ESLint
- \`${useYarn ? 'yarn' : 'npm run'} format\` - Format with Prettier

## API Documentation

### Base URL
\`\`\`
http://localhost:5000/api/v1
\`\`\`

### Endpoints

#### Example Routes
- \`GET /api/v1/examples\` - Get all examples
- \`POST /api/v1/examples\` - Create new example

## Error Handling

The API uses consistent error responses:

\`\`\`javascript
{
  "success": false,
  "error": "Error message here"
}
\`\`\`

## Best Practices

1. API Structure:
   - Use controllers for route logic
   - Keep routes clean and simple
   - Use middleware for common functionality

2. Security:
   - Always hash passwords
   - Validate input data
   - Use security headers
   - Implement rate limiting

3. Database:
   - Use Mongoose middleware
   - Create indexes for frequently queried fields
   - Implement proper validation

4. Error Handling:
   - Use try-catch in async functions
   - Return appropriate status codes
   - Include helpful error messages`;

  await fs.writeFile(path.join(backendPath, 'README.md'), content);
}