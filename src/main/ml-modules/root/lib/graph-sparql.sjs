/* This library bulds and executes SPARQL queries to expand the graph. It delegates to entity.getPredicates()
   for the various EntityConfig subclasses to do so.

   Data is returned in a node-edge format that the Research Hub GUI layer expects.
  */

'use strict';

const sem = require("/MarkLogic/semantics.xqy");
const user = require("/lib/user.sjs");
const allEntities = require('/entities/allEntities');
var graphLib = require("/lib/graph-lib.sjs");

let collections = allEntities.getCollections()
  .map(c => {
    return cts.collectionQuery(c)
  })

let currentUser = user.getCurrentUser();

function isEntityInCurrentWorkspace(entityUri) {
  if(
    currentUser != null &&
    currentUser.hasOwnProperty("currentWorkspace")  &&
    currentUser.currentWorkspace.hasOwnProperty("content") &&
    currentUser.currentWorkspace.content != null &&
    currentUser.currentWorkspace.content.hasOwnProperty("entities") &&
    currentUser.currentWorkspace.content.entities.hasOwnProperty(entityUri)
  ) {
    return true;
  }
  else {
    return false;
  }
};

/* Takes a list of uris and runs Sparql to extract attributes, each with a specific limit.
*/
function expandToGraph(uris, predicates, expansionSpec) {
  //TODO: fix this
  if (predicates == null) {
    predicates = allEntities.getPredicates()
  }
  if (predicates.length === 0) {
    return fetchNodeInfo(uris)
  }

  predicates = predicates
  .map(p => `<${p}> | ^<${p}>`)
  .join(' | ')

  let values = uris
  .map(uri => `<${encodeURI(uri).replace('%','\\u00')}>`)
  .join(' ')

const sparql = `
SELECT
    ?begin ?conn ?end
    (COUNT(?end) AS ?pop)
    ?bName ?bEntity
    ?eName ?eEntity
WHERE {
  VALUES ?begin {` + values + `}

  # Look up returned values
  ?end <PRH:preferredName> ?eName.
  ?end (<PRH:entityType>|<PRH:conceptType>) ?eEntity.
  ?begin <PRH:preferredName> ?bName.
  ?begin (<PRH:entityType>|<PRH:conceptType>) ?bEntity.

  {
    ?begin (
      ${predicates}
    ) ?end.
  }

  {
    ?begin ?conn ?end.
  } UNION {
    ?end ?conn ?begin.
  }
}
GROUP BY ?begin ?conn ?end
ORDER BY DESC(?pop)
LIMIT 10000
`
let result = sem.sparql(
  sparql,[], "map",
  sem.store(
    [],
    cts.andNotQuery(
      cts.orQuery(collections),
      cts.collectionQuery('mdm-archived')
    )
  )
)

/* Mod to find top 30% of topics in code after talk with DH
* I'm using WroteAbout to target Authors
*/
const triples = Array.from(result)

var wroteAbout = []
var referredTo = []
var filtered = []
triples.forEach(function(value,index) {
//Filter out relationships we're interested in
 switch(value.conn.toString()) {
   case "PRH:wroteAbout":
     wroteAbout.push(value)
     break;
   case "PRH:wasReferredToBy":
     referredTo.push(value)
     break;
   default:
     filtered.push(value)
 }

});

// More that 30 topics? - get top 30%
var wroteThrottle = ((wroteAbout.length >=30) ? wroteAbout.length * .30 : wroteAbout.length).toFixed(0);
var wroteAboutFiltered = wroteAbout.slice(0,wroteThrottle)

// Top 20 publication references
var referredByThrottle = 20;
var referredByFiltered = referredTo.slice(0,referredByThrottle)

return filtered.concat(wroteAboutFiltered).concat(referredByFiltered)
};

function fetchNodeInfo(uris) {
  var values = "";
  uris.forEach(function(value) {
   values = values + " <" + encodeURI(value) + ">";
  });

  const sparql = `
    SELECT
      ?begin
      ?bName ?bEntity
    WHERE {
    VALUES ?begin {` + values + `}

    # Look up returned values
    ?begin <PRH:preferredName> ?bName.
    ?begin (<PRH:entityType>|<PRH:conceptType>) ?bEntity.

    ?begin ?conn ?end
    }
    GROUP BY ?begin
    `;

  var bindings = []
  Array.from(uris).forEach(function(value) {
    bindings.push({"begin": sem.iri(value)})
  });
  let result = sem.sparql(
    sparql,[], "map",
    sem.store([], null)
  )

  const triples = Array.from(result);
  return triples;
}

function appendNodes(nodeList, nodeInfoList) {
  if (!nodeList) {
    nodeList = [];
  }

  nodeInfoList.forEach(function (nodeInfo) {
    var found = false;
    for (var i=0; i < nodeList.length; i++) {
      var node = nodeList[i];
      if (node.id == nodeInfo.begin) {
        found = true;
        break;
      }
    }

    if (!found) {
      nodeList.push({
        id: nodeInfo.begin,
        label: nodeInfo.bName,
        group: nodeInfo.bEntity,
        level: 1,
        isInCurrentWorkspace: isEntityInCurrentWorkspace(nodeInfo.begin),
        isRecommendation: false
      });
    }
  });
}

/* Build a graph from triples
*
*/
function buildGraph(uris, options = {}) {
  xdmp.log('buildGraph cost called with uris: ' + xdmp.quote(uris));

  let startTime = new Date().getTime();

  let groupSuffix = "";
  let recommendation = false;

  // placeholders so we can produce a unique list of nodes, edges and uris
  let nodeUriMap = {};
  let edgesMap = {};
  let uriMap = {};

  if(options.hasOwnProperty("recommended")) {
    groupSuffix = "Recommendation" ;
    recommendation = true;
  }

  //If we send in an source set, we only want nodes not in that set else all
  if (options.hasOwnProperty("sourceIds")) {
      options.sourceIds.forEach(function(value) {
      nodeUriMap[value] = true;
    });
  }

  let entityList = allEntities.allEntities;

  let nodeList = [];
  let edgeList = [];
  let uriList = [];

  // make a list of relatedEntityMap
  let relatedEntityList = [];

  Array.from(entityList).forEach(function (entity) {
    // get the expansion spec from the entity
    // NOTE: in the future this could come from UI or from a config file
    let expansionSpec = entity.getDefaultExpansionSpec();

    // get the related entities of type entity.getType() for the specified uris
    let relatedEntitiesStartTime = new Date().getTime();
    let relatedEntityMap = entity.getRelatedEntitiesOfMyType(uris);
    let relatedEntitiesEndTime = new Date().getTime();
    xdmp.log('getRelatedEntitiesOfMyType ' + entity.getType() + ' cost: ' + (relatedEntitiesEndTime - relatedEntitiesStartTime) + 'ms');

    relatedEntityList.push({
      entity: entity,
      relatedEntityMap: relatedEntityMap
    });
  });

  // make a list of all the uris so we can get the node info in one batch
  // create a sparqlNodeInfoMap we can use to initialize the nodeInfoMap cache
  let fetchNodeInfoMapStartTime = new Date().getTime();
  let relatedUriList = [];
  let sparqlNodeInfoMap = {};
  relatedEntityList.forEach(function (relatedEntityObj) {
      let entity = relatedEntityObj.entity;
      let relatedEntityMap = relatedEntityObj.relatedEntityMap;

      let uriKeyList = Object.keys(relatedEntityMap);
      uriKeyList.forEach(function (uriKey) {
        // get the list of entities related to a uri
        let relatedEntityObjList = relatedEntityMap[ uriKey ] || [];

        relatedEntityObjList.forEach(function (relatedEntityObj) {
          if (relatedEntityObj.name && relatedEntityObj.type) {
            sparqlNodeInfoMap[relatedEntityObj.uri] = relatedEntityObj;
          }
          else {
            relatedUriList.push(relatedEntityObj.uri);
          }
        });
      });
  });
  graphLib.cacheNodeInfoMap(sparqlNodeInfoMap);
  let allUris = uris.concat(relatedUriList);

  let nodeInfoMap = graphLib.fetchNodeInfoMapWithCache(allUris);
  let fetchNodeInfoMapEndTime = new Date().getTime();
  xdmp.log('graphLib.fetchNodeInfoMap of ' + allUris.length + ' uris cost: ' + (fetchNodeInfoMapEndTime - fetchNodeInfoMapStartTime) + 'ms');

  // process each of the parameter uri
  uris.forEach(function (paramUri) {
    // add all parameter uris to the list of uris
    addToUriList(uriList, paramUri, uriMap);

    // add node for each parameter uri
    if (!nodeUriMap.hasOwnProperty(paramUri)) {
      nodeUriMap[paramUri] = true;

      let nodeInfo = nodeInfoMap[ paramUri ];
      if (nodeInfo) {
        let node = {
          id: paramUri,
          label: nodeInfo.name,
          group: nodeInfo.type,
          level: 1,
          isInCurrentWorkspace: isEntityInCurrentWorkspace(paramUri),
          isRecommendation: recommendation
        };
        nodeList.push(node);
      }
    }
  });

  // process each of the related entity
  let addToResultStartTime = new Date().getTime();
  relatedEntityList.forEach(function (relatedEntityObj) {
    let entity = relatedEntityObj.entity;
    let relatedEntityMap = relatedEntityObj.relatedEntityMap;

    // get the URI keys
    let uriKeyList = Object.keys(relatedEntityMap);

    // create node, edge, and uri list
    uriKeyList.forEach(function (uriKey) {
      // get the list of entities related to a uri
      let relatedEntityObjList = relatedEntityMap[ uriKey ] || [];

      relatedEntityObjList.forEach(function (relatedEntityObj) {
        let relatedEntityUri = relatedEntityObj.uri;

        // append the node if it doesn't exist on the node list
        if (!nodeUriMap.hasOwnProperty(relatedEntityUri)) {
          nodeUriMap[relatedEntityUri] = true;

          let nodeInfo = nodeInfoMap[relatedEntityUri];

          if (nodeInfo) {
            let node = {
              id: relatedEntityUri,
              label: nodeInfo.name,
              group: nodeInfo.type,
              level: 1,
              isInCurrentWorkspace: isEntityInCurrentWorkspace(relatedEntityUri),
              isRecommendation: recommendation,
            };
            nodeList.push(node);
          }
        }

        // append the edge
        let edge = {
          from: uriKey,
          to: relatedEntityUri
        };
        addToEdgeList(edgeList, edge, edgesMap);

        // append the uri
        addToUriList(uriList, relatedEntityUri, uriMap);
      });

      // append the uri
      addToUriList(uriList, uriKey, uriMap);
    });
  });
  let addToResultEndTime = new Date().getTime();
  xdmp.log('addToResult cost: ' + (addToResultEndTime - addToResultStartTime) + 'ms');

  var graph = {
    nodes: nodeList,
    edges: edgeList,
    uris: uriList
  };

  let endTime = new Date().getTime();
  xdmp.log('buildGraph cost: ' + (endTime - startTime) + 'ms');

  return graph;
};

function addToEdgeList(edgeList, edge, edgesMap) {
  // ignore edges originate and end on the same node
  if (edge.from === edge.to) {
    return;
  }

  let edgeId = edge.from + '|' + edge.to;
  if (!edgesMap[edgeId]) {
    edgeList.push(edge);
    edgesMap[edgeId] = true;
  }
}

function addToUriList(uriList, uri, uriMap) {
  if (!uriMap[uri]) {
    uriList.push(uri);
    uriMap[uri] = true;
  }
}

module.exports = {
  expandToGraph : expandToGraph,
  buildGraph: buildGraph,
  fetchNodeInfo: fetchNodeInfo,
};
