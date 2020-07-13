/*
 * Document enrichment functions
 */
const entity = require('/MarkLogic/entity');
const dict = require('/lib/dictionary-utils');

function dictionaryEnrichment(doc, vocabularies) {
  /*
    Enrich the document with the dictionaries provided.
  */
  var conversionMap = dict.conversionMapsJson();
  let dictionaries = vocabularies.map(function (d) {
    return cts.entityDictionaryGet(dict.dictionaryName(d));
  });
  return entity.enrich(doc, dictionaries, ["full"], conversionMap);
}


function enrichContent(doc, options) {
  /*
    Stub for enrichment - currently only dictionaries - RxNorm and SNOMED
    Note: enabling SNOMED requires more memory than available on small development environment (EdO)
    
    if the vocabularies are not set through the options we default to RxNorm and SNOMED
  */

  let vocabularies;
  if (options.hasOwnProperty("vocabularies")) {
    vocabularies = options.vocabularies
  } else {
    vocabularies =
      [
        "vocabulary-RxNorm"  ,
        "vocabulary-SNOMED"
      ];
  }
  
  
  return dictionaryEnrichment(doc, vocabularies);
}

module.exports = {
  enrichContent: enrichContent
};