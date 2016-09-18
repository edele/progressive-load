module.exports = {
    entry: './scripts/index.js',

    output: {
        filename: './build.js'
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    }
}