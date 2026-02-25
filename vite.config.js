import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: ' https://github.com/williamma621/HRV-Research-Software.git',
  plugins: [react()],
})
