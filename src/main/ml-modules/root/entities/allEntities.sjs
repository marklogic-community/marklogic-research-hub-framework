'use strict';

const entityNames = fn.collection('http://marklogic.com/entity-services/models')
  .toObject()
  .map(e => e.toObject().info.title.toLowerCase())
  .concat('workspace')

// create a map of empty instances, one for each entity type. Uses convention where .js module path is based on entity name.
const allEntities = entityNames.map(name => {
  const entityFile = `/entities/${name}`;
  try {
    const Entity = require(entityFile);
    return new Entity(null);
  }
  catch(e) {
    xdmp.log('Cannot create an entity object of type: ' + entityFile + ". Likely no subclass of EntityConfig defined", 'info');
  }
}).filter(e => e != null);

function getPredicates() {
  let predicates = allEntities.map(e => e.getPredicates())
  predicates = [].concat(...predicates);
  return predicates.filter((item, index) => predicates.indexOf(item) === index);
}

function getCollections() {
  return allEntities.map(e => e.getCollection());
}

function enrichableCollections() {
  return allEntities.filter(e => e.isEnrichable())
    .map(e => e.getCollection());
}

function getBoostQuery(entity, weight) {
  try {
    const EntityClass = require(`/entities/${entity.type}`);
    const entityInst = new EntityClass(null);
    return entityInst.getBoostQuery(entity, weight);
  }
  catch(e) {
    console.error(e.toString())
  }
  return Sequence.from([]);
}

module.exports = {
  allEntities: allEntities,
  getPredicates: getPredicates,
  getCollections: getCollections,
  enrichableCollections: enrichableCollections,
  getBoostQuery: getBoostQuery
};

