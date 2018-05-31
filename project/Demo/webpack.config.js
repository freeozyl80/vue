var path = require('path')
var webpack = require('webpack')
var VueLoaderPlugin = require('vue-loader/lib/plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ROOT_DIR = path.resolve(__dirname, '../../')
var config = {
  entry: {
    index: path.resolve(__dirname, './entry.js')
  },
  output: {
    path: path.resolve(__dirname, 'production'),
    filename: 'bundler.js'
  },
  module: {
    rules: [{
      test: /\.vue/,
      loader: 'vue-loader'
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: file => (
        /node_modules/.test(file) &&
                !/\.vue\.js/.test(file)
      )
    }]
  }
}

if (process.env.PLATFORM == 'web') {
  Object.assign(config, {
    mode: 'development',
    resolve: {
      alias: {
        vue$: path.resolve(ROOT_DIR, './dist/vue.common.js')
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        chunks: ['index'],
        filename: 'index.html',
        minify: {
          collapseWhitespace: true // 折叠空白区域 也就是压缩代码
        },
        hash: true,
        template: path.resolve(__dirname, './index.html') // 模板地址
      })
    ]
  })
}
if (process.env.PLATFORM == 'plato') {
  Object.assign(config, {
    mode: 'development',
    resolve: {
      alias: {
        compile: path.resolve(__dirname, '../../packages/plato-template-compiler/build.js'),
        VueFrameWork: path.resolve(__dirname, '../../packages/plato-vue-framework/index.js')
      }
    },
    node: {
      fs: 'empty'
    },
    plugins: [
      new VueLoaderPlugin()
    ]
  })
}

module.exports = config
