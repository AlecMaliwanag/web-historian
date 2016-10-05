var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var httpHelpers = require('./http-helpers');

// require more modules/folders here!
var handleGETRequest = function(req, res) {
  console.log('get request handled');
  fs.readFile(archive.paths.siteAssets + '/index.html', 'utf8', function(err, data) { // options -> encoding
    if (err) {
      console.log(err, 'error'); // TODO find the proper way to handle GET errors
    } else {
      // httpHelpers.serveAssets(res, data.toString(), ) // TODO come back to this
      // console.log(data, 'data');
      res.end(data); // this can handle a string
    }
  });

};

exports.handleRequest = function (req, res) {
  // router

  // if get request, serve index
  if (req.method === 'GET') {
    handleGETRequest(req, res);
  } else if (req.method === 'POST') {
    handlePOSTRequest(req, res);
  } else {
    //handle
    return;
  }
  // if post request, do something

  //res.end(archive.paths.list);
};
