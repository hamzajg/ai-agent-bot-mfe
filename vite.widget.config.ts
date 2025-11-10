import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import postcss from "rollup-plugin-postcss";

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, './src/shared'),
      '@modules': resolve(__dirname, './src/modules')
    }
  },
  build: {
    outDir: 'dist/widget',
    emptyOutDir: false,
    lib: {
        entry: 'src/modules/widget/widget.tsx',
      name: 'ChatBot',
      fileName: 'chatbot-widget',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
      plugins: [
        postcss({ extract: false, minimize: true, modules: false }),
      ],
    },
  },
});
