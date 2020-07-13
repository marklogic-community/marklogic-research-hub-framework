/* Service endpoint to get related nodes and edges based on an iniitial set of nodes and edges.

   This can be used to populate an entire graph based on initial search results (e.g. from 10 items of type X).
   This can also be used to expand the graph based on a single selected item where we want to see
   related entities and concepts.
 */

const error = require("/lib/error.sjs");
const graph = require("/lib/graph-sparql.sjs");

function get(context, params) {

  if (params.hasOwnProperty("id")) {
    //uri can come in encoded many times
    var uris = params.id.toString().split(",").map(key => decodeURIComponent(decodeURIComponent(decodeURIComponent(decodeURIComponent(key)))))

    data = graph.buildGraph(uris)

    return data;

  } else {
    return error.getError("general", "noId");
  }

};

exports.GET = get;
