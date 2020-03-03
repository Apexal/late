module.exports = {
  devServer: {
    proxy: 'http://localhost:3000'
  },
  runtimeCompiler: undefined,
  productionSourceMap: false,
  parallel: undefined,

  css: {
    sourceMap: true
  },

  configureWebpack: {
    devtool: 'source-map'
  },
  lintOnSave: 'warning',
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/sw/service-worker.js'
    },
    name: 'LATE',
    themeColor: '#70cad1',
    msTileColor: '#2e3b59'
  }
}
