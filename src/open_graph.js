'strict';

const http = require('http');

// Constant fields.
const ogProperty = 'og:';
const quote = '"';
const httpsProtocol = 'https';
const httpProtocol = 'http';

// Error messages.
const noUrl = 'No Url Defined';

/**
 * Makes an Http request to a given url and
 * returns the data in a buffer array.
 */
const get = (url, options, callback) => {
  const httpClient = options.httpClient || http;
  if (!url) {
    callback(new Error(noUrl));
    return;
  }
  const safeUrl = url.replace(httpsProtocol, httpProtocol);
  const results = [];
  const request = httpClient.get(safeUrl, (res) => {
    res.on('data', (chunk) => {
      results.push(chunk);
    });
    res.on('end', () => {
      callback(undefined, results);
    });
  });
  request.on('error', (e) => {
    callback(e);
  });
};


/**
 *  Transforms a buffer array into a
 *  string. Returns empty if no array
 *  given.
 */
const transform = (data, callback) => {
  if (!data) {
    callback('');
    return;
  }
  const reformattedData = data.map((obj) => {
    return obj.toString();
  });
  callback(reformattedData.join(''));
  return;
};


/**
 * Recursively adds items to a javascript object
 * from an array.
 */
const objectMapper = (keys, route, value, count) => {
  const object = route;
  const counter = count || 0;
  const current = object[keys[counter]] || {};
  if (counter === (keys.length - 1)) {
    object[keys[counter]] = value;
    return;
  }
  object[keys[counter]] = current;
  const next = counter + 1;
  objectMapper(keys, current, value, next);
};

/**
 * Recursivley trawls through html adding
 * og (open graph) property values to a js literal object.
 */
const split = (html, callback, result) => {
  const openGraphData = result || {};
  const og = html.indexOf(ogProperty);
  if (og === -1) {
    callback(openGraphData);
    return;
  }

  // Splices up html based upon the format:
  // <meta property="og:title" content="The Rock">
  const keyStart = html.slice(og);
  const keyEnd = keyStart.indexOf(quote);
  const key = keyStart.slice(3, keyEnd);

  const keyCut = html.slice(og + keyEnd + 1);
  const valueStartIndex = keyCut.indexOf(quote);
  const valueStart = keyCut.slice(valueStartIndex + 1);
  const valueEnd = valueStart.indexOf(quote);
  const value = valueStart.slice(0, valueEnd);

  if (key.indexOf(':') !== -1) {
    const keys = key.split(':');
    objectMapper(keys, openGraphData, value);
  } else {
    openGraphData[key] = value;
  }

  // Gets the end of the string in comparison to
  // the original html.
  const end = og + keyEnd + 1 + valueStartIndex + 1 + valueEnd;
  const newHtml = html.slice(end);

  split(newHtml, callback, openGraphData);
};


/**
 * Open Graph Interface.
 */
const OpenGraph = (dependencies) => {
  const options = dependencies || {};
  return {
    get: (url, callback) => {
      get(url, options, callback);
    },
    transform: (data, callback) => {
      transform(data, callback);
    },
    split: (html, callback) => {
      split(html, callback);
    },
    process: (url, doneCallback) => {
      get(url, options, (err, data) => {
        if (err || !data) {
          doneCallback({});
          return;
        }
        transform(data, (html) => {
          split(html, doneCallback);
        });
      });
    },
  };
};

module.exports = OpenGraph;
