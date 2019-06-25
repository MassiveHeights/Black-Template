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
  module: {
    rules: [{
      test: path.resolve(__dirname, 'assets'),
      exclude: /\.json$/,
      loader: 'file-loader',
      options: { name: '[name]-[hash:8].[ext]', },
    }, {
      type: 'javascript/auto',
      test: /\.(json)/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'file-loader',
        options: { name: '[name]-[hash:8].[ext]' },
      }],
    }],
  },
  plugins: [
    new HTMLPlugin({
      template: './html/index.html.ejs',
    }),
  ]
};
