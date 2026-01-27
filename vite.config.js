import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets/build', // 👈 folder structure
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: 'src/main.jsx',
      external: [
        '@wordpress/element',
        '@wordpress/api-fetch',
        '@wordpress/i18n',
      ],
      output: {
        format: 'iife',
        name: 'TickeficApp',

        // 👇 deterministic filenames
        entryFileNames: 'assets/build/app.js',
        assetFileNames: 'assets/build/app.[ext]',

        globals: {
          '@wordpress/element': 'wp.element',
          '@wordpress/api-fetch': 'wp.apiFetch',
          '@wordpress/i18n': 'wp.i18n',
        },
      },
    },
  },
});
