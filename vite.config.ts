import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // Run demo app during development
    return {
      plugins: [react()],
      root: 'demo',
      // Allow local importing
      resolve: {
        alias: {
          '@lib': '../src',
        },
      },
    };
  } else {
    // Build component for publishing
    return {
      plugins: [react()],
      build: {
        rollupOptions: {
          // Describe external dependencies here
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
    };
  }
});
