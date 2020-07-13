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

  let targetDb = xdmp.database(options['targetDatabase']);

  let relatedDrugs = [];
  let relatedGenes = [];

  let drugs = content.drug || [];
  if (drugs.length > 0) {
    var params = {
      "drugName": drugs.map(drug => {
        return drug.name;
      })
    };

    relatedDrugs = xdmp.eval("cts.uris(null, 'limit=1',(cts.andQuery([ cts.collectionQuery('Drug'),cts.orQuery([ cts.jsonPropertyValueQuery('genericMedicineName',drugName,['case-insensitive', 'diacritic-insensitive', 'stemmed', 'punctuation-insensitive', 'whitespace-insensitive']), cts.jsonPropertyValueQuery('activeSubstanceName',drugName,['case-insensitive', 'diacritic-insensitive', 'stemmed', 'punctuation-insensitive', 'whitespace-insensitive'])]) ])))", params, {
      "database": targetDb
    }).toArray();
  }

  let geneObject = content.gene
  if (geneObject && geneObject.geneID) {

    var params = {
      "geneID": geneObject.geneID
    };

    relatedGenes = xdmp.eval("cts.uris(null, 'limit=1',(cts.andQuery([ cts.collectionQuery('Gene'),cts.orQuery([ cts.jsonPropertyValueQuery('geneID',geneID,['case-insensitive', 'diacritic-insensitive', 'punctuation-insensitive', 'whitespace-insensitive'])]) ])))", params, {
      "database": targetDb
    }).toArray();

  }

  if (geneObject && geneObject.primaryName) {

    let primaryName = geneObject.primaryName;
    var params = {
      "symbol": primaryName
    };

    let uris = xdmp.eval(`cts.uris(null, 'limit=1',(cts.andQuery([
      cts.collectionQuery('Gene'),cts.orQuery([
        cts.jsonPropertyValueQuery('symbol',symbol,['case-insensitive', 'diacritic-insensitive', 'punctuation-insensitive', 'whitespace-insensitive']),
        cts.jsonPropertyValueQuery('alternativeSymbols',symbol,['case-insensitive', 'diacritic-insensitive', 'punctuation-insensitive', 'whitespace-insensitive'])
      ]) ])))`, params, {
      "database": targetDb
    }).toArray();

    relatedGenes = relatedGenes.concat(uris);
  }

  return {
    commonFacets: {
      systemDateTimeCreated: fn.currentDateTime()
    },
    relatedDrugs,
    relatedGenes
  };

}

module.exports = {
  createHeaders: createHeaders
};
