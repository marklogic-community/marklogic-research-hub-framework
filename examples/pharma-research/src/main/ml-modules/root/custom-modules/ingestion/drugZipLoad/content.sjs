'use strict'
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, rawContent, options) {
  let source;
  let zipFileDetail = xdmp.zipManifest(rawContent)

  let zipIndex, zipManifestObject,filePath, zipContent;
  let drugImageUris = [];

  // set the finalDbName from the datahub config
  options.finalDbName = datahub.config.FINALDATABASE;

  zipIndex = 0;

  zipFileDetail.forEach(function(zipManifestObject) {

    filePath = zipManifestObject.path
    var ext = filePath.substr(filePath.lastIndexOf('.') + 1);
    if(ext.toLowerCase() === "xml") {
      zipContent =  xdmp.zipGet(rawContent, filePath).toArray()[0].root
    } else{
      try {
        drugImageUris.push(
          xdmp.invoke(
            '/lib/insertDrugImage.sjs',
            {
              zipIndex: zipIndex,
              id: id,
              zipFileDetail: zipFileDetail,
              rawContent: rawContent
            },
            {
              "database" : xdmp.database(options.finalDbName)
            }
          )
        )
     } catch (err) {
        xdmp.log("insertDrugImage ERR"+err.message, "error");
        xdmp.log("insertDrugImage ERR"+err.stack);
      }
    }
    zipIndex++;
  });

  let doc = fn.head(zipContent);
  source = new NodeBuilder();

  let siblings = doc.xpath("/*/child::*");
  let rootName = fn.string(doc.xpath("/*/node-name()"));
  let rootNamespace = fn.string(doc.xpath("/*/namespace-uri()"));

  // Add drug image URIs to input XML file
  source.startElement(rootName, rootNamespace);
    source.startElement('zipImageURLs');
    for (let drugImageUri of drugImageUris) {
      source.startElement('zipImageURL');
      source.addText(fn.string(drugImageUri));
      source.endElement();
    }
    source.endElement();
    for (let sib of siblings) {
      source.addNode(sib);
    }
  source.endElement();
  return source.toNode();

}

module.exports = {
  createContent: createContent
};

