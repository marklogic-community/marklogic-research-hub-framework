/*
  This script runs a SPARQL query to derive a concept scheme, based on the domain associated with the concept ID, for every concept ID.
  It then creates a sequence of batches.  Each batch contains a list of 100 concepts, each with its associated concept scheme.
  Each batch also contains the associated vocabulary.
*/

"use strict";

let sqstr = `prefix skos: <http://www.w3.org/2004/02/skos/core#>

    select ?vocabulary ?conceptScheme ?id
      #?id skos:inScheme ?conceptScheme .
      #?conceptScheme a skos:ConceptScheme;
      #               skos:prefLabel ?domain .
    WHERE {
      ?id <http://marklogic.com/ohdsi/omopcdm/vocabulary/concept#domain> ?domain;
          <http://marklogic.com/ohdsi/omopcdm/vocabulary/concept#vocabulary> ?vocabulary .
      #BIND (iri(concat("http://marklogic.com/rpaas/conceptScheme#", lcase(replace(?domain, "[\\\\s/]", "", "i")))) AS ?conceptScheme)
      BIND (lcase(replace(?domain, "[\\\\s/]", "", "i")) AS ?conceptScheme)
    }
    order by ?vocabulary ?conceptScheme
    #limit 300`;
let srs = sem.sparql(sqstr);
let resultArray = [];
let itemArray = [];
let maxItems = 100;
let prevVocab = "";
let resultArrayIndexCount = 0;
for (const sr of srs) {
  if (sr.vocabulary === prevVocab) {
    if (itemArray.length < maxItems) {
      itemArray.push(sr.id + "|" + sr.conceptScheme);
    } else {
      resultArray.push(resultArrayIndexCount++ + "%%%" + sr.vocabulary + "$" + itemArray.join("^"));
      itemArray = [];
      itemArray.push(sr.id + "|" + sr.conceptScheme);
    }
  } else {
    if (itemArray.length > 0) {
      resultArray.push(resultArrayIndexCount++ + "%%%" + prevVocab + "$" + itemArray.join("^"));
      itemArray = [];
    }
    itemArray.push(sr.id + "|" + sr.conceptScheme);
    prevVocab = sr.vocabulary;
  }
}
if (itemArray.length > 0) {
  resultArray.push(resultArrayIndexCount++ + "%%%" + prevVocab + "$" + itemArray.join("^"));
}
//resultArray;
//xdmp.save("/tmp/result.txt", (new NodeBuilder()).addText(resultArray.join("\n")).toNode());

fn.insertBefore(Sequence.from(resultArray), 0, resultArray.length);