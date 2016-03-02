var pathToRegexp = require('path-to-regexp');
var validTags = require('./valid-jsdoc-tags');
var Doctrine = require('doctrine');

var Utils = module.exports = {

  normalizePath: function (path, params, opts) {

    //if (!path) return null;

    var pathKeys = [];
    var pathRe = pathToRegexp(path, pathKeys);

    // keep regex looking clean
    delete pathRe.keys;

    // decorate found params as actual types
    pathKeys.forEach(function(key) {
      var name = key.name;

      // only add if it hasn't already been defined
      // TODO: what if regex is optional but doc isn't?
      if (!params[name]) {
        params[name] = {
          type: {
            type: 'NameExpression',
            name: 'string'
          }
        };
        if (key.optional) {
          params[name] = {
            type: {
              type: 'OptionalType',
              expression: params[name].type
            }
          };
        }
        params[name].doc = null;
      }
    });

    return {
      value: path,
      regex: pathRe
    };
  },

  normalizePegResults: function (block, opts) {
    var doc = Doctrine.parse(block.doc, {sloppy: true, unwrap:true}),
        route = block.route,
        path = route.path,
        tags = {},
        name, returns = null, params = {};

    if (doc.tags && doc.tags.length) {
      doc.tags.forEach(function(tag) {
        var title = tag.title;

        if (title === 'name' || title === 'alias') {
          name = tag.name
        }else if (title === 'return' || title === 'returns') {
          returns = {
            type: tag.type,
            doc: tag.description || null
          };
        }else if (title === 'param') {
          params[tag.name] = {
            doc: tag.description || null,
            type: tag.type
          };
        }else {

          // if strict mode and specified tag isn't valid/whitelisted, skip
          if (opts.isStrict && validTags.indexOf(title) === -1) return;

          if (tags.hasOwnProperty(title)) {
            tags[title] = [tag.description].concat(tags[title]);
          }else {
            tags[title] = tag.description
          }
        }

      });
    }else if (!opts.isStrict) {
      // docblock was empty so assuming it's the name
      name = doc.description;
    }

    // TODO: maybe don't throw and just skip (and emit a warning)
    if (!name) {
      throw new Error('Unable to parse name from docblock:\n' + block.doc);
    //}else if(!path) {
    //  throw new Error('Unable to determine path from docblock');
    }

    return {
      method: route.method || null,
      name: name,
      doc: (name !== doc.description ? doc.description : '') || null,
      path: Utils.normalizePath(path, params, opts),
      params: params,
      returns: returns,
      tags: tags
    };
  }

};