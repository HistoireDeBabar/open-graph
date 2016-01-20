var expect = require('chai').expect;
var openGraph = require('../src/open_graph.js');

describe('OpenGraph', function() {
  describe('get', function() {
    it ('returns error if no url is defined', function(done) {
      var options = {
        httpClient: {},
      };
      openGraph(options).get(undefined, function(err, result) {
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
          request: (params, callback) => {
            callback(result);
            return httpRequest;
          },
        },
      };
      openGraph(options).get('nf0f8s', function(err, result) {
        expect(err).to.eql('Error!');
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
          request: (url, callback) => {
            callback(mockResponse);
            return httpRequest;
          },
        },
      };
      openGraph(options).get('http://www.test.com', function(err, result) {
        expect(result.length).to.eql(10);
        expect(result[0]).to.be.an.instanceof(Buffer);
        done();
      });
    });
  });

  describe('transform', function() {
    it('takes an array of buffers and concatenated them into a string', function(done) {
      var data = [new Buffer('a'), new Buffer('b'), new Buffer('c'), new Buffer('d'), new Buffer('e'), new Buffer('f'), new Buffer('g')];
      openGraph().transform(data, function(result) {
        expect(result).to.eql('abcdefg');
        done();
      });
    });
  });
});
