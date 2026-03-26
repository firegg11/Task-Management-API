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
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Complete Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'A complete REST API for managing tasks with user authentication, categories, and priorities',
    contact: {
      name: 'API Support',
      email: 'support@taskmanager.com',
    },
  },
  servers: [
    {
      url: BASE_URL,
      description: 'Production server',
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
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', format: 'date-time' },
          categoryId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Tasks', description: 'Task management endpoints' },
    { name: 'Categories', description: 'Category management endpoints' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: { 200: { description: 'Server is healthy' } },
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
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 400: { description: 'Error' } },
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
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Success' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get user profile',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Success' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/tasks': {
      get: {
        summary: 'Get all tasks',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string' } },
          { in: 'query', name: 'priority', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Success' }, 401: { description: 'Unauthorized' } },
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
        responses: { 201: { description: 'Created' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get task by ID',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' }, 404: { description: 'Not found' } },
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
        responses: { 200: { description: 'Updated' }, 404: { description: 'Not found' } },
      },
      delete: {
        summary: 'Delete a task',
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/api/categories': {
      get: {
        summary: 'Get all categories',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Success' }, 401: { description: 'Unauthorized' } },
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
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/categories/{id}': {
      get: {
        summary: 'Get category by ID',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' }, 404: { description: 'Not found' } },
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
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' }, 404: { description: 'Not found' } },
      },
      delete: {
        summary: 'Delete a category',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
  },
};

// Swagger UI
app.use('/task-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customSiteTitle: 'Task Management API Documentation',
}));

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
    documentation: `${BASE_URL}/task-docs`,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📚 Swagger docs: ${BASE_URL}/task-docs`);
});
