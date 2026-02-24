import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        proxy: {
          '/api/perplexity': {
            target: 'https://api.perplexity.ai',
            changeOrigin: true,
            rewrite: (path: string) => '/chat/completions',
            configure: (proxy) => {
              const apiKey = env.PERPLEXITY_API_KEY;
              proxy.on('proxyReq', (proxyReq) => {
                if (apiKey) {
                  proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                }
              });
            },
          },
        },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
