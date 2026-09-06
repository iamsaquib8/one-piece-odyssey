import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], test: { include: ['src/**/*.test.ts'] }, build: { chunkSizeWarningLimit: 400, rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom', 'motion/react', '@radix-ui/react-dialog'], icons: ['lucide-react'] } } } } });
