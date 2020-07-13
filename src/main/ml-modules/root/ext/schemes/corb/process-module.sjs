/*
  Old example code from a pharma example that converts SKOS ontology data into another form using corb.

  Included for reference only.
  
  This script takes a batch of concept ID concept scheme pairs and the vocabulary, then splits them up so as to create 
  triples that are then inserted into a document.  
*/
"use strict";

declareUpdate();

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

function createTriple(id, conceptScheme) {
  return sem.triple(sem.iri(id), sem.iri("http://www.w3.org/2004/02/skos/core#" + "inScheme"), sem.iri("http://marklogic.com/rpaas/conceptScheme#" + conceptScheme));
}

var URI;
//let list = "0%%%Domain$/concept/athena/cdmv5.1/1.xml|metadata^/concept/athena/cdmv5.1/10.xml|metadata";
let preListArray = URI.split("%%%");
let id = preListArray[0];
let listArray = preListArray[1].split("$");
let vocabulary = listArray[0];
let items = listArray[1].split("^").map(function (i) {
    let p = i.split("|");
    return createTriple(p[0], p[1]); //{ "id": p[0], "conceptScheme": p[1] };
  });
xdmp.documentInsert(
  "/data/rpaas/concepts-in-schemes/" + Number(id).pad(5) + ".json",
  {
    "triples": items
  },
  {
    collections : "vocabulary-" + vocabulary
  }
)