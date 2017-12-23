module.exports = {
  plugins: [
    [require('../../../index.js'), {
      'some-library': {
        transform: function transform(token, library) {
          switch (token) {
            case 'elementA':
            case 'elementB':
              return {
                default: false,
                module: library + '/dist/commonjs/foo'
              };
            default:
              return library;
          }
        }
      }
    }],
    require('@babel/plugin-transform-typescript')
  ]
};