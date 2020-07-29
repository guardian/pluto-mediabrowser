var webpack = require('webpack');
var path = require('path');
var TerserPlugin = require('terser-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR = path.resolve(__dirname, 'app');

var config = {
    entry: APP_DIR + '/index.jsx',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    optimization: {
        minimizer: [new TerserPlugin()]
    },
    module : {
        rules : [
            {
                test: /\.[tj]sx?/,
                include: APP_DIR,
                loader: "ts-loader",
            },
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "source-map-loader",
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', "sass-loader"]
            }
        ]
    }
};

module.exports = config;
