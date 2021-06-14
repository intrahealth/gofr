const path = require("path");
module.exports = {
  outputDir: path.resolve(__dirname, "../gofr-backend/gui"),
  runtimeCompiler: true,
  transpileDependencies: [
    'vuetify'
  ]
}
