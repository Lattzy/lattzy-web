import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// El sitio se publica en https://lattzy.github.io/lattzy-web/, por lo que la
// build necesita ese subdirectorio como base. En dev seguimos en la raiz.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/lattzy-web/' : '/',
}))
