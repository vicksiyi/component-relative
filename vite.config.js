// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        target: 'esnext',
        outDir: 'dist',
        emptyOutDir: true,
        minify: 'terser',
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, 'src/main.js'),
            formats: ['module']
        },
        rollupOptions: {
            output: {
                entryFileNames: '[name].js'
            }
        }
    }
});
