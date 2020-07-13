const test = require("/test/test-helper.xqy");
const lib = require('lib/graph-help.sjs');

const database = xdmp.database("data-hub-FINAL-TEST");
const modulesDatabase = xdmp.database("data-hub-MODULES");

test.loadTestFile("foo.json", database,lib.URIS.foo,[],["Foo",lib.TESTCOLLECTION]);
//add another author but only element data - relies on TDE projection for basic triples
test.loadTestFile("foo2.json", database,lib.URIS.foo2,[],["Foo",lib.TESTCOLLECTION]);
test.loadTestFile("foo.entity.json", database,lib.URIS.fooEntity, [], ["http://marklogic.com/entity-services/models", lib.TESTCOLLECTION]);
test.loadTestFile("foo.sjs", modulesDatabase, lib.URIS.fooSjs, [], [lib.TESTCOLLECTION])

// Make sure wwe're actually running in the test db
let assertions = [];
assertions.push(
  test.assertEqual(xdmp.database(), database)
)
assertions
