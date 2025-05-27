import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 8080,
    strictPort: true, // 如果端口被占用则失败
    open: false, // 不自动打开浏览器
    cors: true, // 启用CORS
  },
  preview: {
    host: '0.0.0.0',
    port: 8080,
  }
})
