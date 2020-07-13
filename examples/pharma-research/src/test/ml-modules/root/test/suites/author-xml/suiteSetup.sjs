const test = require("/test/test-helper.xqy");

const database = xdmp.database("data-hub-FINAL-TEST");

console.log('suite setup');

test.loadTestFile("foo.xml", database, "/foo.xml",[],["Foo", "author-xml-test"]);

// Make sure wwe're actually running in the test db
let assertions = [];
assertions.push(
  test.assertEqual(xdmp.database(), database)
)
assertions
