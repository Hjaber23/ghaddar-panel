const { createProxyMiddleware } = require('http-proxy-middleware');

const apiPort = process.env.API_PORT || 5001;

module.exports = function proxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${apiPort}`,
      changeOrigin: true,
    })
  );
};
