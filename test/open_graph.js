var expect = require('chai').expect;
var openGraph = require('../src/open_graph.js');
var nodeHttpClient = require('../src/node_http_client.js');

describe('OpenGraph', function() {

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
      var testCase = '<meta property="og:title" content="The Rock"> <meta property="og:url" content="http://www.imdb.com/title/tt0117500/">, <meta property="og:image:width" content="300px"> <meta property="og:image:height" content="300" />';
      var subject = openGraph();
      subject.split(testCase, function(result){
        expect(result.title).to.eql('The Rock');
        expect(result.url).to.eql('http://www.imdb.com/title/tt0117500/');
        expect(result.image.width).to.eql('300px');
        expect(result.image.height).to.eql('300');
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
      var httpClient = nodeHttpClient(options);
      var dependencies = {
        httpClient: httpClient,
      };
      openGraph(dependencies).process('http://www.test.com', function(result) {
        expect(result.title).to.eql('The Rock');
        expect(result.url).to.eql('http://www.imdb.com/title/tt0117500/');
        done();
      });
    });
  });

  describe('filter', function() {

    it('returns a contatenated string of only meta data properties', function(done) {
      var metaString = '<meta property="og:title" content="The Rock"> <meta property="og:url" content="http://www.imdb.com/title/tt0117500/">, <meta property="og:image:width" content="300px"> <meta property="og:image:height" content="300" />';
      var expectedString = 'property="og:title" content="The Rock"property="og:url" content="http://www.imdb.com/title/tt0117500/"property="og:image:width" content="300px"property="og:image:height" content="300" /';
      var subject = openGraph();
      subject.filter('<html>' + metaString + '</html>', function(result) {
       expect(result).to.eql(expectedString);
       done();
      });
    });

    it('returns an empty string is no meta data is in the html', function(done) {
      var subject = openGraph();
      subject.filter('<html></html>', function(result) {
        expect(result).to.eql('');
        done();
      });
    });
  });
});
