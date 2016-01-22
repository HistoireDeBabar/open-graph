var expect = require('chai').expect;
var nodeHttpClient = require('../src/node_http.js');

describe('httpClient', function() {
  describe('get', function() {
    it ('returns error if no url is defined', function(done) {
      var options = {
        httpClient: {},
      };
      nodeHttpClient(options).get(undefined, function(err, result) {
        expect(err.message).to.eql('No Url Defined');
        done();
      });
    });

    it ('can handle unexpected errors from http client', function(done) {
      var httpRequest = {
        on: (func, callback) => {
          if (func === 'error') {
            callback('Error!');
            return;
          }
        },
      };
      var result = {
        on: (func) => {},
      };
      var options = {
        httpClient: {
          get: (params, callback) => {
            callback(result);
            return httpRequest;
          },
        },
      };
      nodeHttpClient(options).get('nf0f8s', function(err, result) {
        expect(err).to.eql('Error!');
        done();
      });
    });

    it ('returns error if http get throws error (can no non url inputs)', function(done) {
      var options = {
        httpClient: {
          get: (params, callback) => {
            throw new Error('Error');
          },
        },
      };
      nodeHttpClient(options).get('nf0f8s', function(err, result) {
        expect(err.message).to.eql('Error');
        done();
      });
    });

    it ('returns an array of buffer arrays from the url containing the data', function(done) {
      var mockResponse = {
        on: (func, callback) => {
          if (func === 'data') {
            for (var i = 0; i < 10; i ++) {
              callback(new Buffer('hello' + i));
            }
          }
          if (func === 'end') {
            callback();
          }
        },
      }
      var httpRequest = {
        on: (func) => {},
      };
      var options = {
        httpClient: {
          get: (url, callback) => {
            callback(mockResponse);
            return httpRequest;
          },
        },
      };
      nodeHttpClient(options).get('http://www.test.com', function(err, result) {
        expect(result.length).to.eql(10);
        expect(result[0]).to.be.an.instanceof(Buffer);
        done();
      });
    });

    it ('replaces http with https', function(done) {
      var mockResponse = {
        on: (func, callback) => {
          if (func === 'data') {
            for (var i = 0; i < 10; i ++) {
              callback(new Buffer('hello' + i));
            }
          }
          if (func === 'end') {
            callback();
          }
        },
      }
      var httpRequest = {
        on: (func) => {},
      };
      var options = {
        httpClient: {
          get: (url, callback) => {
            if (url.indexOf('https') !== -1) {
              throw new Error('Fail');
            }
            callback(mockResponse);
            return httpRequest;
          },
        },
      };
      nodeHttpClient(options).get('https://www.test.com', function(err, result) {
        expect(result.length).to.eql(10);
        expect(result[0]).to.be.an.instanceof(Buffer);
        done();
      });
    });
  });
});
