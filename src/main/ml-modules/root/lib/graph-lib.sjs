'use strict';

const sem = require("/MarkLogic/semantics.xqy");

function fetchNodeInfoList(uris) {
  const sparql = `
    SELECT
      ?begin
      ?name
      ?type
    WHERE {
      # Look up returned values
      ?begin <PRH:preferredName> ?name.
      ?begin (<PRH:entityType>|<PRH:conceptType>) ?type.

      ?begin ?conn ?end
      FILTER (?begin = ?b)
    }
    GROUP BY ?begin
    `;

  let iris = uris.map(u => { return sem.iri(u) });
  let bindings = {
    b: iris
  };
  let result = sem.sparql(sparql, bindings, ["optimize=2"]);

  const triples = Array.from(result);
  return triples;
}

function fetchNodeInfoMap(uris) {
  if (!uris || uris.length == 0) {
    return {};
  }

  let nodeInfoList = fetchNodeInfoList(uris);

  let nodeInfoMap = {};
  nodeInfoList.forEach(function (nodeInfo) {
    nodeInfoMap[ nodeInfo.begin ] = nodeInfo;
  });

  return nodeInfoMap;
}

function fetchNodeInfo(uri) {
  let nodeInfoList = fetchNodeInfoList([uri]);
  return nodeInfoList.length > 0 ? nodeInfoList[0] : {};
}

var nodeInfoMap = {};

/**
* Initialize the nodeInfoMap cache with data from the specified sourceNodeInfoMap.
*/
function cacheNodeInfoMap(sourceNodeInfoMap) {
  Object.keys(sourceNodeInfoMap).forEach(function (key) {
    nodeInfoMap[key] = sourceNodeInfoMap[key];
  });
}

/**
* Get the node name and type of each of the specified uris.
* If the uri already has a cached data, then the cached data is returned instead of executing a SPARQL query.
* This function returns all cached uri -> (name, type) information during the lifetime of a web request.
*/
function fetchNodeInfoMapWithCache(uris) {
  if (!uris || uris.length == 0) {
    return nodeInfoMap;
  }

  let uncachedUris = [];
  uris.forEach(function (uri) {
    if (!nodeInfoMap[uri]) {
      uncachedUris.push(uri);
    }
  });

  let nodeInfoList = fetchNodeInfoList(uncachedUris);
  nodeInfoList.forEach(function (nodeInfo) {
    nodeInfoMap[ nodeInfo.begin ] = nodeInfo;
  });

  return nodeInfoMap;
}

function expandToGraph(uris, predicates, expansionSpec, targetEntity) {
  if (predicates == null) {
    return null;
  }
  if (predicates.length === 0) {
    return null;
  }

  predicates = predicates
    .map(p => `<${p}> | ^<${p}>`)
    .join(' | ');

  let limit = expansionSpec.limit || 10;

  const sparql = `
  SELECT
      ?begin ?conn ?end
      (COUNT(?end) AS ?pop)
      ?bName ?bEntity
      ?eName ?eEntity
  WHERE {
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

    FILTER (?begin = ?b)
    FILTER (?eEntity = ?entityType)
  }
  GROUP BY ?begin ?conn ?end
  ORDER BY DESC(?pop)
  LIMIT ?limit
  `;

  let iris = uris.map(u => { return sem.iri(u) });
  let bindings = {
    limit: limit,
    b: iris,
    entityType: targetEntity
  };
  let seed = parseInt(xdmp.md5(targetEntity), 16) % 10000000000000000000;
  let options = [
    "optimize=2",
    "seed=" + seed
  ];

  //xdmp.log('cost graph-lib sparql: ' + sparql);
  //xdmp.log('cost bindings: ' + xdmp.quote(bindings));

  let entityCollections = getAllEntitiesCollections();
  let entityCollectionQueries = entityCollections.map(entityCollection => cts.collectionQuery(entityCollection));
  let tripleStore = sem.store([], cts.orQuery(entityCollectionQueries));

  //xdmp.log('cost triple store query: ' + cts.orQuery(entityCollectionQueries));

  let expandToGraphSparqlStart = new Date().getTime();
  let result = sem.sparql(sparql, bindings, options, tripleStore);
  let expandToGraphSparqlEnd = new Date().getTime();
  xdmp.log('cost of sparql exec for ' + xdmp.quote(uris) + ': ' + (expandToGraphSparqlEnd - expandToGraphSparqlStart) + 'ms')

  const triples = Array.from(result)
  return triples;
};

/**
* Find `targetEntity` entities in the graph
* given the specified uris, predicates
* and using the specified expansionSpec
*/
function findInGraph(uris, predicates, expansionSpec, targetEntity) {
  let triples = expandToGraph(uris, predicates, expansionSpec, targetEntity);

  let uriMap = {};
  triples.forEach(function (triple) {
    if (triple.bEntity === targetEntity) {
      if (!uriMap[triple.begin]) {
        uriMap[triple.begin] = {
          uri: triple.begin,
          name: triple.bName,
          type: triple.bEntity
        };
      }
    }
    if (triple.eEntity === targetEntity) {
      if (!uriMap[triple.end]) {
        uriMap[triple.end] = {
          uri: triple.end,
          name: triple.eName,
          type: triple.eEntity
        };
      }
    }
  });

  // return only at most expansionSpec.limit number of uris
  let limit = expansionSpec ? expansionSpec.limit : null;
  let resultKeys = Object.keys(uriMap);
  let limitedResultKeys = limit ? resultKeys.splice(0, limit) : resultKeys;

  let result = [];
  limitedResultKeys.forEach(function (resultKey) {
    result.push(uriMap[resultKey]);
  });
  return result;
};

var allEntitiesMap = null;
function getAllEntitiesMap() {
  if (allEntitiesMap != null) {
    return allEntitiesMap;
  }
  else {
    allEntitiesMap = {};

    const entityNames = fn.collection('http://marklogic.com/entity-services/models')
      .toObject()
      .map(e => e.toObject().info.title.toLowerCase());

    entityNames.forEach(function (name) {
      const entityFile = `/entities/${name}`;
      try {
        const Entity = require(entityFile);
        let entity = new Entity(null);

        // register both the lowercase entity name and the value returned by Entity.getType()
        // to avoid confusion when the entity type is mixed case
        allEntitiesMap[name] = entity;
        allEntitiesMap[entity.getType()] = entity;
      }
      catch(e) {
        xdmp.log('Cannot create an entity object of type: ' + entityFile + ". Likely no subclass of EntityConfig defined", 'info');
      }
    });

    return allEntitiesMap;
  }
}

function getAllEntitiesCollections() {
  let allEntitiesMap = getAllEntitiesMap();
  let collectionList = [];
  Object.keys(allEntitiesMap).forEach(function (entityName) {
    let entity = allEntitiesMap[entityName];
    collectionList.push(entity.getCollection());
  });
  return collectionList;
}

module.exports = {
  fetchNodeInfoList: fetchNodeInfoList,
  fetchNodeInfoMap: fetchNodeInfoMap,
  fetchNodeInfo: fetchNodeInfo,
  cacheNodeInfoMap: cacheNodeInfoMap,
  fetchNodeInfoMapWithCache: fetchNodeInfoMapWithCache,
  findInGraph: findInGraph,
  getAllEntitiesMap: getAllEntitiesMap,
  getAllEntitiesCollections: getAllEntitiesCollections
};
