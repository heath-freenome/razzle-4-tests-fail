const { transform } = require('@babel/core');
const jestPreset = require('babel-preset-jest');

/** A custom jest transformer designed to support testing files that have hot module replacement in them. To support
 * testing of hot module replacement in jest, this transformer first replaces all instances of `module.hot` with
 * `global.module.hot` then runs the resulting file through babel using the `babel-preset-jest`.
 *
 * Because of this replacement, tests for any file specified to use this transformer need to define the `global.module`
 * as an empty object before doing `require()` to load the file to verify the "no hot module replacement" mode. To test
 * the "hot module replacement" mode, tests need to define the `global.module` as `{ hot: { accept: jest.fn() } }`
 * before the `require()` load of the file.
 *
 * This transformer will be explicitly defined in the jest config, `transform` explicitly for those files that need it.
 *
 * Adapted from this [stack overflow question](https://stackoverflow.com/questions/45037032/test-module-hot-with-jest)
 * and the jest [custom transformers](https://jestjs.io/docs/en/tutorial-react#custom-transformers) documentation.
 *
 * Finally, because we are adding this preprocessor for just a few files, the jest `transform` configuration needs to
 * explicitly define the default `babel-jest` transformer for all other files per the jest configuration file
 * [documentation](https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object).
 *
 * @type {{process(src: string, filename: string): string}} - The custom transformer with the `process()` method that
 *      returns the transformed source.
 */
module.exports = {
  process(src, filename) {
    const result = transform(src.replace(/module.hot/g, 'global.module.hot'), {
      filename,
      presets: [jestPreset],
    });

    return result || src;
  },
};
