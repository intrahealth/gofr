const path = require("path");
module.exports = {
  outputDir: path.resolve(__dirname, "../gofr-backend/lib/gofr-backend-site/gui"),
  runtimeCompiler: true,
  transpileDependencies: [
    'vuetify'
  ]
}
