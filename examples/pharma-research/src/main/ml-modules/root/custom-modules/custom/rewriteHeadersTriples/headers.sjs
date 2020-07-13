/*
 * Create Headers Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an object of headers
 */
function createHeaders(id, content, options) {
  
	const currentDateTime = fn.currentDateTime();
	const elapsedTime = xdmp.elapsedTime();
	const HarmonizedTimestamp = currentDateTime.add(elapsedTime);

	const triplib = require('/lib/triple-utils');
	const headerUtil = require("/lib/header-utils.sjs");	
    var doc = cts.doc(id);
    var root = doc.root;


	// Add preferredName - but from Instance not header - as we're re-writing commonFacets - as we filtered it out above
	var prefName = fn.subsequence(root.envelope.instance.xpath('personName'),1,1);
	// Rewite headers with current INFO
	var topics = root.envelope.instance.xpath('//topics/topic').toArray()
	// We use first affiliation to get org name 
	var affiliations = root.envelope.instance.affiliations;
	var institutionPreferredName;
	if (affiliations == null) {
		xdmp.log("No affiliations [" + id + "]", "debug");
		institutionPreferredName = [];
	} else {
		institutionPreferredName = headerUtil.getInstitutions(affiliations.toObject());
	}
	var lastModifiedDate =  root.envelope.headers.xpath('//lastModifiedDate');    

	return {
		"lastestTimeStamp": HarmonizedTimestamp,
		"version": "1.0",
		"createdBy": xdmp.getCurrentUser(),
		'commonFacets': {
		 	'authorPreferredName': prefName,
		  	'systemDateTimeCreated': HarmonizedTimestamp,
		  	'lastModifiedDate': xs.date(new Date(lastModifiedDate)),
		  	'institutionPreferredName': institutionPreferredName,
		  	'topicPreferredName' : topics
		}
	}
}

module.exports = {
  createHeaders: createHeaders
};
