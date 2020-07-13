const test = require('/test/test-helper.xqy');
const lib = require('lib/recommend-help.sjs');
const graph = require('/lib/graph-sparql.sjs');
const recom = require('/lib/recommender.sjs');

let assertions = [];

// Scenario 
// 
// 2 authors (Author-0001, Author-0002)
// 30 Places (Place-11 - Place-40)
// Author-0001 wroteAbout Topic A-F
// Author-0002 wroteAbout Topic A-C
// Topic A happenedNear Place 11-40
// Topic B happenedNear Place 11-20
// Topic C happenedNear Place 13-20
// Topic D happenedNear Place 15-20
// Topic E happenedNear Place 17-20
// Topic F happenedNear Place 19-20
//
// To get recommendations for Author-0001 and Topic A - F
// There will be more than 20 recommendations.  Only the top 20 should be returned.
// 
// Place 19 and 20 have 6 references each (by Topic A-F)
// Place 17 and 18 have 4 references each (by Topic A-E)
// Place 15 and 16 have 4 references each (by Topic A-D)
// Author-0002 has 4 references  (by Topic A-C and Author-0001)
// Place 13 and 14 have 3 references each (by Topic A-C)
// Place 11 and 12 have 2 references each (by Topic A-B)
// All remaining Places has 1 reference each by Topic A
//
var sourceIds = lib.SRCIDS;
var recommended = recom.bestNewConnection(sourceIds);
recommended.forEach( value => {
  xdmp.log("value.node: " + value.node);
});

const author2 = recommended.find(r => r.node.toString() === '/foo/PubMed/Author-0002.json');
const place19 = recommended.find(r => r.node.toString() === '/place/Place-19.json');
const place20 = recommended.find(r => r.node.toString() === '/place/Place-20.json');
const place17 = recommended.find(r => r.node.toString() === '/place/Place-17.json');
const place18 = recommended.find(r => r.node.toString() === '/place/Place-18.json');
const place15 = recommended.find(r => r.node.toString() === '/place/Place-15.json');
const place16 = recommended.find(r => r.node.toString() === '/place/Place-16.json');
const place13 = recommended.find(r => r.node.toString() === '/place/Place-13.json');
const place14 = recommended.find(r => r.node.toString() === '/place/Place-14.json');
const place11 = recommended.find(r => r.node.toString() === '/place/Place-11.json');
const place12 = recommended.find(r => r.node.toString() === '/place/Place-12.json');
const place21 = recommended.find(r => r.node.toString() === '/place/Place-21.json');

assertions.push(
  test.assertEqual(20, recommended.length),

  test.assertEqual('/foo/PubMed/Author-0002.json', author2.node),
  test.assertEqual(4, author2.length),
  test.assertEqual('/place/Place-19.json', place19.node),
  test.assertEqual(6, place19.length),
  test.assertEqual('/place/Place-20.json', place20.node),
  test.assertEqual(6, place20.length),
  test.assertEqual('/place/Place-17.json', place17.node),
  test.assertEqual(5, place17.length),
  test.assertEqual('/place/Place-18.json', place18.node),
  test.assertEqual(5, place18.length),
  test.assertEqual('/place/Place-15.json', place15.node),
  test.assertEqual(4, place15.length),
  test.assertEqual('/place/Place-16.json', place16.node),
  test.assertEqual(4, place16.length),
  test.assertEqual('/place/Place-13.json', place13.node),
  test.assertEqual(3, place13.length),
  test.assertEqual('/place/Place-14.json', place14.node),
  test.assertEqual(3, place14.length),
  test.assertEqual('/place/Place-11.json', place11.node),
  test.assertEqual(2, place11.length),
  test.assertEqual('/place/Place-12.json', place12.node),
  test.assertEqual(2, place12.length),
  test.assertEqual('/place/Place-21.json', place21.node),
  test.assertEqual(1, place21.length)
);

assertions
