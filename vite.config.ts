import vite from 'vite';
import react from '@vitejs/plugin-react';
const { defineConfig } = vite;

export default defineConfig({ root: 'src/renderer', plugins: [react()], build: { outDir: '../../dist/renderer', emptyOutDir: false } });
