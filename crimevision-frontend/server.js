const express = require('express');
const path = require('path');

const app = express();
const port = parseInt(process.env.X_CATALYST_PORT || process.env.PORT || '9000', 10);
const distPath = path.join(__dirname, 'dist');

console.log(`[STARTUP INFO] Starting Node.js frontend server on port ${port}`);
console.log(`[STARTUP INFO] Serving static files from ${distPath}`);

// 1. Serve pre-compiled Vite static assets
app.use(express.static(distPath));

// 2. Health check endpoint for Catalyst load balancer
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'sentinel-ai-frontend' });
});

// 3. Catch-all SPA route handler returning index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[STARTUP SUCCESS] AppSail Frontend server running on http://0.0.0.0:${port}`);
});
