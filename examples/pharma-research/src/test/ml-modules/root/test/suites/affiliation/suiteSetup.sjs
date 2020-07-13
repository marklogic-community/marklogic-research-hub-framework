const test = require("/test/test-helper.xqy");
const lib = require('lib/affiliation-help.sjs');

const database = xdmp.database("data-hub-FINAL-TEST");
//const modulesDatabase = xdmp.database("data-hub-MODULES");

test.loadTestFile("foo.xml", database,lib.URIS.foo,[],["Foo",lib.TESTCOLLECTION]);
//add another author but only element data - relies on TDE projection for basic triples

// Make sure wwe're actually running in the test db

