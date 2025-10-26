import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 👇 This ensures assets load correctly on GitHub Pages
  // Replace 'Terrier-Taste' if your repo name changes
  base: '/Terrier-Taste/',
})
