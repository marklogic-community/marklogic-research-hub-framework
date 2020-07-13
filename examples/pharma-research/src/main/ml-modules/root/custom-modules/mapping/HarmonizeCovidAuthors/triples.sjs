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
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index == 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function createTriples(id, content, headers, options) {
	let triples = [];

	let finalID = content.docId
/*
	//name
	triples.push(
		sem.triple(
	      sem.iri(finalID),
	      sem.iri('PRH:preferredName'),
	       content.personName
	    )
	)

	//type
	triples.push(
		sem.triple(
	      sem.iri(finalID),
	      sem.iri('PRH:entityType'),
	       'author'
	    )
	)

	//publications
	content.publications.forEach(function(publication){
		triples.push(
		 	sem.triple(
		      sem.iri(finalID),
		      sem.iri('PRH:authored'),
		      sem.iri(publication)
		    )
		)
	})
*/
	//affiliations
	content.affiliations.forEach(function(affiliationObjc){
		try {


		if (affiliationObjc.hasOwnProperty('organizationName') && !(affiliationObjc instanceof Sequence) ){
			let institutionIri = sem.iri("/institution/" + camelize( affiliationObjc.organizationName.toString() ) + ".json")
			triples.push(
			 	sem.triple(
			      sem.iri(finalID),
			      sem.iri('PRH:affiliatedWith'),
			      institutionIri
			    )
			)

			//needed becuase they dont have their own document yet
			//name
			triples.push(
			  sem.triple(
			      institutionIri,
			      sem.iri('PRH:preferredName'),
			       affiliationObjc.organizationName
			    )
			)

			//type
			triples.push(
			  sem.triple(
			      institutionIri,
			      sem.iri('PRH:entityType'),
			       "institution"
			    )
			)

			//city
			if (affiliationObjc.organizationCity) {
				triples.push(
					sem.triple(
						institutionIri,
						sem.iri('PRH:inCity'),
						affiliationObjc.organizationCity
					)
				);
			}

			//country
			if (affiliationObjc.organizationCountry) {
				triples.push(
					sem.triple(
						institutionIri,
						sem.iri('PRH:inCountry'),
						affiliationObjc.organizationCountry
					)
				);
			}

			//Institution + Department //needs to be finalized
			if(affiliationObjc.organizationDivision && affiliationObjc.organizationName ){
				triples.push(
					sem.triple(
						institutionIri,
						sem.iri('PRH:hasDepartment'),
						affiliationObjc.organizationDivision + '_' + affiliationObjc.organizationName
					)
				)
			}

		}
		} catch (e){
				xdmp.log("error in triples for "+ finalID)
				xdmp.log(e)
				triples.push(
				 	sem.triple(
				      sem.iri(finalID),
				      sem.iri('PRH:error'),
				      'true'
				    )
				)
		}
	})

	//topic
	content.topics.forEach(function(topic){
		if (topic.hasOwnProperty('topic')){
			let topicIri = sem.iri("/topic/" + camelize( topic.topic.toString() ) + ".json")
			triples.push(
			 	sem.triple(
			      sem.iri(finalID),
			      sem.iri('PRH:wroteAbout'),
			      topicIri
			    )
			)
		}
	})

	return triples
}

module.exports = {
  createTriples: createTriples
};
