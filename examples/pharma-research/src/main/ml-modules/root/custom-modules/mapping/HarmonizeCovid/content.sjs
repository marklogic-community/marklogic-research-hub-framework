'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, options) {

  var doc = (cts.doc(id)).root;
  return extractInstancePublication(id, doc, options);
};

function extractInstancePublication(id, doc, options) {

    const pub = require("/lib/pubMedHelper.sjs");
    const ee = require("/lib/enrichment/entity-enrichment.xqy");


    // let x = new NodeBuilder();
    // x.startDocument();
    // x.addNode(fn.head(doc.xpath("//*:attachments/node()")));
    // x.endDocument();
    // let attachments = x.toNode();
    let articleTitle = doc.envelope.instance.metadata.title;
    let citations = pub.getPublicationCitation(doc)
    let abstracts = pub.getAbstractXML(doc)
    let keywordsSeq = doc.xpath("//*:kwd-group/*:kwd/string()")
    let pudMedId = doc.xpath("//*:article-id[@pub-id-type='pmid']/string()");
    let pudMedCentralKey = doc.xpath("//*:article-id[@pub-id-type='pmc']/string()");

    let journalTitle = fn.stringJoin(fn.head(doc).xpath("//*:journal-title/string()"));
    let epudDate = doc.xpath("//*:pub-date[@pub-type='epub']") ? fn.head(doc).xpath("//*:pub-date[@pub-type='epub']") : null;
    let volume = fn.stringJoin(fn.head(doc).xpath("//*:article/front/article-meta/volume/string()"), " ");
    let coAuthors = pub.getAuthorsXML2(id);

    let targetDb = xdmp.database(options['targetDatabase']);
    xdmp.log("Target Database[" + targetDb + "]", "debug");
    let enrichmentOptions = {
      "showRelevance": false,
      "threshold": .3,
      "targetDb": targetDb
    }

    let enrichment = ee.enrich(id, enrichmentOptions)

    const articleNB = new NodeBuilder();
    articleNB.startElement('article');
    articleNB.addElement('articleTitle', fn.head(articleTitle));
    fn.exists(pudMedId)? articleNB.addElement('pudMedId', pudMedId) : " " ;
    fn.exists(pudMedCentralKey)? articleNB.addElement('pudMedCentralKey', pudMedCentralKey) : " " ;
    articleNB.addNode(coAuthors);
    articleNB.startElement('journal');
    articleNB.addElement('title', journalTitle);
    articleNB.addElement('volume', volume);
    fn.exists(epudDate)? articleNB.addNode(epudDate) : " " ;
    articleNB.endElement();
    articleNB.addNode(abstracts);


    const bodies = doc.envelope.instance.body_text.toObject();
    if (bodies.length > 0) {
      articleNB.startElement("bodies");
      bodies.forEach(b => {
        articleNB.addElement('body', b.text);
      })
      articleNB.endElement();
    }

    if(fn.exists(keywordsSeq)){articleNB.addNode(pub.getTopicsXML(keywordsSeq));}
    fn.exists(citations)? articleNB.addNode(citations) : " " ;
    articleNB.addNode(enrichment);

    articleNB.endElement();

    let headers = {};
    let triples = {};
    let instance = (articleNB.toNode()).xpath(".");

  // return the instance object
  return {
    '$ref' : instance,
    '$attachments': null,
    '$type': 'publication',
    '$version': '0.0.1'
  }
};


function makeReferenceObject(type, ref) {
  return {
    '$type': type,
    '$ref': ref
  };
}

module.exports = {
  createContent: createContent
};
