const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    config.ignoreWarnings = [{
        module: /@eva-design\/processor|@ui-kitten\/components|@eva-design\/eva/,
    }];

    return config;
};