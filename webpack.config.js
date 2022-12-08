const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  context: path.resolve(__dirname, 'src'),
  entry: {
    index: './scripts/index.js',
    renderer: './scripts/renderer.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist/scripts')
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: process.env.NODE_ENV === 'production',
      LIVE2DMODELS: JSON.stringify(require('./src/models'))
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          filter: (filepath) => {
            const excluded = [
              'scripts/index.js',
              'scripts/renderer.js',
              'models.js',
            ].map(file => path.resolve(__dirname, 'src', file))
            return excluded.indexOf(filepath) === -1
          },
          to: path.resolve(__dirname, 'dist/')
        },
        {
          from: path.resolve(__dirname, 'node_modules/pixi.js/dist/pixi.min.js'),
          to: path.resolve(__dirname, 'dist/libs/pixi.js/dist/pixi.min.js')
        },
        {
          from: path.resolve(__dirname, 'node_modules/pixi-live2d-display/dist/index.min.js'),
          to: path.resolve(__dirname, 'dist/libs/pixi-live2d-display/dist/index.min.js')
        },
        {
          from: path.resolve(__dirname, 'node_modules/kalidokit/dist/kalidokit.umd.js'),
          to: path.resolve(__dirname, 'dist/libs/kalidokit/dist/kalidokit.umd.js')
        },
        {
          from: path.resolve(__dirname, 'node_modules/@mediapipe'),
          to: path.resolve(__dirname, 'dist/libs/@mediapipe')
        },
      ],
    }),
  ],
};
