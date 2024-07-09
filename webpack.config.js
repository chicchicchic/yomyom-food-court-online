const path = require("path")

module.exports = {
    webpack:{
        configure:(webpackConfig) => {
            webpackConfig.module.rules.push({
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
                include: path.resolve(__dirname, 'src'),
            });
            return webpackConfig;
        },
    },
};