const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Health check
app.get('/health', (req, res) => res.send('API Gateway is running'));

// Proxy definitions
const proxies = [
  { path: '/auth', target: 'http://localhost:5001' },
  { path: '/jobs', target: 'http://localhost:5002', ws: true },
  { path: '/match', target: 'http://localhost:5003' },
  { path: '/availability', target: 'http://localhost:5004' },
  { path: '/location', target: 'http://localhost:5005' },
  { path: '/nearby', target: 'http://localhost:5005' },
  { path: '/reviews', target: 'http://localhost:5006' },
  { path: '/socket.io', target: 'http://localhost:5002', ws: true }, // WebSocket for Job Service
];

proxies.forEach(p => {
  app.use(p.path, createProxyMiddleware({
    target: p.target,
    changeOrigin: true,
    ws: p.ws || false,
    logLevel: 'debug',
    pathRewrite: (path, req) => {
      // Because app.use(path) strips the path, we use the original URL
      return req.originalUrl;
    }
  }));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
