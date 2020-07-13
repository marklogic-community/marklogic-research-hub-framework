const sem = require("/MarkLogic/semantics.xqy");
const createEntity = require('../entities/entityconfig.sjs').createEntity;

const autoExpandEntities = {
  "mediator" : true
}

function highlight(node, term){
  var x = {"match-text": node};
  var result = new NodeBuilder();
  const terms = term.toString().split(' ')
  cts.highlight(x, cts.wordQuery(terms),
    function(builder,text,node,queries,start) {
      builder.addNode( {"highlighted" : text} );
    }, result
  );

 return result.toNode();
}

function highlightArray(array, term){
  let newArray = [];
  array.forEach(function(value){
    if (typeof value === 'string' || value instanceof String){
      newArray.push(highlight(value,term))
    }

    if (Array.isArray()){
       newArray.push(highlightArray(value, term))
    }

   if (value && typeof value === 'object' && value.constructor === Object){
      newArray.push(highlightObject(value, term))
   }
 })
 return newArray
}

function highlightObject(obj, term){
  Object.keys(obj).forEach(function(key){
    let value = obj[key];
    // is a string
    if (typeof value === 'string' || value instanceof String){
      obj[key] = highlight(value,term)
    }

    if (Array.isArray()){
      obj[key] = highlightArray(value, term)
    }

   if (value && typeof value === 'object' && value.constructor === Object){
     obj[key] = highlightObject(value, term)
   }

  });

  return obj
}

function mergeDefaultOptions(optionsIn){
  let defaultOptions = {
    "getRelationships": false,
    "getContent": false,
    "getHighlighted": false,
    "terms": "",
  }
  return Object.assign(defaultOptions, optionsIn);
}

function getDataByDocument(entityDocument, optionsIn){
  let result = buildDefaultEntity();
  let options = mergeDefaultOptions(optionsIn)
  let entityURI = xdmp.nodeUri(entityDocument)

  if (entityURI != null){
    let entity = createEntity(entityDocument.root);

    result.type = entity.getType(entity);

    result.preferredName = entity.getPreferredName();

    if (options.getRelationships){
      result.relationships = entity.getRelationships(result.type, entityURI);
    }

    let content = null;
    if (options.getContent){
      content = entity.getContent(entity, result.type).toObject();
      delete content.enrichment;
      content.preferredName = result.preferredName;
      content.type = result.type;
      content.id = content.id || fn.encodeForUri(entityURI);
    }

    if (options.getHighlighted && content != null){
      //so we dont change the objects part of content
      result.highlighted = JSON.parse(JSON.stringify(content));
      result.highlighted = highlightObject(result.highlighted, options.terms)
    }

    result.entity = content;
  }
  return result
}

//gets all the data form triples because we dont have a document for it
function getDataByTriples(uri, optionsIn){
    xdmp.log(`Getting Data by Triples ${uri}`)

  let result = buildDefaultEntity();

  let options = mergeDefaultOptions(optionsIn);

  var params = {
    "Entity": sem.iri(uri),
    "PreferredName":  sem.iri("PRH:preferredName"),
    "EntityType": [sem.iri("PRH:entityType"),sem.iri("PRH:conceptType")]
  };

  let resultSparql = sem.sparql('SELECT ?preferredName ?entityType WHERE {?Entity ?PreferredName ?preferredName. ?Entity ?EntityType ?entityType  } limit 1', params);
  if (xdmp.logLevel() == "debug") {
    meters = xdmp.queryMeters();
    logMeterStats("getDataByTriples", uri, "", meters);
  }
  let resultSparqlObj = resultSparql.toArray()[0];

  if (resultSparqlObj){

    result.entity = {
      type: resultSparqlObj.entityType,
      preferredName: resultSparqlObj.preferredName
    };

    result.preferredName = resultSparqlObj.preferredName;

    params.expandFlag = ((autoExpandEntities.hasOwnProperty(result.type)) ? autoExpandEntities[result.type] : false );
    if (options.getRelationships) {
      let relationshipsSparql = sem.sparql(`
        SELECT ?uri ?preferredName ?entityType ?autoExpand WHERE
        {
         ?uri ?predicate ?Entity.
         ?uri ?PreferredName ?preferredName.
         ?uri ?EntityType ?entityType
         BIND(?expandFlag as ?autoExpand)
         }
        `, params)
      if (xdmp.logLevel() == "debug") {
        meters = xdmp.queryMeters();
        logMeterStats("getDataByTriplesWithRelationships", uri, "", meters);
      }
      result.relationships = relationshipsSparql.toArray();
    }
  }
  return result
}

//requires the URI and gets the data based on the entity type
function getData(uri, options){
  let result = buildDefaultEntity();
  if (fn.docAvailable(uri)) {
    let entityDocument = cts.doc(uri)
    result = getDataByDocument(entityDocument, options);
  } else {
    result = getDataByTriples(uri, options)
  }
  return result;
}

function buildDefaultEntity(){
  let result =  {
    relationships: [],
    entity: null,
    highlighted: null
  };

  return result
}

function getMeterStats(meters) {
    var metersJson = {
      //'documents': meters.documents,
      'expandedTreeCacheHits': meters.expandedTreeCacheHits,
      'expandedTreeCacheMisses': meters.expandedTreeCacheMisses,
      'listCacheHits': meters.listCacheHits,
      'listCacheMisses': meters.listCacheMisses,
      'triple-cache-hits': meters.tripleCacheHits,
      'tripleCacheMisses': meters.tripleCacheMisses,
      'lock-time': meters.lockTime
    }
  return metersJson
};

function logMeterStats(method, uri, predicate, meters) {
  let logOutput = {
      "input": {
        "method": method,
        "uri": uri,
        "predicate": predicate
      },
      "output": {
        "meterStats": getMeterStats(meters)
      }
    }
  xdmp.log(logOutput, "debug");
}

module.exports = {
  getData: getData,
  getDataByDocument: getDataByDocument
};
