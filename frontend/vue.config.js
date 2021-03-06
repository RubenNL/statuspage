module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    port: 8000,
    proxy: {
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      },
      '/api': {
        target: 'http://localhost:8080',
      },
    },
  }
}
