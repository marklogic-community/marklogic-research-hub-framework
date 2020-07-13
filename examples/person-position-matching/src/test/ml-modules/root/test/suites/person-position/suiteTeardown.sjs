declareUpdate();

const test = require("/test/test-helper.xqy");
const lib = require('lib/workspace-help.sjs');

xdmp.collectionDelete(lib.TESTCOLLECTION);
