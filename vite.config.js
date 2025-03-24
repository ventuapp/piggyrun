import { defineConfig } from 'vite';

export default defineConfig({
  // config options
  "base": "./",
  //root: './src', // Adjust this to the directory where your index.html file is located
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        sw: '/sw.js'
      }
    },
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  }
});