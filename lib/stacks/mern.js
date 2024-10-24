import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { createFrontend } from '../generators/frontend.js';
import { createBackend } from '../generators/backend.js';
import { generateDocumentation } from '../generators/documentation.js';

const mernQuestions = [
  {
    type: 'list',
    name: 'frontendTool',
    message: 'Choose your React build tool:',
    choices: [
      { name: 'Vite', value: 'vite' },
      { name: 'Create React App', value: 'cra' }
    ]
  },
  {
    type: 'confirm',
    name: 'typescript',
    message: 'Would you like to use TypeScript?',
    default: false
  },
  {
    type: 'confirm',
    name: 'useYarn',
    message: 'Would you like to use Yarn instead of npm?',
    default: false
  }
];

export async function createMERNApp(projectPath) {
  console.log(chalk.blue('\n📦 Configuring your MERN stack project...\n'));

  const answers = await inquirer.prompt(mernQuestions);
  
  // Create directory structure
  const directories = {
    frontend: path.join(projectPath, 'frontend'),
    backend: path.join(projectPath, 'backend')
  };

  // Create directories
  for (const [name, dir] of Object.entries(directories)) {
    await fs.mkdir(dir);
    console.log(chalk.green(`Created ${name} directory`));
  }

  // Create frontend and backend in parallel
  await Promise.all([
    createFrontend(directories.frontend, {
      tool: answers.frontendTool,
      typescript: answers.typescript,
      packageManager: answers.useYarn ? 'yarn' : 'npm'
    }),
    createBackend(directories.backend, {
      typescript: answers.typescript,
      packageManager: answers.useYarn ? 'yarn' : 'npm'
    })
  ]);

  await generateDocumentation(projectPath, {
    projectName: path.basename(projectPath),
    frontendTool: answers.frontendTool,
    typescript: answers.typescript,
    useYarn: answers.useYarn
  });

  // Create root package.json with workspace configuration
  const rootPackageJson = {
    name: path.basename(projectPath),
    version: '1.0.0',
    private: true,
    workspaces: [
      'frontend',
      'backend'
    ],
    scripts: {
      'dev': 'concurrently "npm run dev:frontend" "npm run dev:backend"',
      'dev:frontend': 'npm run dev --workspace=frontend',
      'dev:backend': 'npm run dev --workspace=backend',
      'build': 'npm run build --workspaces',
      'start': 'npm run start:backend',
      'start:backend': 'npm run start --workspace=backend'
    },
    devDependencies: {
      'concurrently': '^8.2.0'
    }
  };

  await fs.writeJSON(path.join(projectPath, 'package.json'), rootPackageJson, { spaces: 2 });
}