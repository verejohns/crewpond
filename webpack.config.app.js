const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

module.exports.entry = {
  main: './client/react/App/index.js',
};

module.exports.output = {
  path: path.resolve(__dirname, "static"),
  filename: 'js/app.js',
  publicPath: '/static/js/app.js'
};

module.exports.resolve = {
  extensions: ['.js', '.jsx'],
};

module.exports.module = {
  rules: [
    {
      loader: 'file-loader?name=[name].[ext]&outputPath=fonts&publicPath=/static/fonts',
      test: /\.(woff|woff2|eot|ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    },
    {
      test: /\.(sass|scss|css)$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: ['css-loader', 'sass-loader'],
      }),
    },
    {
      test: /\.svg$/,
      use: [
        {
          loader: require.resolve('babel-loader'),
        },
        {
          loader: require.resolve('react-svg-loader'),
          options: {
            jsx: true, // true outputs JSX tags
          },
        },
      ],
    },
    {
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: [
          '@babel/react',
          '@babel/env',
          {
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ]
          }
        ]
      },
      test: /\.(js|jsx$$)/,
    },
    {
      // I want to uglify with mangling only app files, not thirdparty libs
      test: /.*\/app\/.*\.js$/,
      exclude: /.spec.js/, // excluding .spec files
      loader: 'uglify',
    },
  ],
};

module.exports.devtool = 'source-map';

/*
** make process.env is usable in the front-end
 */
const basePath = path.resolve(__dirname, ".env");
let envPath = basePath + '.' + process.env.NODE_ENV;
envPath = fs.existsSync(envPath) ? envPath : basePath;
const fileEnv = dotenv.config({ path: envPath }).parsed;
const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
  return prev;
}, {});

module.exports.plugins = [
  new ExtractTextPlugin({ filename: 'css/app.css' }),
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    Popper: ['popper.js', 'default'],
    Util: 'exports-loader?Util!bootstrap/js/dist/util',
  }),
  new webpack.ProvidePlugin({
    Promise: 'es6-promise-promise',
  }),
  new webpack.DefinePlugin(envKeys)
];
