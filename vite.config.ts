import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves this repo at /Consensus/. Leave PAGES_BASE unset for
// local dev so the app stays at http://localhost:5173/.
const pagesBase = process.env.PAGES_BASE

// https://vite.dev/config/
export default defineConfig({
  base: pagesBase && pagesBase.length > 0 ? pagesBase : '/',
  plugins: [react()],
})
