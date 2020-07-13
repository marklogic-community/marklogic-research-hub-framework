/* For a set of IRIs of existing concepts and entities, find tightly-linked new concepts and entities.
   These are considered "recommendations" on the assumption that if a user has found and/or built a useful graph and 
   is interested in most of the data there, other items linked to many of those existing items may also be useful.

 * 
 * Excludes objects that are not IRIs, e.g string properties.
 * Excludes IRIs of items already in the incoming set.
 */
function bestNewConnection(uris) {

  var values = "";
  var orgValues = "";

  // orgValues is used to filter out existing nodes in the latter part of the code
  Array.from(uris).forEach(function(value) {
   values = values + " <" + value.toString().replace(" ", "\\u0020") + ">";
   orgValues += " <" + value + ">";
  });

//
// Recommendation is based on one hop away from either direction for each input node
// order by most references and name
//
const sparql = `select ?node (count(?node) as ?length) ?name where {

  select * where {
   VALUES ?curr { `+ values + `}
    {
    # C -> N 
    ?curr ?p ?node .
    ?node <PRH:preferredName> ?name
    }

    UNION
    # N -> C
    {
      ?node ?q ?curr .
      ?node <PRH:preferredName> ?name
    }
    FILTER ((isURI(?node)))
    }
  }

  GROUP By ?node
  ORDER BY DESC (?length) ?name

  #LIMIT 10`;

  //TODO Need to reduce the graph to just the entities.
  var result = sem.sparql(sparql,null, "map")
    
  // Having to filter out existing nodes here as I can't get the outer sparql to do it reliably.
  var filtered = Array.from(result).filter(function(x) {
    return orgValues.indexOf(x.node) < 0;
  });
  // top ten
  return filtered.slice(0,20)
};

module.exports = {
  bestNewConnection: bestNewConnection
};