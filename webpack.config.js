const path = require('path');
const webpack = require('webpack');
const HTMLPlugin = require('html-webpack-plugin');

module.exports = {
  resolve: {
    alias: {
      assets: `${__dirname}/assets/`,
      js: `${__dirname}/js/`
    },
    mainFields: ['main']
  },
  entry: {
    code: './js/main.js',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'js'),
        path.resolve(__dirname, 'node_modules/black-engine'),
      ],
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [['@babel/preset-env', {
            modules: false,
            targets: {
              node: 'current'
            }
          }]],
          plugins: [
            ['@babel/plugin-transform-runtime', { corejs: 2, useESModules: false, regenerator: true }],
          ],
        },
      },
    }, {
      test: path.resolve(__dirname, 'assets'),
      exclude: /\.json$/,
      loader: 'file-loader',
      options: {
        name: '[name]-[hash:8].[ext]',
      },
    },
    {
      type: 'javascript/auto',
      test: /\.(json)/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'file-loader',
        options: { name: '[name]-[hash:8].[ext]' },
      }],
    }
    ]
  },
  plugins: [
    new HTMLPlugin({
      template: './html/index.html.ejs',
    }),
  ]
}
