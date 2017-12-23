module.exports = function transform(token, library) {
  switch (token) {
    case 'elementA':
      return {
        default: false,
        module: library + '/dist/commonjs/foo'
      };
    default:
      return library;
  }
};