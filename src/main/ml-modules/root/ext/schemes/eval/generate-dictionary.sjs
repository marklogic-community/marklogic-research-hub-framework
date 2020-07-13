'use strict';
declareUpdate();

const sem = require('/MarkLogic/semantics');
const entity = require('/MarkLogic/entity');
const dict = require('/lib/dictionary-utils');

/* Determines which graphs have enough detail to go into the dictionary
     - probably want to break this into separate function and build
       individual dictionaries when necessary
 */
var graphsList = [];
// var ignoreList = [];
var sparqlQuery = `prefix skos: <http://www.w3.org/2004/02/skos/core#>
  SELECT (count(distinct ?id) as ?count)
  WHERE {
    ?id skos:inScheme [] ;
        a skos:Concept .
  }`;
var collections = cts.collectionMatch("vocabulary-*");
for (const graph of collections) {
  var dg = "default-graph=" + graph;
//  var store = sem.store(null, cts.collectionQuery([graph]));
  var count = sem.sparql(
      sparqlQuery,
      [],
      [dg]
  )
  for (const c of count) {
    if (c.count > 0) {
      graphsList.push(graph);
//    } else {
//      ignoreList.push(c);
    }
  }
};

graphsList.map(function (d) {
  return entity.dictionaryInsert(dict.dictionaryName(d), entity.skosDictionary(d, "en", ["case-insensitive", "remove-overlaps"]));
});

