var webpack = require('webpack');
var path = require('path');
var TerserPlugin = require('terser-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR = path.resolve(__dirname, 'app');
var CM_THEME = path.resolve(__dirname, 'node_modules/codemirror/theme');
var CM_LIB = path.resolve(__dirname, 'node_modules/codemirror/lib');

var config = {
    entry: APP_DIR + '/index.tsx',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    resolve: {
        extensions: [".js",".jsx",".ts",".tsx",".svg",".css"],
        fallback: {
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util/"),
            crypto: require.resolve("crypto-browserify"),
            buffer: require.resolve("buffer/")
        },
    },
    optimization: {
        minimizer: [new TerserPlugin()]
    },
    module : {
        rules : [
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "source-map-loader",
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
                type: "javascript/auto", //see https://github.com/webpack/webpack/issues/11467
            },
            {
                test: /\.[tj]sx?/,
                include: APP_DIR,
                loader: "ts-loader",
            },
            {
                test: /\.css$/i,
                include: APP_DIR,
                use: ['style-loader', 'css-loader', "sass-loader"]
            },
            {
                test: /\.css$/i,
                include: [CM_THEME, CM_LIB],
                use: ['style-loader', 'css-loader', "sass-loader"]
            },
            {
                test: /\.svg$/,
                use: ["@svgr/webpack", "url-loader"],
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser",
        }),
    ],
};

module.exports = config;
