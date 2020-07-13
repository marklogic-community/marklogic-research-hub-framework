const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

const contentPlugin = require('./content.sjs');
const headersPlugin = require('./headers.sjs');
const triplesPlugin = require('./triples.sjs');

function main(content, options) {
  //grab the doc id/uri
  let id = content.uri;
  //here we can grab and manipulate the context metadata attached to the document
  let context = content.context;

  //grab the 'doc' from the content value space
  let doc = content.value;

  // let's just grab the root of the document if its a Document and not a type of Node (ObjectNode or XMLNode)
  if (doc && (doc instanceof Document || doc instanceof XMLDocument)) {
    doc = fn.head(doc.root);
  }

  let instance = contentPlugin.createContent(id, doc, options);

  // before we proceed, get a hash of the document and find if it is existing in the staging database already
  let hash = xdmp.md5(xdmp.quote(instance));

  // ignore this document if its we already have it
  if (publicationExists(hash, options)) {
    xdmp.log('Ignored ' + id);
    return null;
  }

  let headers = headersPlugin.createHeaders(id, instance, options, hash);
  let triples = triplesPlugin.createTriples(id, instance, headers, options);

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

    //form our envelope here now, specifying our output format
  let envelope = fn.head(datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat));

  //assign our envelope value
  content.value = envelope;

  //assign the uri we want, in this case the same
  content.uri = fn.string(id);

  let collections = Array.from(context.collections);
  collections.push('publication-new');
  collections.push('publication-author-new');
  content.context = {
    collections: collections
  };

  return content;
}

function publicationExists(instanceHash, options) {
  let targetDb = xdmp.database(options['targetDatabase']);
  let evalParams = { instanceHash : instanceHash };
  let evalOptions = { "database": targetDb };
  let result = xdmp.eval(
    `
    let query = cts.andQuery([
      cts.collectionQuery('publication'),
      cts.jsonPropertyValueQuery('instanceHash', instanceHash)
    ]);
    let options = [
      "limit=1"
    ];
    cts.uris("", options, query);
    `,
    evalParams, evalOptions
  );

  return fn.count(result) >= 1;
}

module.exports = {
  main: main
};
