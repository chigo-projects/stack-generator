#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createMERNApp } from './lib/stacks/mern.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Available stack configuration
const AVAILABLE_STACKS = {
  MERN: {
    name: 'MERN Stack',
    description: 'MongoDB, Express.js, React.js, Node.js',
    handler: createMERNApp
  }
};

// Question prompt - cli interface
const questions = [
  {
    type: 'input',
    name: 'projectName',
    message: 'What is your project name?',
    validate: (input) => {
      if (/^([A-Za-z\-_\d])+$/.test(input)) return true;
      return 'Project name may only include letters, numbers, underscores and hashes.';
    }
  },
  {
    type: 'list',
    name: 'stack',
    message: 'Which stack would you like to use?',
    choices: Object.keys(AVAILABLE_STACKS).map(key => ({
      name: AVAILABLE_STACKS[key].description,
      value: key
    }))
  }
];

async function init() {
  //this function gets user input and creates the project based on the selected stack
  // create dir if it does exist. if it does, throw an error. else, create the dir
  try {
    console.log(chalk.blue.bold('\n🚀 Welcome to Stack Generator!\n'));
    
    const answers = await inquirer.prompt(questions);
    
    const projectPath = path.join(process.cwd(), answers.projectName);
    
    if (await fs.pathExists(projectPath)) {
      console.log(chalk.red.bold('❌ Directory already exists. Please choose a different name.'));
      process.exit(1);
    }
    
    await fs.mkdir(projectPath);
    
    const selectedStack = AVAILABLE_STACKS[answers.stack];
    
    if (!selectedStack) {
      throw new Error(`Stack ${answers.stack} is not implemented yet.`);
    }
    
    await selectedStack.handler(projectPath);
    
    console.log(chalk.green.bold('\n✨ MERN stack project created successfully!\n'));
    console.log('Next steps:');
    console.log(chalk.yellow(`  cd ${answers.projectName}`));
    console.log(chalk.yellow('  npm install'));
    console.log(chalk.yellow('  npm start\n'));
    
  } catch (error) {
    console.log(chalk.red.bold('❌ Error creating project:'));
    console.error(error);
    process.exit(1);
  }
}

init().catch(console.error);