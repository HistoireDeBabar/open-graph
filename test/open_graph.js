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
          get: (params, callback) => {
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
          get: (url, callback) => {
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

  describe('split', function() {

    it('can split a string into a key value og object', function(done) {
      var testCase = '<meta property="og:title" content="The Rock">';
      var subject = openGraph();
      subject.split(testCase, function(result){
        expect(result.title).to.eql('The Rock');
        done();
      });
    });

    it('can split a string into a key value og object with multiple objects', function(done) {
      var testCase = '<meta property="og:title" content="The Rock"> <meta property="og:url" content="http://www.imdb.com/title/tt0117500/">';
      var subject = openGraph();
      subject.split(testCase, function(result){
        expect(result.title).to.eql('The Rock');
        expect(result.url).to.eql('http://www.imdb.com/title/tt0117500/');
        done();
      });
    });
  });
  describe('process', function() {

    it('returns an empty object if http client returns an error', function(done) {
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
      openGraph(options).process('nf0f8s', function(result) {
        expect(result).to.eql({});
        done();
      });
    });

    it ('returns an object with data from og', function(done) {
      var mockResponse = {
        on: (func, callback) => {
          if (func === 'data') {
            var data = ([new Buffer('<meta property="og:title" content="The Rock">'), new Buffer('<meta property="og:url" content="http://www.imdb.com/title/tt0117500/">')]);
            for (var i = 0; i < data.length; i ++) {
              callback(data[i]);
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
      openGraph(options).process('http://www.test.com', function(result) {
        expect(result.title).to.eql('The Rock');
        expect(result.url).to.eql('http://www.imdb.com/title/tt0117500/');
        done();
      });
    });
  });
});
