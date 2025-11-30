import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: set base to your repository name
// If your repo is https://github.com/username/younirise-tourney
// then base should be '/younirise-tourney/'
// For custom domain or username.github.io, use '/'
const base = process.env.VITE_BASE_PATH || '/younirise-tourney/'

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})

