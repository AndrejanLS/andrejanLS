import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (do arquivo .env ou do painel da Vercel/Netlify)
  // Using '.' instead of process.cwd() ensures compatibility even if Node.js types are missing
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Garante que process.env.API_KEY funcione no navegador após o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});