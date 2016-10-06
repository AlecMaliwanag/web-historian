var archive = require('../helpers/archive-helpers');

archive.readListOfUrls(function(urls) {
  urls.forEach(function(singleUrl) {
    archive.isUrlArchived(singleUrl, function(flag) {
      if (!flag) {
        archive.downloadUrls([singleUrl]); 
      }
    });
  });
});
