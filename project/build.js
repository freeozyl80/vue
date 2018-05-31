const webpack = require('webpack');
const argv = require('yargs').argv
const path = require('path')
const webpackDevServer = require('webpack-dev-server');
const options = {
  contentBase: './',
  hot: true,
  host: 'localhost'
};

if (argv.name && argv.pt) {
	process.env.PLATFORM = argv.pt;
	const CONFIGNAME = path.resolve(__dirname, './' + argv.name + '/' + 'webpack.config.js');
	
	try {
		const config = require(CONFIGNAME);
		console.log(config);
		if(argv.pt == 'web') {
			webpackDevServer.addDevServerEntrypoints(config, options);
			const compiler = webpack(config);
			console.log(compiler.compilers);
			const server = new webpackDevServer(compiler, options);

			server.listen(5000, 'localhost', () => {
			  console.log('dev server listening on port 5000');
			});
		} else {
			webpack(config, (err, stats) => {
				if (err) {
					throw err;
				}

				process.stdout.write(`${stats.toString({
				    colors: true,
				    modules: false,
				    children: false,
				    chunks: false,
				    chunkModules: false,
				})}\n\n`);

				if (stats.hasErrors()) {
					console.log('\tBuild failed with errors.\n');
					process.exit(1);
				}

				console.log('\tBuild complete.\n');
			});
		}
	} catch (e) {
		console.log('参数输入错误', e)
	}
} else {
	console.log('please choose your project')
}