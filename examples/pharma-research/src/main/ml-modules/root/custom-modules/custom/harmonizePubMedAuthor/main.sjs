const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

const contentPlugin = require('./content.sjs');
const headersPlugin = require('./headers.sjs');
const triplesPlugin = require('./triples.sjs');

function main(contentDesc, options) {
  let id = contentDesc.uri;
  
  xdmp.log("Entering main [" + id + "]", "debug");
  xdmp.log('Harmonizing: ' + id);

  //let's set our output format, so we know what we're exporting
  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  //here we check to make sure we're not trying to push out a binary or text document, just xml or json
  if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {
    datahub.debug.log({
      message: 'The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.',
      type: 'error'
    });
    throw Error('The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.');
  } 

  let authorDocs =  buildAuthorDocuments(id, options, outputFormat);

  // remove the document from the publication-author-new collection
  markPublicationProcessed(id, options);

  return authorDocs;
};

function buildAuthorDocuments(id, options, outputFormat) {
  var contentDescArray = [];
  var content = contentPlugin.createContent(id, options);
  content.forEach(function(author) {
    var headers = headersPlugin.createHeaders(id, author, options);
    var triples = triplesPlugin.createTriples(id, author, headers, options);
    var envelope = datahub.flow.flowUtils.makeEnvelope(author, headers, triples, outputFormat);
    let key = author.docId
    var tempContent = {};
    // Build documents based on uri and value for writing
    tempContent.uri = key;
    tempContent.value = envelope;
    contentDescArray.push(tempContent); 
    xdmp.log("Author URI [" + tempContent.uri + "]", "debug");   
  });  
  return contentDescArray;
};

function markPublicationProcessed(uri, options) {
  let targetDb = xdmp.database(options['sourceDatabase']);
  let evalParams = { uri : uri };
  let evalOptions = { "database": targetDb };
  let result = xdmp.eval(
    `
    declareUpdate();
    xdmp.documentRemoveCollections(uri, 'publication-author-new');
    `,
    evalParams, evalOptions
  );

  return fn.count(result) >= 1;
}

module.exports = {
  main: main
};
