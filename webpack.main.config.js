'use strict'

process.env.BABEL_ENV = 'main'

const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path')
const pkg = require('./app/package.json')
const settings = require('./config.js')
const webpack = require('webpack')

let mainConfig = {
  context: path.join(__dirname, 'app'),
  entry: {
    main: path.join(__dirname, 'app/src/main/index.js')
  },
  externals: Object.keys(pkg.dependencies || {}),
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      },
      {
        test: /\.(jar)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'java/[name].[ext]'
          }
        }
      },
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'app/dist')
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new CopyWebpackPlugin([
        { from: 'java/ste-0.1-jar-with-dependencies.jar', to: 'app/dist' }
    ]),
  ],
  resolve: {
    extensions: ['.js', '.json', '.node'],
    modules: [
      path.join(__dirname, 'app/node_modules')
    ]
  },
  target: 'electron-main'
}

module.exports = mainConfig
