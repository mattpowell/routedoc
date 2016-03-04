var express = require('express');
var app = express();
var routes = require('../../index')({
  conf: __dirname + '/routes'
});

routes.toExpress(app, {
  'retrieve-todo-by-id': function(req, res) {
    res.send('Todo: ' + req.params.id);
  }
});

app.listen(3002, function () {
  console.log('Example app listening: http://localhost:3002/', require('util').inspect(routes.routes, {depth: null}));
});