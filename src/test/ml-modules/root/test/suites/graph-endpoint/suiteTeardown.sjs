declareUpdate();

const test = require("/test/test-helper.xqy");
const lib = require('lib/graph-help.sjs');

xdmp.collectionDelete(lib.TESTCOLLECTION);
