/*
 * Create Headers Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an object of headers
 */
const publication = require("/lib/publication.sjs");

function createHeaders(id, content, options, hash) {
  const nb = new NodeBuilder();

        nb.startElement('commonFacets');

  nb.addNode(publication.getSystemTime());

  nb.startElement('instanceHash');
  nb.addText(hash);
  nb.endElement();

        nb.endElement();

        return nb.toNode();
}


module.exports = {
  createHeaders: createHeaders
};

