/*
 * Create Triples Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param headers  - the output of your heaaders plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an array of triples
 */

 function createTriples(id, content, headers, options) {
  // [GJo] Redundant
  // let trimId = id.split('.').slice(0, -1).join('.')
  // let finalURL = trimId + ".json"

  const triples = [];

  // [GJo] Replaced by Study-triples TDE
  //
  // triples.push(
  // 	sem.triple(
  //     sem.iri(finalURL),
  //     sem.iri('PRH:preferredName'),
  //       content.nctId
  //   )
  // )
  //
  // triples.push(
  //   sem.triple(
  //     sem.iri(finalURL),
  //     sem.iri('PRH:entityType'),
  //     'study'
  //   )
  // )

  return triples
}

module.exports = {
  createTriples: createTriples
};

