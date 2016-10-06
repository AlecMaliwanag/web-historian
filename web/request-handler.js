var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var archive = require('../helpers/archive-helpers');
var httpHelpers = require('./http-helpers');

var serveStaticFiles = function(endpoint, res) {
  fs.readFile(archive.paths.siteAssets + '/' + endpoint, 'utf8', function(err, data) { // options -> encoding
    if (err) {
      console.log(err, 'error'); // TODO find the proper way to handle GET errors
    } else {
      res.end(data); // this can handle a string
    }
  });
};

var handleGETRequest = function(req, res) {
  // Serve them index.html
  if (req.url === '/') {
    serveStaticFiles('index.html', res);

  // Serve them archives
  } else {
    archive.isUrlArchived(req.url.slice(1), function(result) {
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
  // get form data from POST
  var actualData = req.on('data', function(data) {  // data is an object 
    var url = data.slice(4).toString(); // TODO maybe check if URL is archived?

    // first check if in list
    archive.isUrlInList(url, function(listFlag) {
      if (listFlag) {
      // if so, then check archive
        console.log('listflag: ' + listFlag);
        archive.isUrlArchived(url, function(archiveFlag) {
          if (archiveFlag) {
            // serve it up
            console.log(url + ' is in both the list and the archive');

            res.writeHead(302, _.extend({location: url}, httpHelpers.headers));
            res.end();
          } else {
            // serve them loading page
            console.log(url + ' is in the list but NOT yet the archive');
            res.writeHead(208, httpHelpers.headers); // 208 => already reported
            serveStaticFiles('loading.html', res);            
          }
        });
      } else {
        // if it's not in the list, then add it to the list
        console.log(url + ' is not in list, so adding to the list');
        archive.addUrlToList(url, function(url) {
          res.writeHead(208, httpHelpers.headers); // 208 => already reported
          serveStaticFiles('loading.html', res); 
        });
      }
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
