module.exports = {
  lintOnSave: true,

  devServer: {
    proxy: 'http://localhost:3000'
  },

  baseUrl: undefined,
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: false,
  parallel: undefined,

  css: {
    sourceMap: true
  }
};
