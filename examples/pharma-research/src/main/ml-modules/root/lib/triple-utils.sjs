
/* Takes src author and array of pubs and generates frequency triples for co-authorship
* based on percentage.
* TODO This doesn't really work with low numbers of articles as every
* relationship is Frequent then.
*
* var pubs = ["/PubMed/PMID-5359954.xml","/PubMed/PMID-4895801.xml"]
* var author = "/com.marklogic.smart-mastering/merged/351474292e5922e2f73525841cf35aad.json"
* var t = getCoAuthorTriples(pubs,author)
*/
function getCoAuthorTriples(pubs,author) {
  var values = "";
  pubs.forEach(function(value) {
   values = values + " <" + value + ">";
  });
  
  var totalPubs = pubs.length;
  
  var params = {"author":sem.iri(author), "tot": totalPubs};
  
  const sparql = `SELECT  ?s ?src (count(?p) as ?count) (count(?p)/?total*100 as ?sum)
  WHERE {
    BIND(?author AS ?src).
    BIND(?tot AS ?total).
    VALUES ?p { ` + values + `} .
    ?s <PRH:authored> ?p .
    FILTER (?s NOT IN (?src))
  } GROUP BY ?s `;
  
  var s = sem.sparql(sparql,params, "map",sem.store([],cts.andQuery([cts.notQuery(cts.collectionQuery("authorArchived")),cts.collectionQuery("Author")])));
  
  // Surpressing  1:1 values so not to over-connect TODO this needs a better algorithm
  var results = [];
  Array.from(s).forEach(function(value) {
    if(value.sum >=75 && value.count > 1)
      results.push(sem.triple(sem.iri(value.src),sem.iri("PRH:authorFrequent"),sem.iri(value.s)));
  else if(value.sum >=30 && value.count > 1)
      results.push(sem.triple(sem.iri(value.src),sem.iri("PRH:authorOccasional"),sem.iri(value.s)));
  else if(value.sum >=10 && value.count > 1)
      results.push(sem.triple(sem.iri(value.src),sem.iri("PRH:authorSeldom"),sem.iri(value.s)));
  });
  
  return results
  
  };
  
  /* Contruct a new set of unique author triples with subject of merged doc
  * Add de-duped set of all other triples.
  * Removes author preferredName so it can be uodated.
  */
  function getAuthorTriples(uris, subject) {
  var params = {"subject": sem.iri(subject)};
  
  var values = "";
  Array.from(uris).forEach(function(value) {
   values = values + " <" + value + ">";
  });
  
  const sparql = `CONSTRUCT {?t ?p ?o.}
  WHERE {SELECT ?t ?p ?o
   WHERE {{
      SELECT ?t ?p ?o WHERE
      { ?s ?p ?o.
      VALUES ?s { ` + values + `} .
       BIND(?subject AS ?t)
       FILTER (!CONTAINS(?p, 'hasPlaceholder'))
      }
    }
    UNION {
      SELECT ?t ?p ?o WHERE {?t ?p ?o .
      VALUES ?s { ` + values + `} .
        FILTER NOT EXISTS { ?s ?p ?q }
  }}}}`;
  
  return sem.sparql(sparql,params, "map",sem.store([], cts.documentQuery(uris)))
  };
  
  module.exports = {
    getAuthorTriples: getAuthorTriples,
    getCoAuthorTriples: getCoAuthorTriples
  };
  