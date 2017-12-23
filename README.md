# babel-plugin-reimport
[![Latest Stable Version](https://img.shields.io/npm/v/babel-plugin-reimport.svg)](https://www.npmjs.com/package/babel-plugin-reimport)
[![License](https://img.shields.io/npm/l/babel-plugin-reimport.svg)](./LICENSE)
[![Build Status](https://img.shields.io/travis/Lodin/babel-plugin-reimport/master.svg)](https://travis-ci.org/Lodin/babel-plugin-reimport)
[![Test Coverage](https://img.shields.io/codecov/c/github/Lodin/babel-plugin-reimport/master.svg)](https://codecov.io/gh/Lodin/babel-plugin-reimport)

Working with huge libraries prepared for two environments - `es` and `commonjs` is hard. You are not
able to import only component you want - you have to import whole library. And time to time even
tree-shaking cannot handle it. 

This [Babel](https://github.com/babel/babel) plugin does all work for you. You just have to define
rules it follows.

## Installation
```bash
$ npm install --save-dev babel-plugin-reimport
``` 

## Usage
Imagine you have a library that should be compiled to `es` and `commonjs`. You want to split an import declaration 
from a huge library, e.g. `react-virtualized`, to separate parts. 

You have following import in your code:
```javascript
import {AutoSizer, Table} from 'react-virtualized';
```

Basing on your build type, you want to get in your code:

**CommonJS**
```javascript
const AutoSizer = require('react-virtualized/dist/commonjs/AutoSizer').default;
const Table = require('react-virtualized/dist/commonjs/Table').default;
```

**ES**
```javascript
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import Table from 'react-virtualized/dist/es/Table';
```

To get it you have to define following function:
```javascript
const isCommonjs = process.env.BUILD_TYPE === 'commonjs';

function transform (token, library) {
  switch (token) {
    case 'AutoSizer':
    case 'Table':
      return {
        default: true,
        module: `${library}/dist/${isCommonjs ? 'commonjs' : 'es'}/${token}`,
      };
    default:
      return library; // in case you still have something to import from 'react-virtualized' itself
  }
}
```

## Transform function

Arguments: 
* `token: string`  
Import specifier name, `AutoSizer` or `Table` for our example.

* `library: string`  
Library name. 

Returns one of:

* Object with following params:
    * `default: boolean` - indicates that you want to make your current token imported by default 
    (i.e. `import x from 'y'` instead of `import {x} from 'y'`).
    * `module: string` - path to module you want to import from. You can build it basing on current 
    environment, so paths for `es` and `commonjs` will differ.
    
* String. It is only module name, and all imports will be not default (`import {x} from 'y'`). 

## Babel configuration
Using new Babel configuration based on JS:
```javascript
module.exports = {
  plugins: [
    [require('babel-plugin-reimport'), {
      'react-virtualized': {
        transform(token, library) {
          // your transformation code
        },
      },
    }],
  ],
};
```
Using old Babel JSON configuration (path starts from `cwd`):
```json
{
  "plugins": [
    ["reimport", {
      "react-virtualized": {
        "transform": "./path/to/your/transform.js"
      }
    }]
  ] 
}
```

## Known limitations
* Plugin won't work with default import. It may change in future versions.