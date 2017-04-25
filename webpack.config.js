var path = require('path');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
var webpack = require('webpack');
var env = process.env.NODE_ENV;
var CHOOSE_CONFIG = process.env.CHOOSE_CONFIG;

var umd_config = {
	entry: './app/app.js',

	output: {
		library: 'reactivebase',
		libraryTarget: 'umd',
	},

	module: {
		loaders: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015','stage-0', 'react']
				}
			},
			{
				test: /node_modules\/JSONStream\/index\.js$/,
				loaders: ['shebang-loader', 'babel-loader']
			}
		]
	},

	resolve: {
		alias: {
			react: path.resolve(__dirname, './node_modules/react'),
			'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
			'react-addons-transition-group':
					path.resolve(__dirname, './node_modules/react-addons-transition-group'),
		},
	},

	externals: {
		react: {
			root: 'React',
			commonjs2: 'react',
			commonjs: 'react',
			amd: 'react',
		},
		'react-dom': {
			root: 'ReactDOM',
			commonjs2: 'react-dom',
			commonjs: 'react-dom',
			amd: 'react-dom',
		},
		'react-dom/server': {
			root: 'ReactDOMServer',
			commonjs2: 'react-dom-server',
			commonjs: 'react-dom-server',
			amd: 'react-dom-server',
		},
		'react-addons-transition-group': {
			root: ['React', 'addons', 'TransitionGroup'],
			commonjs2: 'react-addons-transition-group',
			commonjs: 'react-addons-transition-group',
			amd: 'react-addons-transition-group',
		},
	},

	plugins: [
		new LodashModuleReplacementPlugin({
			collections: true,
			shorthands: true
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(env),
		}),
	],
};

if (env === 'production') {
	umd_config.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compressor: {
				pure_getters: true,
				unsafe: true,
				unsafe_comps: true,
				warnings: false,
			},
			output: {
				comments: false,
			},
			sourceMap: false,
		})
	);
}

// for lib build
var lib_config = {
	entry: {
		app: './app/app.js'
	},
	output: {
		path: path.join(__dirname, "dist"),
		publicPath: "/dist/",
		filename: '[name].bundle.js'
	},
	module: {
		loaders: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015','stage-0', 'react']
				}
			},
			{
				test: /node_modules\/JSONStream\/index\.js$/,
				loaders: ['shebang', 'babel']
			}
		],
		noParse: ['ws']
	},
	externals: ['ws']
};

// for examples build
var examples_config = {
	entry: {
		main: './main.js',
		list: './examples/list/main.js'
	},
	output: {
		path: path.join(__dirname, "dist"),
		publicPath: "/dist/",
		filename: '[name].bundle.js'
	},
	module: {
		loaders: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015','stage-0', 'react']
				}
			},
			{
				test: /node_modules\/JSONStream\/index\.js$/,
				loaders: ['shebang', 'babel']
			}
		]
	},
};

var final_config;
switch(CHOOSE_CONFIG) {
	case 'UMD':
		final_config = umd_config;
	break;
	case 'EXAMPLES':
	case 'LIB':
	default:
		final_config = lib_config;
	break;
}
module.exports = final_config;
