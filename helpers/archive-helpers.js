var fs = require('fs');
var path = require('path');
var http = require('http'); // TODO what if HTTPS request?
var _ = require('underscore');

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, 'utf8', function(err, data) {
    var temp = data.trim().split('\n'); // !!! need to trim
    callback(temp);
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(data) {
    var flag = false; // TODO why doesn't data.includes work here?
    for (var i = 0; i < data.length; i++) {
      if (data[i] === url) { // TODO revisit, stringify?
        flag = true;
      }
    }

    callback(flag);
  });
};

exports.addUrlToList = function(url, callback) {
  fs.appendFile(exports.paths.list, url + '\n', 'utf8', function(err) {
    callback(url);
    if (err) {
      console.log(err);
    }
  });
};

exports.isUrlArchived = function(url, callback) {
  var path = exports.paths.archivedSites;
  fs.readdir(path, function(err, files) {  // Learning: need to use readdir instead of readFile
    var flag = false;
    for (var i = 0; i < files.length; i++) {
      if (files[i] === url) {
        flag = true;
      }
    }
    console.log(url);
    callback(flag);
  }); 
};

exports.downloadUrls = function(list) {
  _.each(list, function(url, index) {
    var options = {
      host: url
    };

    http.request(options, function(response) { // !!!!! this is wrong
      var str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        fs.writeFile(exports.paths.archivedSites + '/' + url, str, 'utf8', function(err) {
          if (err) {
            console.log(err);
          }
        });
      });
    }).end();
  });
};