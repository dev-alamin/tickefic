import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@wordpress/element'],
      output: {
        globals: {
          '@wordpress/element': 'wp.element',
        },
      },
    },
  }
});
