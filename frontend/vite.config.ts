import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Backend: uvicorn --host 0.0.0.0 --port 8002. Proxy hədəfi loopback olmalıdır (0.0.0.0-ə HTTP client ilə qoşulmaq olmaz).
  const apiProxyTarget =
    env.VITE_DEV_PROXY_TARGET || 'http://localhost:8002';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
