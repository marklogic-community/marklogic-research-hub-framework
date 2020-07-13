/*
 * Create Headers Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an object of headers
 */
const pubLib = require("/lib/publication.sjs");
const pub = require("/lib/pubMedHelper.sjs");
const headerUtil = require("/lib/header-utils.sjs");

function createHeaders(id, content, options) {

    let lastDate; 
	const currentDateTime = fn.currentDateTime();
	const elapsedTime = xdmp.elapsedTime();
	const stageDocID = cts.doc(id);
	const HarmonizedTimestamp = currentDateTime.add(elapsedTime);

	var doc = cts.doc(id).root.xpath('/*:envelope/*:attachments/node()');
	let epudDate = fn.head(doc).xpath("//*:pub-date[@pub-type='epub']") ? fn.head(doc).xpath("//*:pub-date[@pub-type='epub']") : null;
	let lastModifiedDate= fn.string(pubLib.getLastModifiedDatePMC(epudDate))

	return {
		// sources is the mandatory field for mastering
		"sources": [{"name": "pubmed"}],
		"lastestTimeStamp": HarmonizedTimestamp,
		"version": "1.0",
		"createdBy": xdmp.getCurrentUser(),
		"stageDocID": id,
		'commonFacets': {
  			'authorPreferredName': content.personName,
  			'systemDateTimeCreated': HarmonizedTimestamp,
  			'lastModifiedDate': xs.date(new Date(lastModifiedDate)),
  			'institutionPreferredName': headerUtil.getInstitutions(content.affiliations),
  			'topicPreferredName' : (fn.head(doc).xpath("//*:kwd-group/*:kwd/string()")).toArray()
  		}
  	}
};

module.exports = {
  createHeaders: createHeaders
};
