var fs = require('fs');
var path = require('path');
var http = require('http'); // TODO what if HTTPS request?
var _ = require('underscore');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, 'utf8', function(err, data) {
    callback(data.split('\n'));
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
    callback(url); // NOTE did not pass new line back to callback
    if (err) {
      console.log(err);
    }
  });
};

exports.isUrlArchived = function(url, callback) {
  fs.readFile(exports.paths.archivedSites + '/' + url, 'utf8', function(err, data) {
    callback(!!data);
  }); 
};

exports.downloadUrls = function(list) {
  _.each(list, function(url, index) {
    var options = {
      host: url
    };

    http.request(options, function(response) {
      // console.log('response: ' + response);
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

exports.downloadUrls(['www.google.com']);
