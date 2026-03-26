import express from 'express';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = 3000;

// Create a simple HTML string for Swagger
const swaggerHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Task Management API</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css">
    <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
</head>
<body>
    <div id="swagger-ui"></div>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: "BaseLayout",
                deepLinking: true
            });
        }
    </script>
</body>
</html>
`;

// Swagger JSON spec
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'Task Management API Documentation',
  },
  servers: [
    { url: `http://localhost:${PORT}`, description: 'Development server' }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { 200: { description: 'OK' } }
      }
    },
    '/api/test': {
      get: {
        summary: 'Test endpoint',
        responses: { 200: { description: 'Success' } }
      }
    }
  }
};

// Serve Swagger UI HTML
app.get('/api-docs', (req, res) => {
  res.send(swaggerHTML);
});

// Serve Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

// Your API endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(PORT, () => {
  console.log('\n=================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/swagger.json`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log('=================================\n');
});

