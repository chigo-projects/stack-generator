import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

export async function createBackend(backendPath, options) {
  console.log(chalk.blue('\n🔧 Setting up backend...\n'));
  
  const { typescript, packageManager } = options;
  
  try {
    const packageJson = {
      name: 'backend',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        'dev': 'nodemon src/index.js',
        'start': 'node src/index.js',
        'lint': 'eslint "src/**/*.js" --fix',
        'format': 'prettier --write "src/**/*.js"'
      },
      dependencies: {
        'express': '^4.18.2',
        'mongoose': '^7.0.3',
        'cors': '^2.8.5',
        'dotenv': '^16.0.3',
        'helmet': '^7.0.0',
        'morgan': '^1.10.0'
      },
      devDependencies: {
        'nodemon': '^3.0.1',
        'eslint': '^8.38.0',
        'prettier': '^2.8.7',
        'eslint-config-prettier': '^8.8.0',
        'eslint-plugin-prettier': '^4.2.1'
      }
    };
    
    if (typescript) {
      packageJson.scripts = {
        ...packageJson.scripts,
        'dev': 'ts-node-dev --respawn --transpile-only src/index.ts',
        'build': 'tsc',
        'start': 'node dist/index.js'
      };
      
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        'typescript': '^5.0.4',
        'ts-node-dev': '^2.0.0',
        '@types/express': '^4.17.17',
        '@types/cors': '^2.8.13',
        '@types/morgan': '^1.9.4',
        '@types/node': '^18.15.11'
      };
    }
    
    await fs.writeJSON(path.join(backendPath, 'package.json'), packageJson, { spaces: 2 });
    
    const directories = [
      'src',
      'src/controllers',
      'src/models',
      'src/routes',
      'src/middleware',
      'src/config'
    ];
    
    for (const dir of directories) {
      await fs.mkdir(path.join(backendPath, dir), { recursive: true });
    }
    
    
    const ext = typescript ? 'ts' : 'js';
    
    await createServerFile(backendPath, ext);
    
    await createExampleModel(backendPath, ext);
    
    await createExampleController(backendPath, ext);
    
    await createExampleRoute(backendPath, ext);
    
    await createDbConfig(backendPath, ext);
    
    await createErrorMiddleware(backendPath, ext);
    
    await fs.writeFile(
      path.join(backendPath, '.env'),
      'PORT=5000\nMONGODB_URI=mongodb://localhost:27017/your-database\n'
    );
    
    await fs.writeFile(
      path.join(backendPath, '.env.example'),
      'PORT=5000\nMONGODB_URI=mongodb://localhost:27017/your-database\n'
    );
    
    await fs.writeFile(
      path.join(backendPath, '.gitignore'),
      'node_modules\n.env\ndist\n'
    );
    
    if (typescript) {
      const tsConfig = {
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "node",
          esModuleInterop: true,
          outDir: "./dist",
          rootDir: "./src",
          strict: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"]
      };
      
      await fs.writeJSON(path.join(backendPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
    }
    
    const installCmd = packageManager === 'yarn' ? 'yarn' : 'npm install';
    execSync(installCmd, {
      cwd: backendPath,
      stdio: 'inherit'
    });
    
  } catch (error) {
    console.error(chalk.red('Error setting up backend:'), error);
    throw error;
  }
}

async function createServerFile(backendPath, ext) {
  const content = `import express${ext === 'ts' ? ', { Express, Request, Response, NextFunction }' : ''} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db${ext}';
import { errorHandler } from './middleware/error${ext}';
import exampleRoutes from './routes/example${ext}';

dotenv.config();

const app${ext === 'ts' ? ': Express' : ''} = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1/examples', exampleRoutes);

// Health check
app.get('/health', (req${ext === 'ts' ? ': Request' : ''}, res${ext === 'ts' ? ': Response' : ''}) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Handle unhandled routes
app.use((req${ext === 'ts' ? ': Request' : ''}, res${ext === 'ts' ? ': Response' : ''}) => {
  res.status(404).json({ message: 'Route not found' });
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(\`Server is running on port \${port}\`);
  });
});

export default app;`;

  await fs.writeFile(path.join(backendPath, `src/index.${ext}`), content);
}

async function createExampleModel(backendPath, ext) {
  const content = `import mongoose${ext === 'ts' ? ', { Document }' : ''} from 'mongoose';

${ext === 'ts' ? 'interface IExample extends Document {\n  name: string;\n  description: string;\n  status: string;\n  createdAt: Date;\n}\n\n' : ''}const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model${ext === 'ts' ? '<IExample>' : ''}('Example', exampleSchema);`;

  await fs.writeFile(path.join(backendPath, `src/models/Example.${ext}`), content);
}

async function createExampleController(backendPath, ext) {
  const content = `${ext === 'ts' ? 'import { Request, Response, NextFunction } from \'express\';\n' : ''}import Example from '../models/Example${ext}';

// @desc    Get all examples
// @route   GET /api/v1/examples
// @access  Public
export const getExamples = async (req${ext === 'ts' ? ': Request' : ''}, res${ext === 'ts' ? ': Response' : ''}) => {
  try {
    const examples = await Example.find();
    res.status(200).json({ success: true, data: examples });
  } catch (error${ext === 'ts' ? ': any' : ''}) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new example
// @route   POST /api/v1/examples
// @access  Public
export const createExample = async (req${ext === 'ts' ? ': Request' : ''}, res${ext === 'ts' ? ': Response' : ''}) => {
  try {
    const example = await Example.create(req.body);
    res.status(201).json({ success: true, data: example });
  } catch (error${ext === 'ts' ? ': any' : ''}) {
    res.status(400).json({ success: false, error: error.message });
  }
};`;

  await fs.writeFile(path.join(backendPath, `src/controllers/example.${ext}`), content);
}

async function createExampleRoute(backendPath, ext) {
  const content = `import express${ext === 'ts' ? ', { Router }' : ''} from 'express';
import { getExamples, createExample } from '../controllers/example${ext}';

const router${ext === 'ts' ? ': Router' : ''} = express.Router();

router.route('/')
  .get(getExamples)
  .post(createExample);

export default router;`;

  await fs.writeFile(path.join(backendPath, `src/routes/example.${ext}`), content);
}

async function createDbConfig(backendPath, ext) {
  const content = `import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI${ext === 'ts' ? ' as string' : ''});
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error${ext === 'ts' ? ': any' : ''}) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};`;

  await fs.writeFile(path.join(backendPath, `src/config/db.${ext}`), content);
}

async function createErrorMiddleware(backendPath, ext) {
  const content = `${ext === 'ts' ? 'import { Request, Response, NextFunction } from \'express\';\n\n' : ''}export const errorHandler = (${ext === 'ts' ? 'err: any, req: Request, res: Response, next: NextFunction' : 'err, req, res, next'}) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = \`Resource not found\`;
    error = { ...error, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { ...error, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val${ext === 'ts' ? ': any' : ''}) => val.message);
    error = { ...error, message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};`;

  await fs.writeFile(path.join(backendPath, `src/middleware/error.${ext}`), content);
}