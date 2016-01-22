const openGraph = require('./dist/open_graph.js');
const nodeClient = require('./dist/node_http_client.js');

const options = {
  httpClient: nodeClient(),
};

module.exports = openGraph(options).process;
