module.exports = {
  plugins: [
    [require('../../../index.js'), {
      'some-library': {
        transform: function transform(token, library) {
          switch (token) {
            case 'elementA':
              return {
                default: true,
                module: library + '/dist/commonjs/foo'
              };
            default:
              return library;
          }
        }
      }
    }]
  ]
};