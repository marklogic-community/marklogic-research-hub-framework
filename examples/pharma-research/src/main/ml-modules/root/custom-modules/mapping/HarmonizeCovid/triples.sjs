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

function getTriplesForEnrichedEntity(type,xmlNode,filenameIri) {
  var triples = []
  let enrichmentEntiyXml = xmlNode.xpath("/article/*:enrichment/*:meta/*:entities/*:"+type+"s/*:"+type)

  if(fn.exists(enrichmentEntiyXml)){
    enrichmentEntiyXml.toArray().forEach(function(element) {
    triples.push(
      sem.triple(
        filenameIri,
        sem.iri('PRH:isRelated'),
        sem.iri( element.xpath('xs:string(@uri)').toString())
         )
       )

      }
     )
   }
  return triples
}

function createTriples(id, content, headers, options) {
	const doc = cts.doc(id).root.toObject()
  let trimId = id.split('.').slice(0, -1).join('.')
	let filenameIri = sem.iri(trimId + ".xml")

	let triples = [];

	let xml = xdmp.unquote(content.$ref.toString() )

	const nb = new NodeBuilder();
	nb.addNode(xml);
	let xmlNode = nb.toNode();

	//preferredName
	  triples.push(
	    sem.triple(
	      filenameIri,
				sem.iri('PRH:preferredName'),
				doc.envelope.instance.metadata.title
			)
		)
	//enittiy type
	  triples.push(
	    sem.triple(
	      filenameIri,
	      sem.iri('PRH:entityType'),
	      'publication'
			)
		)

	//gets the enriched Entiies triples
	triples = triples.concat(getTriplesForEnrichedEntity('Drug', xmlNode, filenameIri))
	triples = triples.concat(getTriplesForEnrichedEntity('Gene', xmlNode, filenameIri))
	triples = triples.concat(getTriplesForEnrichedEntity('Protein', xmlNode, filenameIri))

	let topics = xmlNode.xpath("//*:topics/*:topic/string()");

	if (fn.exists(topics)) {
	  for (let topic of topics ) {
	     topic = topic.toString()
	     let topicIRI = sem.iri('/topic/'+ camelize(topic) +'.json')

	     triples.push(
	        sem.triple(
	          filenameIri,
	          sem.iri('PRH:isAbout'),
	          topicIRI
	         )
	      )

	    //Needed right now becuase there is no main document for this
	     triples.push(
	        sem.triple(
	          topicIRI,
	          sem.iri(' PRH:preferredName'),
	          topic
	          )
	      )

	   	//also type
	   	triples.push(
	    sem.triple(
	      topicIRI,
	      sem.iri('PRH:entityType'),
	       'topic'
	       )
	     )
	  }
	}

  return triples
}

module.exports = {
  createTriples: createTriples
};

