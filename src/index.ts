import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import categoryRoutes from './routes/category.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Dynamic base URL for local or deployed environments
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'Complete REST API for managing tasks with categories and priorities',
    contact: { name: 'API Support', email: 'support@taskmanager.com' },
  },
  servers: [{ url: BASE_URL, description: 'Server URL' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
  paths: {
    '/health': { get: { summary: 'Health check', tags: ['Health'], responses: { 200: { description: 'Server is healthy' } } } },
    // ... (your other paths like /api/auth, /api/tasks, /api/categories stay the same)
  },
};

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Root endpoint with dynamic URLs
app.get('/', (req, res) => {
  res.json({
    name: 'Task Management API',
    version: '1.0.0',
    status: 'running',
    documentation: `${BASE_URL}/api-docs`,
    endpoints: {
      auth: `${BASE_URL}/api/auth`,
      tasks: `${BASE_URL}/api/tasks`,
      categories: `${BASE_URL}/api/categories`,
      health: `${BASE_URL}/health`,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    documentation: `${BASE_URL}/api-docs`,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Task Management API is running!`);
  console.log('='.repeat(50));
  console.log(`📚 Swagger UI:    ${BASE_URL}/api-docs`);
  console.log(`❤️  Health:       ${BASE_URL}/health`);
  console.log(`🔐 Auth:          ${BASE_URL}/api/auth`);
  console.log(`📝 Tasks:         ${BASE_URL}/api/tasks`);
  console.log(`📁 Categories:    ${BASE_URL}/api/categories`);
  console.log('='.repeat(50) + '\n');
});