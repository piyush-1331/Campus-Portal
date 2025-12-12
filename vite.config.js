import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Campus-Portal/',   // 👈 MUST MATCH YOUR REPOSITORY NAME
  plugins: [react()],
})
