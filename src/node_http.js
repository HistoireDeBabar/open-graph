const http = require('http');

const httpsProtocol = 'https';
const httpProtocol = 'http';

// Error messages.
const noUrl = 'No Url Defined';

const get = (url, options, callback) => {
  const httpClient = options.httpClient || http;
  if (!url) {
    callback(new Error(noUrl));
    return;
  }
  const safeUrl = url.replace(httpsProtocol, httpProtocol);
  const results = [];

  try {
    httpClient.get(safeUrl, (res) => {
      res.on('data', (chunk) => {
        results.push(chunk);
      });
      res.on('end', () => {
        callback(undefined, results);
      });
    }).on('error', (e) => {
      callback(e);
    });
  } catch (e) {
    callback(e);
  }
};

const nodeHttpClient = (dependencies) => {
  const options = dependencies || {};
  return {
    get: (url, callback) => {
      get(url, options, callback);
    },
  };
};

module.exports = nodeHttpClient;
