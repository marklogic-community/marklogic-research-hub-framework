'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, rawContent, options) {
 
/*  
try { xdmp.invoke('/lib/loadInstanceAuthor.sjs',{id: id, doc:rawContent}) }
catch (err) {
      xdmp.log("loadInstanceAuthor ERR"+err.message, "error");
      xdmp.log("loadInstanceAuthor ERR"+err.stack);
    }
*/

let source;

  // for xml we need to use xpath
if(rawContent && xdmp.nodeKind(rawContent) === 'element' && rawContent instanceof XMLDocument) {
    source = rawContent
  }
  // for json we need to return the instance
else if(rawContent && rawContent instanceof Document) {
    source = fn.head(rawContent.root);
  }
  // for everything else
else {
    source = rawContent;
  }

  return extractInstancePublication(source);
}
  
/**
* Creates an object instance from some source document.
* @param source  A document or node that contains
*   data for populating a publication
* @return An object with extracted data and
*   metadata about the instance.
*/
function extractInstancePublication(source) {
  // return the instance object
  return {
    '$attachments': source,
    '$type': 'gene',
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

