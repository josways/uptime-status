import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ command }) => {
  const plugins = [react()];
  if (command === 'build') {
    const { cloudflare } = await import('@cloudflare/vite-plugin');
    plugins.push(cloudflare());
  }
  return {
    plugins,
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: false,
    },
    build: {
      sourcemap: false,
    },
  };
});
