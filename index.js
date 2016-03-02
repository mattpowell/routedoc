var Fs = require('fs');
var Peg = require('pegjs');
var Util = require('./util');
var grammar = Fs.readFileSync(__dirname + '/parser.peg').toString();
var parser = Peg.buildParser(grammar);

var api = module.exports = function(o) {
  var parserOpts = { isStrict: false };
  var confContents, routes, confPath;

  o = o || {};

  if (typeof o === 'string') {
    o = {
      conf: o
    };
  }

  // set strict parsing mode based on passed in opts
  parserOpts.isStrict = o.mode === 'strict';

  // default to a local file called routes if conf is undefined
  confPath = o.conf || './routes';

  // if Fs says it's a real path, read contents from disk
  if (Fs.existsSync(confPath)) {
    confContents = Fs.readFileSync(confPath).toString();

  // else, assume contents have been passed in
  }else {
    confContents = confPath;
    confPath = null;
  }

  // parse!
  routes = parser
    .parse(confContents) // TODO: we should better handle parse errors.
    .filter(function removeCommentedOutRoutes(block) {
      // commented out routes are returned as null
      return block !== null;
    }).map(function(block) {
      return Util.normalizePegResults(block, parserOpts)
    });

  return {
    routes: routes,
    conf: o.conf,
    toExpress: function(server, handlers) {
      routes.forEach(function(route) {
        var method = (route.method || 'any').toLowerCase();
        server[method](route.path.value, function runHandler(req, res, next) {
          var handler = handlers[route.name] || function(req, res, next) { next() };
          var methods = {};
          methods[method] = true;
          req.route = {
            name: route.name,
            doc: route.doc,
            path: route.path.value, // TODO: missing out on regex here... tack on somewhere else?
            method: route.method,
            methods: methods,
            params: route.params,
            returns: route.returns,
            tags: route.tags,
            stacks: req.route.stack
          }
          return handler.call(this, req, res, next);
        });
      });
    }
  };
};
