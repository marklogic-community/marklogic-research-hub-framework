const test = require("/test/test-helper.xqy");
const lib = require('lib/workspace-help.sjs');

const database = xdmp.database("data-hub-FINAL-TEST");
test.loadTestFile("foo.json",database,lib.URIS.foo,[],["Foo",lib.TESTCOLLECTION]);
test.loadTestFile("foo2.json",database,lib.URIS.foo2,[],["Foo",lib.TESTCOLLECTION]);
test.loadTestFile("foo3.json",database,lib.URIS.foo3,[],["Foo",lib.TESTCOLLECTION]);
test.loadTestFile("workspace.json",database,lib.URIS.secWorkspace,[],["workspace","/user/admin.json",lib.TESTCOLLECTION]);
test.loadTestFile("testWorkspace.json",database,lib.URIS.testWorkspace,[],["workspace","/user/admin.json",lib.TESTCOLLECTION]);

xdmp.log("|============================================================================================================================================================================================|");

// Make sure wwe're actually running in the test db
let assertions = [];
assertions.push(
  test.assertEqual(xdmp.database(), database)
);
assertions;
