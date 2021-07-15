module.exports = {
  options: {
    verbose: true,
    debug: {
      compile: true,
    },
  },
  modifyWebpackConfig({ env: { dev }, webpackConfig, paths }) {
    // first copy the inbound options to change the source map tool
    const newWebpackConfig = {
      ...webpackConfig,
      devtool: dev ? 'inline-source-map' : 'source-map', // Slowest but the best source map with inlined source code
    };
    // Add .svg and .ico loaders
    newWebpackConfig.module.rules.push(
      {
        test: /\.svg$/,
        use: [{ loader: require.resolve('svg-url-loader') }],
      },
      {
        test: /favicon\.ico$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: 1,
              mimetype: 'image/x-icon',
              name: '[name].[ext]',
            },
          },
        ],
      }
    );
    // Update the resolver to look in our /src directory first and add a few extensions as well
    newWebpackConfig.resolve = {
      ...newWebpackConfig.resolve,
      modules: [`${paths.appPath}/src`, ...newWebpackConfig.resolve.modules],
      extensions: [...webpackConfig.resolve.extensions, '.svg'],
    };
    // Uncomment this to debug the new webpack config
    // console.dir(newWebpackConfig, { depth: null });
    return newWebpackConfig;
  },
  modifyJestConfig({ jestConfig }) {
    const customJestConfig = {
      automock: false,
      setupFiles: ['<rootDir>/src/__tests__/__setup__/initJest.js'],
      setupFilesAfterEnv: ['<rootDir>/node_modules/jest-enzyme/lib/index.js'],
      modulePathIgnorePatterns: ['<rootDir>[/\\\\](build|docs|node_modules|scripts)[/\\\\]'],
      testEnvironment: 'jest-environment-jsdom-global',
      transform: {
        'src/client.jsx': '<rootDir>/src/__tests__/__setup__/hotModulesPreprocessor.js',
        'src/index.jsx': '<rootDir>/src/__tests__/__setup__/hotModulesPreprocessor.js',
        '\\.[jt]sx?$': 'babel-jest',
      },
      coverageDirectory: '<rootDir>/coverage/',
      collectCoverage: true,
      coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/src/__tests__'],
    };
    const newJestConfig = { ...jestConfig, ...customJestConfig };
    // Uncomment this to debug the new jest config
    // console.dir(newJestConfig, { depth: null });
    return newJestConfig;
  },
};
