import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      
      // THÊM CÁC DÒNG SAU ĐỂ SỬ DỤNG NGROK VÀ LAN KHÔNG BỊ TRẮNG TRANG:
      allowedHosts: true, // Cho phép các domain lạ (như loca.lt hay ngrok) chui vào
      host: true,         // Mở server ra mạng LAN (tương đương 0.0.0.0)
      port: 3000,         // Ép cứng chạy ở port 3000 cho dễ quản lý
    },
  };
});