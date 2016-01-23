const openGraph = require('./src/open_graph.js');
const nodeClient = require('./src/node_http_client.js');

const options = {
  httpClient: nodeClient(),
};

module.exports = openGraph(options).process;
