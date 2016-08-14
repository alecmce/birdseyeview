var fs = require('fs');
var express = require('express');
var inspectRepository = require('./inspect_repository');

function filterPath(path) {
  return path.indexOf('.js') != -1;
}

var app = express();
app.use(express.static('static'));

app.get('/github/:user/:repo', function(req, res) {
  var repo = req.params['user'] + '/' + req.params['repo']
  inspectRepository(repo, filterPath, (data) => res.send(data));
});

app.listen(3000, function() { console.log('Serving Codebase Visualizer on 3000'); });
