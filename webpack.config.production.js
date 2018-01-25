let WebpackStripLoader = require("strip-loader");
let config = require("./webpack.config");
let stripLoader = {
    test: /\.js$/,
    loader: WebpackStripLoader.loader("console.log")
}

config.module.loaders.push(stripLoader);

module.exports = config;