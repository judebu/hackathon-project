import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseFromEnv = env.VITE_PUBLIC_BASE?.trim();
  const normalizedBase =
    baseFromEnv && baseFromEnv !== '/'
      ? baseFromEnv.endsWith('/')
        ? baseFromEnv
        : `${baseFromEnv}/`
      : './';

  return {
    base: normalizedBase,
    plugins: [react()],
  };
});
