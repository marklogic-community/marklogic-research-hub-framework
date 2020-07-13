var graphLib = require("/lib/graph-lib.sjs");

/* This is the superclass of all back-end Entity classes. For every Entity added to a Data Hub, a subclass of this
   class must be created.

   This class serves as the super class of all entities.
   This class cannot 'require' /entities/allEntities to avoid a cyclic-dependency.
 */
class EntityConfig {
    constructor(entity) {
        this.entity = entity;
    }

    /* the text representation of this inistance */
    getPreferredName() {
        console.log('getPreferredName not implemented.');
    }

    /* static. returns the string indicating the type. Returned in some service calls
       and also useful for logging */
    getType() {
        console.log('getType not implemented.');
    }

    /* get the instance data from the envelope */
    getContent() {
        console.log('getContent not implemented.');
    }

    /* Used in the entity.sjs service call to find related items. Note the graph
       code to find related items is based on getPredicates() instead.

       TODO: combine this code and ideally use the same graph libraries that get
       graph links to get related items as well. */
    getRelationships(type, entityURI) {
        console.log('getRelationships not implemented.');
    }

    /* predicate list used to build the overall SPARQL queries that expand the graph.
       by returning relevant IRIs of predicates used for this entity, the core framework
       code will build the right SPARQL to find related items to this item on the graph */
    getPredicates() {
        console.log('getPredicates not implemented.');
    }

    /**
    * Get the query for the related entity.
    *
    * uri - the uri of the entity
    * nodeInfo - an object containing the "node info" (label, entity type) of the entity
    */
    getQueryForRelatedEntity(uri, nodeInfo) {
      if (!nodeInfo) {
        return null;
      }

      let relatedNodeEntityType = nodeInfo.type;

      // get the entity object for the related node's entity type
      let allEntitiesMap = graphLib.getAllEntitiesMap();
      let entity = allEntitiesMap[ relatedNodeEntityType ];

      const boundGetQueryForEntity = this.getQueryForEntity.bind(this);

      // ask the entity to give the query we can use to find items related to it
      // e.g. for drugs, genes, proteins and studies, this is the enrichment query
      // for authors and publications, this is a triple query
      if (!entity) {
        return null;
      }
      else if (entity.getType() === this.getType()) {
        return null;
      }
      else {
        return entity.getQueryForEntity(uri, entity);
      }
    }

    getQueryForEntity(uri, entity) {
      if (this.getType() == 'publication') {
        return null;
      }
      else if (this.getType() == 'author') {
        return null;
      }
      else {
        let doc = cts.doc(uri);
        if (doc) {
          let enrichmentQuery = fn.head(cts.doc(uri).xpath("//*:enrichment/*:query"))
          return enrichmentQuery == null ? null : cts.query(enrichmentQuery);
        }
        else {
          return cts.falseQuery();
        }
      }
    }

    /**
    *
    */
    getRelatedEntitiesOfMyTypeUsingQuery(uris, expansionSpec) {
      xdmp.log('getRelatedEntitiesOfMyTypeUsingQuery ' + this.getType() + ' cost called with uris: ' + xdmp.quote(uris));
      let startTime = new Date().getTime();

      if (expansionSpec == null) {
        expansionSpec = this.getDefaultExpansionSpec();
      }

      let resultMap = {};

      // fetch the node info in one batch
      let fetchNodeInfoMapStartTime = new Date().getTime();
      let nodeInfoMap = graphLib.fetchNodeInfoMapWithCache(uris);
      let fetchNodeInfoMapEndTime = new Date().getTime();
      xdmp.log('getRelatedEntitiesOfMyTypeUsingQuery ' + this.getType() + ' graphLib.fetchNodeInfoMap of ' + uris.length + ' uris cost: ' + (fetchNodeInfoMapEndTime - fetchNodeInfoMapStartTime) + 'ms');

      let findRelatedEntitiesStartTime = new Date().getTime();
      let self = this;
      Array.from(uris).forEach(function (uri) {
        let nodeInfo = nodeInfoMap[ uri ];

        // the Entity class for the uri tells us how to find related entities
        let relatedEntityQuery = self.getQueryForRelatedEntity(uri, nodeInfo);

        if (relatedEntityQuery != null) {
          // we want to find entities of "this" type that are related to the 'uri'
          // so we filter the result using our collection and the relatedEntityQuery
          let andQueryList = [
            cts.collectionQuery(self.getCollection()),
            relatedEntityQuery
          ];

          let query = cts.andQuery(andQueryList);

          let resultList = resultMap[ uri ];
          if (resultList == null) {
            resultList = [];
            resultMap[ uri ] = resultList;
          }

          let start = 1;
          let end = null;

          if (expansionSpec.limit && expansionSpec.limit > 0) {
            end = expansionSpec.limit
          }

          let options = [];
          let relatedEntities = null;
          if(end == null) {
            relatedEntities = cts.search(query, options);
          }
          else {
            relatedEntities = fn.subsequence(cts.search(query, options), start, end);
          }

          Array.from(relatedEntities).forEach(function (relatedEntity) {
            resultList.push({
              uri: xdmp.nodeUri(relatedEntity)
            });
          });
        }
      });
      let findRelatedEntitiesEndTime = new Date().getTime();
      xdmp.log('getRelatedEntitiesOfMyTypeUsingQuery ' + this.getType() + ' findRelatedEntities cost: ' + (findRelatedEntitiesEndTime - findRelatedEntitiesStartTime) + 'ms');

      let endTime = new Date().getTime();
      xdmp.log('getRelatedEntitiesOfMyTypeUsingQuery ' + this.getType() + ' cost: ' + (endTime - startTime) + 'ms');

      return resultMap;
    }

    getRelatedEntitiesOfMyTypeUsingTriples(uris, expansionSpec) {
      xdmp.log('getRelatedEntitiesOfMyTypeUsingTriples ' + this.getType() + ' cost called with uris: ' + xdmp.quote(uris));
      let startTime = new Date().getTime();

      if (expansionSpec == null) {
        expansionSpec = this.getDefaultExpansionSpec();
      }

      let resultMap = {};

      // get the entity object for the related node's entity type
      let getAllEntitiesStartTime = new Date().getTime();
      let allEntitiesMap = graphLib.getAllEntitiesMap();
      let getAllEntitiesEndTime = new Date().getTime();
      xdmp.log('getRelatedEntitiesOfMyTypeUsingTriples ' + this.getType() + ' getAllEntitiesMap cost: ' + (getAllEntitiesEndTime - getAllEntitiesStartTime) + 'ms');

      // fetch the node info in one batch
      let fetchNodeInfoMapStartTime = new Date().getTime();
      let nodeInfoMap = graphLib.fetchNodeInfoMapWithCache(uris);
      let fetchNodeInfoMapEndTime = new Date().getTime();
      xdmp.log('getRelatedEntitiesOfMyTypeUsingTriples ' + this.getType() + ' graphLib.fetchNodeInfoMap of ' + uris.length + ' uris cost: ' + (fetchNodeInfoMapEndTime - fetchNodeInfoMapStartTime) + 'ms');

      let findRelatedEntitiesStartTime = new Date().getTime();
      let self = this;
      Array.from(uris).forEach(function (uri) {
        let nodeInfo = nodeInfoMap[ uri ];
        if (nodeInfo) {
          let nodeEntityType = nodeInfo.type;
          let entity = allEntitiesMap[ nodeEntityType ];

          if (entity) {
            // NOTE: maybe we can batch this by entity type?
            let uriList = graphLib.findInGraph([uri], self.getPredicates(), expansionSpec, self.getType());

            let resultList = resultMap[ uri ];
            if (resultList == null) {
              resultList = [];
              resultMap[ uri ] = resultList;
            }

            Array.from(uriList).forEach(function (relatedUri) {
              resultList.push(relatedUri);
            });
          }
        }
      });
      let findRelatedEntitiesEndTime = new Date().getTime();
      xdmp.log('getRelatedEntitiesOfMyTypeUsingTriples ' + this.getType() + ' findRelatedEntities cost: ' + (findRelatedEntitiesEndTime - findRelatedEntitiesStartTime) + 'ms');

      let endTime = new Date().getTime();
      xdmp.log('getRelatedEntitiesOfMyTypeUsingTriples ' + this.getType() + ' cost: ' + (endTime - startTime) + 'ms');

      return resultMap;
    }

    getRelatedEntitiesOfMyType(uris, expansionSpec) {
      return this.getRelatedEntitiesOfMyTypeUsingTriples(uris, expansionSpec);
    }

    getDefaultExpansionSpec() {
      return {
        limit : 15
      };
    }

    /* The collection that the DHF steps will put these entities in.
       Generally the Entity name. */
    getCollection() {
        console.log('getCollection not implemented.');
    }

    /* boolean to indicate if this Entity contains cts.query items
       and should be searched during text enrichment to form links.
       E.g. to have a Publication automatically link to a Protein, the
       Protein will have a serialized cts.query in it including the wordQuery
       disjuncts (in an orQuery) for all nanes of that Protein. This will
       be detected by the core framework using reverseQuery + cts.score checking.
       But that will only be done if isEnrichable() returns true. */
    isEnrichable() {
        console.log('isEnrichable not implemented.');
    }

    /* return a cts.boostQuery that will increase relevance of text and other
       entities based on having this Entity in the current workspace.
       E.g. if a Shipment is in the workspace, the shipment number and even the
       shipment destination city are important, so other documents mentioning those
       should be boosted in search results. This increases relevance of results
       based on what has been added to the current workspace. */
    getBoostQuery(entity, weight) {
        console.log('getBoostQuery not implemented.');
    }

    /* currently un-used. Called from .xqy as well, but consider removing this code.*/
    snippet(result, ctsQuery, options) {
        return fn.head(xdmp.unquote('<snippet xmlns="http://marklogic.com/appservices/search" format="json"></snippet>')).root;
    }

    /* helper function to get Entities from the RDF graph based on predicates, without needing to write SPARQL
       this is typically not overridden in subclasses.
     */
    getRelatedEntitiesWhereSubject(entityURI,predicate){
        var params = {
          "Entity": sem.iri(entityURI),
          "Related": sem.iri("PRH:"+ predicate),
          "PreferredName":  sem.iri("PRH:preferredName"),
          "EntityType": [sem.iri("PRH:entityType"),sem.iri("PRH:conceptType")]
          };
        let result = (sem.sparql("SELECT ?uri ?preferredName ?entityType WHERE { ?Entity ?Related ?uri . ?uri ?PreferredName ?preferredName. ?uri ?EntityType ?entityType  }", params))
        let meters = "";
        if (xdmp.logLevel() == "debug") {
          meters = xdmp.queryMeters();
          logMeterStats("getRelatedEntitiesWhereSubject", entityURI, predicate, meters);
        }
        return result.toArray();
    }

    /* helper function to get Entities from the RDF graph based on predicates, without needing to write SPARQL
       This is typically not overridden in subclasses.
     */
    getRelatedEntitiesWhereObject(entityURI, predicate){
        var params = {
          "Entity": sem.iri(entityURI),
          "Related": sem.iri("PRH:" + predicate),
          "PreferredName":  sem.iri("PRH:preferredName"),
          "EntityType": [sem.iri("PRH:entityType"),sem.iri("PRH:conceptType")]
        };
        let result = (sem.sparql("SELECT ?uri ?preferredName ?entityType WHERE { ?uri ?Related ?Entity . ?uri ?PreferredName ?preferredName. ?uri ?EntityType ?entityType  }", params))
        if (xdmp.logLevel() == "debug") {
          meters = xdmp.queryMeters();
          logMeterStats("getRelatedEntitiesWhereObject", entityURI, predicate, meters);
        }
        return result.toArray();
    }

    /* TODO: remove. This is remaining code from the old Pharma-specific system. */
    getMediatorLinks(entityURI){
        xdmp.log(`Get Mediator Links ${entityURI}`)
        var params = {
          "Entity": sem.iri(entityURI),
          "PreferredName":  sem.iri("PRH:preferredName"),
          "EntityType": [sem.iri("PRH:entityType"),sem.iri("PRH:conceptType")]
        }
        let result = (sem.sparql(`SELECT ?uri ?preferredName ?entityType ?autoExpand WHERE
                                        {
                                        ?Entity  (<PRH:mediationExpressedIn>|<PRH:expressesMediation> ) ?uri .
                                        ?uri ?PreferredName ?preferredName .
                                        ?uri ?EntityType ?entityType
                                        BIND(true as ?autoExpand)
                                        }
                                        `, params))
        if (xdmp.logLevel() == "debug") {
          meters = xdmp.queryMeters();
          logMeterStats("getMediatorLinks", entityURI, "", meters);
        }
        return result.toArray()
    }
}

function getType(entity) {
    let nodeKind = entity.nodeKind;
    let type = 'Unknown';

    if (nodeKind == "object") {
        if (entity.envelope.instance.info) {
            type = entity.envelope.instance.info.title;

            // Work around for mastering merge generating info array
            if (type == null) {
                type = entity.envelope.instance.info[0].title;
            }
        }
        else {
            const keys = Object.keys(entity.envelope.instance);
            if (keys && keys[0]) {
                type = [0];
            }
            else {
                console.log("ERROR entity.sjs : Cannot determine the data type for: ");
                console.log(entity);
            }
        }
    }
    else {
        type = entity.xpath("*:instance/*:info/*:title/text()");
    }

    return (type.toString()).trim().toLowerCase();
}

function createEntity(e) {
    const type = getType(e);
    const Entity = require(`./${type}`);
    return new Entity(e);
}

function createSnippet(result, ctsQuery, options) {
    const entity = createEntity(result.root);
    return entity.snippet(result, ctsQuery, options);
}

module.exports = {
    createEntity: createEntity,
    EntityConfig: EntityConfig,
    snippet: createSnippet
};
