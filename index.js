"use strict";

var resolve = require('path').resolve;
var t = require("@babel/types");

var cwd = process.cwd();

module.exports = function () {
  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration (path, state) {
        if (path.node.skip) {
          return;
        }

        if (!state.opts) {
          throw new Error('You have to specify plugin options with library list and '
            + 'associated transform functions');
        }

        var specifiers = path.node.specifiers;
        var library = path.node.source.value;

        if (!(library in state.opts) || (
            specifiers.length === 1 && t.isImportNamespaceSpecifier(specifiers[0])
          )) {
          return;
        }

        var map = {};
        var transform = state.opts[library].transform;

        if (typeof transform === 'string') {
          transform = require(resolve(cwd, transform));
        }

        for (var i = 0; i < specifiers.length; i++) {
          var specifier = specifiers[i];
          var result = transform(specifier.imported.name, library);

          var newSource;
          var newSpecifier;
          if (typeof result === 'string') {
            newSource = result;
            newSpecifier = specifier;
          } else {
            var def = result.default;
            newSource = result.module;

            if (def) {
              newSpecifier = t.importDefaultSpecifier(specifier.local);
            } else {
              newSpecifier = t.importSpecifier(specifier.local, specifier.imported);
            }
          }

          if (newSource in map) {
            map[newSource].push(newSpecifier);
          } else {
            map[newSource] = [newSpecifier];
          }
        }

        var transforms = [];
        for (var source in map) {
          const importDeclaration = t.importDeclaration(map[source], t.stringLiteral(source));

          if (library === source) {
            importDeclaration.skip = true;
          }

          transforms.push(importDeclaration);
        }

        if (transforms.length > 0) {
          path.replaceWithMultiple(transforms);
        }
      }
    }
  }
};
