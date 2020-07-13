const test = require("/test/test-helper.xqy");
const lib = require('lib/test-help.sjs');

const database = xdmp.database("data-hub-FINAL-TEST");

test.loadTestFile("employee1.json",database,lib.URIS.employee1,[],["HarmonizeEmployee", "Person",lib.TESTCOLLECTION]);
test.loadTestFile("employee2.json",database,lib.URIS.employee2,[],["HarmonizeEmployee", "Person",lib.TESTCOLLECTION]);
test.loadTestFile("position1.json",database,lib.URIS.position1,[],["HarmonizePosition", "Position",lib.TESTCOLLECTION]);
test.loadTestFile("position2.json",database,lib.URIS.position2,[],["HarmonizePosition", "Position",lib.TESTCOLLECTION]);
test.loadTestFile("workspace.json",database,lib.URIS.testWorkspace,[],["workspace","/user/admin.json",lib.TESTCOLLECTION]);

xdmp.log("|============================================================================================================================================================================================|");

// Make sure wwe're actually running in the test db
let assertions = [];
assertions.push(
  test.assertEqual(xdmp.database(), database)
);
assertions;
