var webpack = require('webpack')
var path = require('path')

var config = {
	 entry: path.resolve(__dirname, './test.js'),
	 output: {
	 	path: path.resolve(__dirname, 'test'),
    filename: 'bundler.js'
	 }
}

module.exports = config
