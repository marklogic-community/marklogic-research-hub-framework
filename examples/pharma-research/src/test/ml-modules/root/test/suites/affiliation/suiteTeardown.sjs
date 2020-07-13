declareUpdate();

const test = require("/test/test-helper.xqy");
const lib = require('lib/affiliation-help.sjs');

xdmp.collectionDelete(lib.TESTCOLLECTION);
