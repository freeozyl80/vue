var webpack = require('webpack')
var path = require('path')

var config = {
	 entry: path.resolve(__dirname, './bundler.js'),
	 output: {
	 	path: path.resolve(__dirname, 'dist'),
    filename: 'bundler.js'
	 },
	 resolve: {
	 	alias: {
	 		compile: path.resolve(__dirname, '../../../packages/plato-template-compiler/build.js'),
	 		VueFrameWork: path.resolve(__dirname, '../../../packages/plato-vue-framework/index.js')
	 	}
	 }
}

module.exports = config
