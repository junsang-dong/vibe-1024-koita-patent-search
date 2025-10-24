import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // CORS 이슈 대비 프록시 설정 (필요시 사용)
    proxy: {
      // '/api': {
      //   target: 'https://api.openai.com',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, ''),
      // },
    },
  },
  build: {
    // 프로덕션 빌드 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          store: ['zustand'],
        },
      },
    },
  },
})
