const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

const contentPlugin = require('./content.sjs');
const headersPlugin = require('./headers.sjs');
const triplesPlugin = require('./triples.sjs');

function main(contentDesc, options) {

  let id = contentDesc.uri;

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

  //Get the content extracted from the instances
  let content = contentPlugin.createContent(id, options);

  let headers = headersPlugin.createHeaders(id, content, options);

  let triples = triplesPlugin.createTriples(id, content, headers, options);

  //form our envelope here now, specifying our output format
  let envelope = datahub.flow.flowUtils.makeEnvelope(content, headers, triples, outputFormat);

  //assign our envelope value
  contentDesc.value = envelope;
  // Modify uri to be written
  let trimId = id.split('.').slice(0, -1).join('.')
  let  filename = trimId + ".xml"

  //assign the uri we want, which is modified 
  contentDesc.uri = filename;

  //assign the context we want
  //We are not assigning any context here

  // remove the document from the publication-new collection
  markPublicationProcessed(id, options);

  //now let's return out our content to be written
  return contentDesc;
}

function markPublicationProcessed(uri, options) {
  let targetDb = xdmp.database(options['sourceDatabase']);
  let evalParams = { uri : uri };
  let evalOptions = { "database": targetDb };
  let result = xdmp.eval(
    `
    declareUpdate();
    xdmp.documentRemoveCollections(uri, 'publication-new');
    `,
    evalParams, evalOptions
  );

  return fn.count(result) >= 1;
}

module.exports = {
  main: main
};
