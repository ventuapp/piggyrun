export default {
  // config options
  "base": "./",
  //root: './src', // Adjust this to the directory where your index.html file is located
  build: {
    rollupOptions: {
      input: './index.html', // Specify the path to your index.html file
    },
  },
}