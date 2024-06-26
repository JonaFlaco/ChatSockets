import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy: {
      '/socket.io': {
        target: 'http://192.168.3.21:4000',
        ws: true
      }
    }
  }
})
