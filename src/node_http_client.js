// Constant Fields
const http = require('http');
const httpProtocol = 'http://';
const httpsProtocol = 'https://';
const httpMethod = 'GET';
const allAccess = '*';

// Error messages.
const noUrl = 'No Url Defined';

/**
 * Given a url build the request paramaters.
 */
const buildRequestParams = (url) => {
  const request = {
    method: httpMethod,
    withCredentials: false,
    headers: {
      'Access-Control-Allow-Origin': allAccess,
    },
  };

  const safeUrl = url.replace(httpProtocol, '').replace(httpsProtocol, '');

  const pathArray = safeUrl.split('/');
  request.host = pathArray[0];

  if (pathArray.length > 1 && pathArray[1] !== '') {
    request.path = '/' + pathArray[1] + '/';
  }
  return request;
};

/**
 * A wrapper for a node implementation
 * of an http get method where given a
 * url, returns an error and buffer array.
 */
const get = (url, options, callback) => {
  const httpClient = options.httpClient || http;

  if (!url) {
    callback(new Error(noUrl));
    return;
  }

  const request = buildRequestParams(url);
  const results = [];
  try {
    httpClient.get(request, (res) => {
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

/**
 * A Node HTTP Client wrapper.
 */
const nodeHttpClient = (dependencies) => {
  const options = dependencies || {};
  return {
    get: (url, callback) => {
      get(url, options, callback);
    },
  };
};

module.exports = nodeHttpClient;
