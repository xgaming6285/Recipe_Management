const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          success: false, 
          message: 'Proxy error - Could not connect to the API server. Is the backend running?',
          error: err.message 
        }));
      },
      pathRewrite: {
        '^/api': '/api', // No rewrite needed
      }
    })
  );
}; 