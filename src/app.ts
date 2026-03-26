// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Dynamically determine BASE_URL for local or deployed environment
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

// Swagger JSON spec
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'A complete REST API for managing tasks'
  },
  servers: [{ url: BASE_URL }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { 200: { description: 'Server is healthy' } }
      }
    }
  }
};

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task Management API Docs'
}));

// Root endpoint listing all API info and endpoints
app.get('/', (req, res) => {
  res.json({
    name: 'Task Management API',
    version: '1.0.0',
    status: 'running',
    documentation: `${BASE_URL}/api-docs`,
    endpoints: {
      health: `${BASE_URL}/health`,
      auth: `${BASE_URL}/api/auth`,
      tasks: `${BASE_URL}/api/tasks`,
      categories: `${BASE_URL}/api/categories`
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at ${BASE_URL}`);
  console.log(`📚 Swagger docs at ${BASE_URL}/api-docs`);
});