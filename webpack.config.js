let path = require("path");
let webpack = require("webpack");
//const glob = require("glob");

let commonsPlugin = new webpack.optimize.CommonsChunkPlugin("shared");

module.exports = {
    context: path.resolve("client/src/"),
    entry: {
        index: "./js/index.js",
        login: "./js/login.js",
        master: "./js/master.js",
        player: "./js/player.js",
        profile: "./js/profile.js",
        profile: "./js/register.js",
        //shared: glob.sync("./style/*.scss", {cwd: path.resolve("client/src/")})
        indexstyle: "./style/index.scss",
        masterstyle: "./style/master.scss"
    },
    output: {
        path: path.resolve("client/public/bundles"),
        filename: "[name].bundle.js"
    },

    plugins: [commonsPlugin],

    module:{
        loaders:[
            {
                test: /\.js$/,
                loader: "babel-loader"
            },
            {
                test: /\.scss$/,
                loader: "style-loader!css-loader!autoprefixer-loader!sass-loader"
            }
        ]
    }
};