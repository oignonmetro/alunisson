import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le site est servi depuis https://oignonmetro.github.io/alunisson/ (GitHub Pages
// pour un dépôt de projet) : le build doit connaître ce sous-chemin pour que les
// assets se chargent correctement. En dev, on reste à la racine.
// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/alunisson/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
}))
