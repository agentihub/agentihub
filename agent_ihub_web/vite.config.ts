import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      // Pre-bundle dependencies for faster dev startup
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'antd',
        '@ant-design/icons',
        '@tanstack/react-query',
        'dayjs',
        'immer',
        'react-md-editor',
      ],
    },
    server: {
      // Enable hot module replacement
      hmr: true,
      // Optimize dev server
      host: '0.0.0.0',
      // Configure proxy to solve CORS issues
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          ws: true, // Enable WebSocket proxy
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('[Proxy Error]', err);
            });
            // Uncomment for debugging proxy requests
            // proxy.on('proxyReq', (_proxyReq, req, _res) => {
            //   console.log('[Proxy Request]', req.method, req.url);
            // });
            // proxy.on('proxyRes', (proxyRes, req, _res) => {
            //   console.log('[Proxy Response]', proxyRes.statusCode, req.url);
            // });
          },
        },
      },
    },
    // Environment variables configuration
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __API_BASE_URL__: JSON.stringify(
        env.VITE_API_BASE_URL || 'http://localhost:8080'
      ),
    },
  };
});
