// lib/generators/frontend.js
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function createFrontend(frontendPath, options) {
  console.log(chalk.blue('\n🎨 Setting up frontend...\n'));
  
  const { tool, typescript, packageManager } = options;
  
  try {
    if (tool === 'vite') {
      await createViteProject(frontendPath, typescript, packageManager);
    } else {
      await createCRAProject(frontendPath, typescript, packageManager);
    }
    
    // Add additional dependencies
    const dependencies = [
      'axios',
      '@tanstack/react-query',
      'react-router-dom'
    ];
    
    const devDependencies = [
      'prettier',
      'eslint-config-prettier',
      'eslint-plugin-prettier'
    ];
    
    if (typescript) {
      devDependencies.push(
        '@types/node',
        '@types/react',
        '@types/react-dom'
      );
    }
    
    // Install additional dependencies
    const installCmd = packageManager === 'yarn' ? 'yarn add' : 'npm install';
    
    execSync(`${installCmd} ${dependencies.join(' ')}`, {
      cwd: frontendPath,
      stdio: 'inherit'
    });
    
    execSync(`${installCmd} -D ${devDependencies.join(' ')}`, {
      cwd: frontendPath,
      stdio: 'inherit'
    });
    
    // Update package.json scripts
    const packageJson = await fs.readJSON(path.join(frontendPath, 'package.json'));
    packageJson.scripts = {
      ...packageJson.scripts,
      format: 'prettier --write "src/**/*.{js,jsx,ts,tsx}"',
      lint: 'eslint "src/**/*.{js,jsx,ts,tsx}" --fix'
    };
    
    await fs.writeJSON(path.join(frontendPath, 'package.json'), packageJson, { spaces: 2 });
    
  } catch (error) {
    console.error(chalk.red('Error setting up frontend:'), error);
    throw error;
  }
}

async function createViteProject(frontendPath, typescript, packageManager) {
  const template = typescript ? 'react-ts' : 'react';
  const createCmd = packageManager === 'yarn' ? 
    `yarn create vite . --template ${template}` :
    `npm create vite@latest . -- --template ${template}`;
    
  execSync(createCmd, {
    cwd: frontendPath,
    stdio: 'inherit'
  });
}

async function createCRAProject(frontendPath, typescript, packageManager) {
  const createCmd = packageManager === 'yarn' ?
    `yarn create react-app . ${typescript ? '--template typescript' : ''}` :
    `npx create-react-app . ${typescript ? '--template typescript' : ''}`;
    
  execSync(createCmd, {
    cwd: frontendPath,
    stdio: 'inherit'
  });
}