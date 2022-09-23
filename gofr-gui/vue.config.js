const path = require("path");
module.exports = {
  outputDir: path.resolve(__dirname, "../gofr-backend/lib/gofr-backend-site/gui"),
  runtimeCompiler: true,
  transpileDependencies: ['vuetify'],
  devServer: {
    proxy: {
      '^/gofrapp': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/dictionary': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/auth': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      },
      '^/config': {
        target: 'http://localhost:4000/',
        logLevel: 'debug'
      }
    }
  }
}
