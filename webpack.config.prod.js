const merge = require('webpack-merge')
const common = require('./webpack.config.js')

module.exports = merge(common, {
  mode: 'production',
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
    }],
  }
});