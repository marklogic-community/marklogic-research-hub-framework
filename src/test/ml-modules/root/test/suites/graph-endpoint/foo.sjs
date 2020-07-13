const test = require('/test/test-helper.xqy');
const lib = require('lib/graph-help.sjs');
const graph = require('/lib/graph-sparql.sjs');

let assertions = [];

// Scenario 1:
var uri = lib.URIS.foo
var result= graph.expandToGraph([uri])

/*
Author frequent links to the second author via TDE
*/

const affiliatedWith = result.find(r => r.conn.toString() === 'PRH:affiliatedWith')
const authorFrequent = result.find(r => r.conn.toString() === 'PRH:authorFrequent')
const wroteAbout = result.filter(r => r.conn.toString() === 'PRH:wroteAbout')
const wrote1 = wroteAbout.find(r => r.eName === 'Topic One')
const wrote2 = wroteAbout.find(r => r.eName === 'Topic Two')

assertions.push(
  test.assertEqual(4, result.length),

  test.assertEqual(lib.URIS.foo, affiliatedWith.begin),
  test.assertEqual(sem.iri('/place/PlaceOne.json'), affiliatedWith.end),
  test.assertEqual("PRH:affiliatedWith", affiliatedWith.conn),
  test.assertEqual(1, affiliatedWith.pop),
  test.assertEqual('Test Author One', affiliatedWith.bName),
  test.assertEqual('foo', affiliatedWith.bEntity),
  test.assertEqual('Place One', affiliatedWith.eName),
  test.assertEqual('institution', affiliatedWith.eEntity),

  test.assertEqual(lib.URIS.foo2, authorFrequent.end),
  test.assertEqual("PRH:authorFrequent", authorFrequent.conn),
  test.assertEqual('Test Author Two', authorFrequent.eName),
  test.assertEqual('foo', authorFrequent.eEntity),

  test.assertEqual(2, wroteAbout.length),

  test.assertEqual(sem.iri('/topic/TopicOne.json'), wrote1.end),
  test.assertEqual("PRH:wroteAbout", wrote1.conn),
  test.assertEqual('Topic One', wrote1.eName),
  test.assertEqual('topic', wrote1.eEntity),

  test.assertEqual(sem.iri('/topic/TopicTwo.json'), wrote2.end),
  test.assertEqual("PRH:wroteAbout", wrote2.conn),
  test.assertEqual('Topic Two', wrote2.eName),
  test.assertEqual('topic', wrote2.eEntity)
);

assertions
