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
  //let finalURL = "/gene/" + content.geneID + ".json"
  const triples = [];

  // [GJo] Moved to Gene-triples TDE

 	// triples.push(
	// 	sem.triple(
	//       sem.iri(finalURL),
	//       sem.iri('PRH:preferredName'),
	//        content.fullName
	//     )
	// )
  //
	// triples.push(
	// 	sem.triple(
	//       sem.iri(finalURL),
	//       sem.iri('PRH:entityType'),
	//        'gene'
	//     )
	// )
  //
	// content.diseases.forEach(function(diseaseObjc){
  //   	let diseaseIri = sem.iri("/disease/"+ diseaseObjc.diseaseID +".json")
  //   	triples.push(
	// 	sem.triple(
	//       sem.iri(finalURL),
	//       sem.iri('PRH:impacts'),
	//       diseaseIri
	//     ))
  //
  //       //is needed because they dont have their own document
  //       triples.push(
	//         sem.triple(
	//           diseaseIri,
	//           sem.iri('PRH:entityType'),
	//            'disease'
	// 	      )
	//     )
	//     triples.push(
  //       sem.triple(
  //         diseaseIri,
  //         sem.iri('PRH:preferredName'),
  //          diseaseObjc.diseaseName
	//       )
  //      	)

  // 	})

	return triples
}

module.exports = {
  createTriples: createTriples
};

