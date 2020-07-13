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
	const triplib = require('/lib/triple-utils');	
    var doc = cts.doc(id);
    var root = doc.root;
    var uris = root.envelope.instance.Author.xpath('docId');
    var pubs = root.envelope.instance.Author.xpath('publications');
    // co-authorship strength
    var coAuthTriples = triplib.getCoAuthorTriples(Array.from(pubs),id);
    // re-subjected + merged.
    var authTriples = triplib.getAuthorTriples(uris, id);
    // Add preferredName as we filtered it out above
    let prefName = headers.commonFacets.authorPreferredName.toString();
    let triples = coAuthTriples.concat(sem.triple(sem.iri(id),sem.iri("PRH:preferredName"),prefName));

  	return triples.concat(authTriples);
}

module.exports = {
  createTriples: createTriples
};

