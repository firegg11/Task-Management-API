// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

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
  servers: [{ url: `http://localhost:${PORT}` }],
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
app.use('/task-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task Management API Docs'
}));



// Root
app.get('/', (req, res) => {
  res.json({
    name: 'Task Management API',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/task-docs`
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📚 Swagger docs at http://localhost:${PORT}/task-docs`);
});