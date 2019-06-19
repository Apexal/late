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
  },
  configureWebpack: {
    devtool: 'source-map'
  },
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/sw.js'
    },
    name: 'LATE',
    themeColor: '#70cad1',
    msTileColor: '#2e3b59'
  }
};
