var nodeCache = require('node-cache');
var github = require('octonode');
var config = require('./config');

var cache = new nodeCache({stdTTL: 60 * 60});

function inspectRepository(name, filterPath, callback) {
  var data = cache.get(name);
  if (!data) {
    console.log('requesting ' + name);
    requestRepository(name, filterPath, (data) => {
      cache.set(name, data);
      callback(data);
    });
  } else {
    console.log('using cache ' + name);
    callback(data);
  }
}

function requestRepository(name, filterPath, callback) {
  var client = github.client(config);
  var repo = client.repo(name);

  function getCommitShas(list) {
    return list ? list.map((data) => data.commit.tree.sha) : [];
  }

  function parseTree(sha) {
    var queue = [() => requestTree(sha, [])];
    var output = [];

    function requestTree(sha, path) {
      repo.tree(sha, (error, status, body, headers) => {
        status.tree.forEach((leaf) => processLeaf(path, leaf));
        doNextAction();
      });
    }

    function processLeaf(path, leaf) {
      var leafPath = path.concat(leaf.path);
      if (leaf.type == 'tree') {
        queue.push(() => requestTree(leaf.sha, leafPath));
      } else if (filterPath(leaf.path)) {
        queue.push(() => requestBlob(leaf.sha, leafPath));
      }
    }

    function requestBlob(sha, path) {
      repo.blob(sha, (error, status, body, headers) => {
        var buffer = new Buffer(status.content, 'base64');
        var lines = buffer.toString().split('\n');
        var lengths = lines.map((line) => line.length);
        output.push({path: path.join('/'), data: lengths});
        doNextAction();
      });
    }

    function processBlob(blob) {
      var buffer = new Buffer(blob, 'base64');
      var lines = buffer.toString().split('\n');
      return lines.map((line) => line.length);
    }

    function doNextAction() {
      if (queue.length) {
        var action = queue.shift();
        action();
      } else {
        callback({data: output, error: null});
      }
    }

    doNextAction();
  }

  repo.commits((error, status, body, headers) => {
    var list = getCommitShas(status);
    console.log(error);
    if (!error && list.length) {
      parseTree(list[0]);
    } else {
      callback({data: null, error: error});
    }
  });
}

module.exports = inspectRepository;
