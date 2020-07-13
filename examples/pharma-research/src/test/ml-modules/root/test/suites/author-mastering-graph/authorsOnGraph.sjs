const test = require('/test/test-helper.xqy');
const graph = require('/lib/graph-sparql.sjs');

const uris = ['/PubMed/PMID-6306753.xml']

const assertions = graph.expandToGraph(uris)
  .map(r => r.end)
  .map(uri => test.assertTrue(xdmp.documentGetCollections(uri).indexOf('mdm-archived') < 0))

assertions
