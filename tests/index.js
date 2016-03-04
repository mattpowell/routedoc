var Assert = require('assert');
var Util = require('util');
var Routes = require('../index');

var stubs = {
  express: {
    'get': function(path, handler) {
      handler({ route: { stack: [] } }, null, function() {});
    },
    'any': function(path, handler) {
      handler({ route: { stack: [] } }, null, function() {});
    }
  }
};

var tests = [{

  describe: 'Checks all possible values for a docblock.', 
  conf: [
    '/**',
    ' * Fetches a Todo',
    ' * @name retrieve-todo-by-id',
    ' * @param {number} id - the id of the todo',
    ' * @param {string} [trk] - Optional tracking param',
    ' * @param emptyParam',
    ' * @returns {Todo|Error}',
    ' */',
    'GET /api/todo/:id'
  ].join('\n'),
  expected: {
    method: 'GET',
    name: 'retrieve-todo-by-id',
    doc: 'Fetches a Todo',
    path: { value: '/api/todo/:id'},
    params: {
      id: {
        doc: 'the id of the todo',
        type: {
          type: 'NameExpression',
          name: 'number'
        }
      },
      trk: {
        doc: 'Optional tracking param',
        type: {
          type: 'OptionalType',
          expression: {
            type: 'NameExpression',
            name: 'string'
          }
        }
      }
    },
    returns: {
      type: {
        type: 'UnionType',
        elements: [{
          type: 'NameExpression',
          name: 'Todo'
        }, {
          type: 'NameExpression',
          name: 'Error'
        }]
      }
    }
  }

}, {

  describe: 'Minimum viable docblock',
  conf: [
    '/** mvp-doc */',
    'POST /is-mvp-doc'
  ].join('\n'),
  expected: {
    method: 'POST',
    name: 'mvp-doc',
    path: {
      value: '/is-mvp-doc'
    }
  }

}, {

  describe: 'Tests loading from a file and path params are properly registered',
  conf: __dirname + '/mock-routes.conf',
  expected: {
    method: 'HEAD',
    name: 'route',
    path: {
      value: '/route/:id'
    },
    params: {
      id: {
        type: {
          name: 'string'
        }
      }
    }
  }
}, {

  describe: 'Comments shouldn\'t be routes',
  conf: [
    '// this is commented out',
    '// POST /is-mvp-doc',
    ''
  ].join('\n'),
  expected: undefined


}, {

  describe: 'Invalid names should throw',
  conf: [
    '/* this isnt a valid name */',
    'POST /route'
  ].join('\n'),
  expected: function(self, actual) {
    return actual instanceof Error;
  }

}, {

  describe: 'Invalid routes should throw',
  conf: [
    '/** valid-name */',
    'invalid'
  ].join('\n'),
  expected: function(self, actual) {
    // TODO: this is actually a parsing error and not a "missing path" error
    return actual instanceof Error;
  }

}, {

  describe: 'Empty confs should throw',
  conf: undefined,
  expected: function(self, actual) {
    // TODO: again, this is actually a parsing error... should probs be a better error
    return actual instanceof Error;
  }

}, {

  describe: 'Dupe params should take last defined param',
  conf: [
    '/**',
    ' * @name route',
    ' * @param {string} id - the id as a string',
    ' * @param {number} random - random param that doesnt matter',
    ' * @param {number} id - the id as a number',
    ' */',
    'GET /route'
  ].join('\n'),
  expected: {
    params: {
      id: {
        type: {
          name: 'number'
        }
      }
    }
  }

}, {

  describe: 'Params defined in path should be propagated',
  conf: [
    '/** route-id */',
    'GET /route/:id'
  ].join('\n'),
  expected: {
    name: 'route-id',
    params: {
      id: {
        type: {
          name: 'string'
        }
      }
    }
  }

}, {

  describe: 'Optional prams defined in path should be correctly specified',
  conf: [
    '/** route-id */',
    'GET /route/:id?'
  ].join('\n'),
  expected: {
    name: 'route-id',
    params: {
      id: {
        type: {
          type: 'OptionalType',
          expression: {
            name: 'string'
          }
        }
      }
    }
  }

}, {

  describe: 'Strict mode should throw for missing @name tags',
  conf: {
    conf: [
      '/** route-id */',
      'GET /route/:id'
    ].join('\n'),
    mode: 'strict'
  },
  expected: function(self, actual) {
    return actual instanceof Error;
  }

}, {

  describe: 'Strict mode should skip invalid tags',
  conf: {
    conf: [
      '/**',
      ' * @name route-id',
      ' * @notvalid route-id',
      ' */',
      'GET /route'
    ].join('\n'),
    mode: 'strict'
  },
  expected: function(self, actual) {
    return Object.keys(actual.tags).length === 0;
  }

}];

// Checks that the right param has at least all the same properties of the left
// TODO: this is actually missing a TON of stuff... should just use a 3rd-party module!!!
function deepEqualsLeft(left, right, msg) {
  var result = (function dive(l, r) {

    // same objects, they're equal
    if (l === r) return true;

    // if they're dates and they're the same
    else if (l instanceof Date && r instanceof Date && l.getTime() === r.getTime()) return true;

    // if they're not objects, then there's not much else we can check for
    else if (typeof l !== 'object') return false;

    // if they're not the same object, and one is null/undefined, then they're def not equal
    if (l == null || r == null) return false;

    // sort before we loop over each property
    if (Array.isArray(l) && Array.isArray(r)) {
      l.sort();
      r.sort();
    }

    // loop through left-side props and check that right-side has the same value
    // if it's an object, dive
    for (var prop in l) {
      if (r.hasOwnProperty(prop)) {
        if (!dive(l[prop], r[prop])) {
          return false
        }
      }else {
        return false;
      }
    }
    return true;
  }(left, right));

  return result;

  if (!result) {
  }
}


tests.forEach(function(test, idx) {
  var actual;
  try{
    actual = Routes(test.conf).routes[0];
  }catch(e) {
    actual = e;
  }
  console.log('Running test %s with value:\n', test.name || (idx + 1), test.conf);
  console.log('-----------------');
  var comparator = typeof test.expected === 'function' ? test.expected : deepEqualsLeft;
  if (!comparator(test.expected, actual)) {
    throw new Error('Expected value was unequal to actual:\n' + Util.inspect(actual, {depth: null}));
  }
});

// special test for express api. ew.
(function() {

  console.log('Running toExpress tests');
  console.log('-----------------');

  var expressRoute = Routes([
    '/**',
    ' * doc for route',
    ' * @name route-id',
    ' * @param {string} id - the id as a string',
    ' * @random YUP',
    ' * @random yap',
    ' * @returns {string}',
    ' */',
    'GET /route/:other',
    '',
    '/** non-existent-handler */',
    '/non-existent-handler'
  ].join('\n'));

  var expected = {
    name: 'route-id',
    doc: 'doc for route',
    path: '/route/:other',
    method: 'GET',
    methods: {
      'get': true
    },
    params: {
      id: {
        type: {
          name: 'string'
        }
      },
      other: {
        type: {
          name: 'string'
        }
      }
    },
    returns: {
      type: {
        name: 'string'
      }
    },
    tags: {
      random: ['YUP', 'yap']
    }
  };

  expressRoute.toExpress(stubs.express, {
    'route-id': function(req, res, next) {
      if (deepEqualsLeft(expected, req.route)) {
        console.log('Expected value was equal to actual value for toExpress')
      }else {
        throw new Error('Expected value was unequal to actual:\n' + Util.inspect(req.route, {depth: null}));
      }
    },
    'non-existent-handler': null
  });
}());


console.log('Tests passed!');