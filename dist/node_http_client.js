'use strict';

var http = require('http');
var httpProtocol = 'http://';
var httpsProtocol = 'https://';
var httpMethod = 'GET';
var allAccess = '*';

// Error messages.
var noUrl = 'No Url Defined';

/**
 * Given a url build the request paramaters.
 */
var buildRequestParams = function buildRequestParams(url) {
  var request = {
    method: httpMethod,
    withCredentials: false,
    headers: {
      'Access-Control-Allow-Origin': allAccess
    }
  };

  var safeUrl = url.replace(httpProtocol, '').replace(httpsProtocol, '');

  var pathArray = safeUrl.split('/');
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
var _get = function _get(url, options, callback) {
  var httpClient = options.httpClient || http;

  if (!url) {
    callback(new Error(noUrl));
    return;
  }

  var request = buildRequestParams(url);
  var results = [];
  try {
    httpClient.get(request, function (res) {
      res.on('data', function (chunk) {
        results.push(chunk);
      });
      res.on('end', function () {
        callback(undefined, results);
      });
    }).on('error', function (e) {
      callback(e);
    });
  } catch (e) {
    callback(e);
  }
};

/**
 * A Node HTTP Client wrapper.
 */
var nodeHttpClient = function nodeHttpClient(dependencies) {
  var options = dependencies || {};
  return {
    get: function get(url, callback) {
      _get(url, options, callback);
    }
  };
};

module.exports = nodeHttpClient;