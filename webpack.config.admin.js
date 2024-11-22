const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

module.exports.entry = {
    main: './client/react/Admin/index.js',
};

module.exports.output = {
    path: path.resolve(__dirname, "static"),
    filename: 'js/app.admin.js',
    publicPath: process.env.DOMAIN
};

module.exports.resolve = {
    extensions: ['.js', '.jsx'],
};

module.exports.module = {
    rules: [
        {
            loader: 'file-loader?name=[name].[ext]&outputPath=/static/fonts',
            test: /\.(svg|woff|woff2|eot|ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        },
        {
            test: /\.(sass|scss|css)$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'sass-loader'],
            }),
        },
        {
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: { presets: ['@babel/react', '@babel/env'] },
            test: /\.(js|jsx$$)/,
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
    new ExtractTextPlugin({ filename: 'css/app.admin.css' }),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        Popper: ['popper.js', 'default'],
        Util: 'exports-loader?Util!bootstrap/js/dist/util',
    }),
    new webpack.DefinePlugin(envKeys)
];
