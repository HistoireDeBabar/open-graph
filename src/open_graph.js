const http = require('http');

const get = (url, options, callback) => {
  const httpClient = options.httpClient || http;
  if (!url) {
    callback(new Error('No Url Defined'));
    return;
  }
  const results = [];
  const params = {
    url: url,
  };
  var request = httpClient.request(params, (res) => {
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

const transform = (data, callback) => {
  var reformattedData = data.map(function(obj){
    return obj.toString();
  });
  callback(reformattedData.join(''));
  return;
};

const OpenGraph = (options) => {
  options = options || {};
  return {
    get: (url, callback) => {
      get(url, options, callback);
    },
    transform: (data, callback) => {
      transform(data, callback);
    },
  }
};

module.exports = OpenGraph;
