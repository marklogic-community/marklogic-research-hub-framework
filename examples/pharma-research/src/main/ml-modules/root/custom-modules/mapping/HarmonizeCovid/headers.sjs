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

  const publication = require("/lib/publication.sjs");
  const doc = cts.doc(id).root.toObject()
  let contentInstance = content.$ref
  let authorsName = doc.envelope.instance.metadata.authors.map(a => `${a.first} ${a.last}`);//fn.head(contentInstance).xpath("//*:authors/*:author/*:preferredName/node()");
  let institutions = doc.envelope.instance.metadata.authors.map(a => (a.affiliation && a.affiliation.institution) || null).filter(a => a !== null);
  let journal = fn.head(contentInstance).xpath("//*:journal/*:title/string()");
  let topics = fn.head(contentInstance).xpath("//*:topics/*:topic/string()");

  const nb = new NodeBuilder();
  nb.startElement('commonFacets');
  nb.addNode(publication.getSystemTime());
  if(fn.exists(journal)) {
    nb.addElement("journalPreferredName", journal)
  };
  nb.startElement('topics');
  if (fn.exists(topics)) {
    for (let topic of topics ) {
      nb.startElement('topicPreferredName');
      nb.addText(topic);
      nb.endElement();
    }
  }
  nb.endElement();
  //  if(fn.exists(lastModifiedDate)){nb.addNode(lastModifiedDate)};
  nb.startElement("authors");
  for (let authorName of authorsName ) {
    nb.startElement('authorPreferredName');
    nb.addText(authorName);
    nb.endElement();
  }
  nb.endElement();
  nb.startElement("institutions");
  institutions.forEach(institution => {
    nb.startElement('institutionPreferredName');
    nb.addText(institution);
    nb.endElement();
  });
  nb.endElement();
  nb.endElement();
  return nb.toNode();
}

module.exports = {
  createHeaders: createHeaders
};
