var babel = require('@babel/core');
var fs = require('fs');
var path = require('path');

function transformActual(type, useJson) {
  useJson = useJson || false;

  var dir = path.resolve(__dirname, 'fixtures', type);

  var options = useJson
    ? {extends: path.resolve(dir, 'config.json')}
    : require(path.resolve(dir, 'config.js'));

  var result = babel.transformFileSync(path.resolve(dir, 'actual.js'), options);

  return result.code.trim();
}

function getExpected(type) {
  return fs.readFileSync(
    path.resolve(__dirname, 'fixtures', type, 'expected.js'),
    'utf8'
  ).trim();
}

function createTest(type, useJson) {
  return function () {
    var actual = transformActual(type, useJson);
    var expected = getExpected(type);

    expect(actual).toEqual(expected);
  }
}

describe('Babel plugin: transform imports', function () {
  it('should transform imports in javascript code', createTest('simple'));
  it('should transform imports in typescript code', createTest('typescript'));
  it('should transform imports using json configuration', createTest('json', true));
  it('should transform import to default import', createTest('convertToDefault'));
  it('should not transform namespaces', createTest('notConvertNamespace'));
});
