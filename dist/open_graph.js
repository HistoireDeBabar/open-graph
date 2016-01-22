'use strict';
'strict';

// Constant fields.

var ogProperty = 'og:';
var quote = '"';

/**
 * Makes an Http request to a given url and
 * returns the data in a buffer array.
 */
var _get = function _get(url, options, callback) {
  var httpClient = options.httpClient;
  httpClient.get(url, callback);
};

/**
 *  Transforms a buffer array into a
 *  string. Returns empty if no array
 *  given.
 */
var _transform = function _transform(data, callback) {
  if (!data) {
    callback('');
    return;
  }
  var reformattedData = data.map(function (obj) {
    return obj.toString();
  });
  callback(reformattedData.join(''));
  return;
};

/**
 * Recursively adds items to a javascript object
 * from an array.
 */
var objectMapper = function objectMapper(keys, route, value, count) {
  var object = route;
  var counter = count || 0;
  var current = object[keys[counter]] || {};
  if (counter === keys.length - 1) {
    object[keys[counter]] = value;
    return;
  }
  object[keys[counter]] = current;
  var next = counter + 1;
  objectMapper(keys, current, value, next);
};

/**
 * Recursivley trawls through html adding
 * og (open graph) property values to a js literal object.
 */
var _split = function _split(html, callback, result) {
  var openGraphData = result || {};
  var og = html.indexOf(ogProperty);
  if (og === -1) {
    callback(openGraphData);
    return;
  }

  // Splices up html based upon the format:
  // <meta property="og:title" content="The Rock">
  var keyStart = html.slice(og);
  var keyEnd = keyStart.indexOf(quote);
  var key = keyStart.slice(3, keyEnd);

  var keyCut = html.slice(og + keyEnd + 1);
  var valueStartIndex = keyCut.indexOf(quote);
  var valueStart = keyCut.slice(valueStartIndex + 1);
  var valueEnd = valueStart.indexOf(quote);
  var value = valueStart.slice(0, valueEnd);

  if (key.indexOf(':') !== -1) {
    var keys = key.split(':');
    objectMapper(keys, openGraphData, value);
  } else {
    openGraphData[key] = value;
  }

  // Gets the end of the string in comparison to
  // the original html.
  var end = og + keyEnd + 1 + valueStartIndex + 1 + valueEnd;
  var newHtml = html.slice(end);

  _split(newHtml, callback, openGraphData);
};

/**
 * Open Graph Interface.
 */
var OpenGraph = function OpenGraph(dependencies) {
  var options = dependencies || {};
  return {
    get: function get(url, callback) {
      _get(url, options, callback);
    },
    transform: function transform(data, callback) {
      _transform(data, callback);
    },
    split: function split(html, callback) {
      _split(html, callback);
    },
    process: function process(url, doneCallback) {
      _get(url, options, function (err, data) {
        if (err || !data) {
          doneCallback({});
          return;
        }
        _transform(data, function (html) {
          _split(html, doneCallback);
        });
      });
    }
  };
};

module.exports = OpenGraph;