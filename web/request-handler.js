var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var httpHelpers = require('./http-helpers');

var handleGETRequest = function(req, res) {
  // Serve them index.html
  if (req.url === '/') {
    fs.readFile(archive.paths.siteAssets + '/index.html', 'utf8', function(err, data) { // options -> encoding
      if (err) {
        console.log(err, 'error'); // TODO find the proper way to handle GET errors
      } else {
        res.end(data); // this can handle a string
      }
    });

  // Serve them archives
  } else {
    archive.isUrlArchived(req.url, function(result) {
      if (result) {
        fs.readFile(archive.paths.archivedSites + '/' + req.url, 'utf8', function(err, data) {
          if (err) {
            console.log('error reading file', err);
          } else {
            res.end(data);
          }
        });
      } else {
        res.writeHead(404, httpHelpers.headers);
        res.end();
      }
    });
  } 
};

var handlePOSTRequest = function(req, res) {
  var actualData = req.on('data', function(data) { // get FORM data from POST
    var url = data.slice(4); // TODO maybe check if URL is archived?
    archive.addUrlToList(url, function(url) {
      res.writeHead(302, httpHelpers.headers);
      res.end();
    });
  });
};

exports.handleRequest = function (req, res) {
  if (req.method === 'GET') {
    handleGETRequest(req, res);
  } else if (req.method === 'POST') {
    handlePOSTRequest(req, res);
  } else { // TODO handle other cases
    res.end(archive.paths.list);
  }
};
