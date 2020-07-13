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

// [GJo] Redundant
// const studyHelper = require('/lib/studyHelper.xqy');

// function camelize(str) {
//   return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
//     return index == 0 ? word.toLowerCase() : word.toUpperCase();
//   }).replace(/\s+/g, '');
// }

function createTriples(id, content, headers, options) {

  //let finalURL = fn.concat((fn.substringBefore(fn.head(id), ".")), "." , "json")
  const triples = [];

  // // [GJo] Replaced by Drug-triples TDE
  //
 	// triples.push(
	// 	sem.triple(
	//       sem.iri(finalURL),
	//       sem.iri('PRH:preferredName'),
	//       content.drugName
	//     )
	// )
  //
	// triples.push(
	// 	sem.triple(
	//       sem.iri(finalURL),
	//       sem.iri('PRH:entityType'),
	//       'drug'
	//     )
	// )

  // [GJo] Moved activeIngredients to header to facilitate TDE
  //
  // let activeIngredients =  headers.commonFacets.activeSubstanceNames
  // //Where activite ingredient is compounded we currently on used the first active ingredient eg( "Diatrizoate Meglumine\\\", \\\"Diatrizoate Sodium\\\") )
  //
	// activeIngredients.forEach(function(activeIngredient){
	// 	activeIngredient = activeIngredient.toString()
	// 	var activeIngredientIRI = sem.iri("/activeIngredient/"+camelize(activeIngredient)+".json")
  //
	// 	triples.push(
	// 		sem.triple(
	// 			sem.iri(finalURL),
	// 			sem.iri("PRH:hasActiveIngredient"),
	// 			activeIngredientIRI
	// 		)
	// 	);
  //
	// 	//needed because they dont have their own documents
	// 	triples.push(
	// 		sem.triple(
	// 			activeIngredientIRI,
	// 			sem.iri("PRH:entityType"),
	// 			"activeIngredient"
	// 		)
	// 	);
  //
	// 	triples.push(
	// 		sem.triple(
	// 			activeIngredientIRI,
	// 			sem.iri("PRH:preferredName"),
	// 			activeIngredient
	// 		)
	// 	);
	// })
  //

  // [GJo] Moved study uris to header to facilitate TDE
  //
  // let studies = studyHelper.getStudies(content.drugName);
	// fn.head(studies).forEach(study => {
	// 	triples.push(
	// 		sem.triple(
	// 			sem.iri(finalURL),
	// 			sem.iri("PRH:isRelated"),
	// 			sem.iri(study.uri)
	// 		)
	// 	);

    // [GJo] Replaced by Study-triples TDE
    //
		// triples.push(
		// 	sem.triple(
		// 		sem.iri(study.uri),
		// 		sem.iri("PRH:entityType"),
		// 		"study"
		// 	)
		// );
    //
		// triples.push(
		// 	sem.triple(
		// 		sem.iri(study.uri),
		// 		sem.iri("PRH:preferredName"),
		// 		study.nctId
		// 	)
		// );

  //});

  return triples
}

module.exports = {
  createTriples: createTriples
};

