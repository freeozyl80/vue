var webpack = require('webpack')
var path = require('path')

var config = {
  entry: path.resolve(__dirname, './entry.js'),
  output: {
    path: path.resolve(__dirname, 'production'),
    filename: 'bundler.js'
  },
  resolve: {
    alias: {
      compile: path.resolve(__dirname, '../../packages/plato-template-compiler/build.js'),
      VueFrameWork: path.resolve(__dirname, '../../packages/plato-vue-framework/index.js')
    }
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }]
  },
  node: {
    fs: 'empty'
  }
}

module.exports = config
