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
    contact: {
      name: 'API Support',
      email: 'support@taskmanager.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Server is running' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', format: 'password', example: 'password123' },
                  name: { type: 'string', example: 'John Doe' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get user profile',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/tasks': {
      get: {
        summary: 'Get all tasks',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string' }, description: 'Filter by status' },
          { in: 'query', name: 'priority', schema: { type: 'string' }, description: 'Filter by priority' },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 }, description: 'Items per page' },
        ],
        responses: { 200: { description: 'List of tasks' }, 401: { description: 'Unauthorized' } },
      },
      post: {
        summary: 'Create a new task',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Complete project' },
                  description: { type: 'string', example: 'Finish the API' },
                  status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], example: 'pending' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
                  dueDate: { type: 'string', format: 'date-time' },
                  categoryId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Task created' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get task by ID',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Task details' }, 404: { description: 'Not found' }, 401: { description: 'Unauthorized' } },
      },
      put: {
        summary: 'Update a task',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  dueDate: { type: 'string', format: 'date-time' },
                  categoryId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Task updated' }, 404: { description: 'Not found' }, 401: { description: 'Unauthorized' } },
      },
      delete: {
        summary: 'Delete a task',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Task deleted' }, 404: { description: 'Not found' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/categories': {
      get: {
        summary: 'Get all categories',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of categories' }, 401: { description: 'Unauthorized' } },
      },
      post: {
        summary: 'Create a category',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'Work' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Category created' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/categories/{id}': {
      get: {
        summary: 'Get category by ID',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category details' }, 404: { description: 'Not found' }, 401: { description: 'Unauthorized' } },
      },
      put: {
        summary: 'Update a category',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'Updated Category' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Category updated' }, 404: { description: 'Not found' }, 401: { description: 'Unauthorized' } },
      },
      delete: {
        summary: 'Delete a category',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category deleted' }, 404: { description: 'Not found' }, 401: { description: 'Unauthorized' } },
      },
    },
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Task Management API',
    version: '1.0.0',
    status: 'running',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      auth: 'http://localhost:${PORT}/api/auth',
      tasks: 'http://localhost:${PORT}/api/tasks',
      categories: 'http://localhost:${PORT}/api/categories',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    documentation: `http://localhost:${PORT}/api-docs`,
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
  console.log(`📚 Swagger UI:    http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health:       http://localhost:${PORT}/health`);
  console.log(`🔐 Auth:          http://localhost:${PORT}/api/auth`);
  console.log(`📝 Tasks:         http://localhost:${PORT}/api/tasks`);
  console.log(`📁 Categories:    http://localhost:${PORT}/api/categories`);
  console.log('='.repeat(50) + '\n');
});
