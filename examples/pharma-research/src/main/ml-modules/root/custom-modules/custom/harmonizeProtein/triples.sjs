function createTriples(id, content, headers, options) {
  // let trimId = id.split('.').slice(0, -1).join('.')
  // let finalURL = trimId + ".json"

  const triples = [];

  // [GJo] Moved all triples to Protein-triples TDE (with some support data in headers)

  // let targetDb = xdmp.database(options['targetDatabase']);
  // let drugsObjects = content.drug
  // if (drugsObjects) {
  //   drugsObjects.forEach(function(drugsObject) {

  //     let drugName = drugsObject.name;
  //     var params = {
  //       "drugName": drugName
  //     };

  //     let uris = xdmp.eval("cts.uris(null, 'limit=1',(cts.andQuery([ cts.collectionQuery('Drug'),cts.orQuery([ cts.jsonPropertyValueQuery('genericMedicineName',drugName,['case-insensitive', 'diacritic-insensitive', 'stemmed', 'punctuation-insensitive', 'whitespace-insensitive']), cts.jsonPropertyValueQuery('activeSubstanceName',drugName,['case-insensitive', 'diacritic-insensitive', 'stemmed', 'punctuation-insensitive', 'whitespace-insensitive'])]) ])))", params, {
  //       "database": targetDb
  //     })

  //     if (fn.exists(uris)) {

  //       triples.push(
  //         sem.triple(
  //           sem.iri(fn.head(uris)),
  //           sem.iri('PRH:targets'),
  //           sem.iri(finalURL)
  //         )
  //       )
  //     }
  //   });
  // }

  // let geneObject = content.gene
  // if (geneObject && geneObject.geneID) {

  //   let geneID = geneObject.geneID;
  //   var params = {
  //     "geneID": geneID
  //   };

  //   let uris = xdmp.eval("cts.uris(null, 'limit=1',(cts.andQuery([ cts.collectionQuery('Gene'),cts.orQuery([ cts.jsonPropertyValueQuery('geneID',geneID,['case-insensitive', 'diacritic-insensitive', 'punctuation-insensitive', 'whitespace-insensitive'])]) ])))", params, {
  //     "database": targetDb
  //   })

  //   if (fn.exists(uris)) {
  //     triples.push(
  //       sem.triple(
  //         sem.iri(fn.head(uris)),
  //         sem.iri('PRH:isRelated'),
  //         sem.iri(finalURL)
  //       )
  //     );

  //     triples.push(
  //       sem.triple(
  //         sem.iri(finalURL),
  //         sem.iri('PRH:isRelated'),
  //         sem.iri(fn.head(uris))
  //       )
  //     )

  //   }

  //   if (geneObject && geneObject.primaryName) {

  //     let primaryName = geneObject.primaryName;
  //     var params = {
  //       "symbol": primaryName
  //     };

  //     let uris = xdmp.eval(`cts.uris(null, 'limit=1',(cts.andQuery([
  //       cts.collectionQuery('Gene'),cts.orQuery([
  //         cts.jsonPropertyValueQuery('symbol',symbol,['case-insensitive', 'diacritic-insensitive', 'punctuation-insensitive', 'whitespace-insensitive']),
  //         cts.jsonPropertyValueQuery('alternativeSymbols',symbol,['case-insensitive', 'diacritic-insensitive', 'punctuation-insensitive', 'whitespace-insensitive'])
  //       ]) ])))`, params, {
  //       "database": targetDb
  //     })

  //     if (fn.exists(uris)) {
  //       triples.push(
  //         sem.triple(
  //           sem.iri(fn.head(uris)),
  //           sem.iri('PRH:isRelated'),
  //           sem.iri(finalURL)
  //         )
  //       );

  //       triples.push(
  //         sem.triple(
  //           sem.iri(finalURL),
  //           sem.iri('PRH:isRelated'),
  //           sem.iri(fn.head(uris))
  //         )
  //       )
  //     }
  //   }
  // }

  // triples.push(
  //   sem.triple(
  //     sem.iri(finalURL),
  //     sem.iri('PRH:preferredName'),
  //     content.fullName
  //   )
  // )

  // triples.push(
  //   sem.triple(
  //     sem.iri(finalURL),
  //     sem.iri('PRH:entityType'),
  //     'protein'
  //   )
  // )

  // if (content.mediatesExpressionOf !== undefined && content.mediatesExpressionOf.length > 0) {
  //   for (const mediatesExpressionOfObj of content.mediatesExpressionOf) {
  //     const prot1 = mediatesExpressionOfObj.expression
  //     const mediationIri = sem.iri(`${trimId}_mediated_${prot1}`)
  //     triples.push(
  //       sem.triple(
  //         sem.iri(finalURL),
  //         sem.iri('PRH:expressesMediation'),
  //         mediationIri
  //       )
  //     )
  //     triples.push(
  //       sem.triple(
  //         mediationIri,
  //         sem.iri('PRH:preferredName'),
  //         `${content.fullName} mediates expression of 6-phosphogluconolactonase`
  //       )
  //     )
  //     triples.push(
  //       sem.triple(
  //         mediationIri,
  //         sem.iri('PRH:entityType'),
  //         'mediator'
  //       )
  //     )
  //     triples.push(
  //       sem.triple(
  //         sem.iri(prot1),
  //         sem.iri('PRH:mediationExpressedIn'),
  //         mediationIri
  //       )
  //     )
  //   }
  // }

  /*
       "similarProtein": [
                    {
                        "family": "helicase",
                        "subfamily": "AddB/RexB type 1",
                        "subsubfamily": null
                    }
                ],
  */

  // if (content.similarProtein !== undefined && content.similarProtein.length > 0) {
  //   for (const similarProtein of content.similarProtein) {
  //     if (similarProtein.family != null && similarProtein.family != "") {
  //       const familyName = similarProtein.family.toString()
  //       const familyIri = sem.iri(familyName)
  //       triples.push(
  //         sem.triple(
  //           sem.iri(finalURL),
  //           sem.iri('PRH:belongsToFamily'),
  //           familyIri
  //         )
  //       )
  //       triples.push(
  //         sem.triple(
  //           familyIri,
  //           sem.iri('PRH:preferredName'),
  //           familyName
  //         )
  //       )
  //       triples.push(
  //         sem.triple(
  //           familyIri,
  //           sem.iri('PRH:entityType'),
  //           sem.iri("proteinFamily")
  //         )
  //       )
  //     }
  //     if (similarProtein.subfamily != null && similarProtein.subfamily != "") {
  //       const subFamilyName = similarProtein.subfamily.toString()
  //       const subFamilyIri = sem.iri(subFamilyName)
  //       triples.push(
  //         sem.triple(
  //           sem.iri(finalURL),
  //           sem.iri('PRH:belongsToSubFamily'),
  //           subFamilyIri
  //         )
  //       )
  //       triples.push(
  //         sem.triple(
  //           subFamilyIri,
  //           sem.iri('PRH:preferredName'),
  //           subFamilyName
  //         )
  //       )
  //       triples.push(
  //         sem.triple(
  //           subFamilyIri,
  //           sem.iri('PRH:entityType'),
  //           sem.iri("proteinFamily")
  //         )
  //       )
  //     }
  //     if (similarProtein.subsubfamily != null && similarProtein.subfamily != "") {
  //       const subSubFamilyName = similarProtein.subsubfamily.toString()
  //       const subSubFamilyIri = sem.iri(subSubFamilyName)
  //       triples.push(
  //         sem.triple(
  //           sem.iri(finalURL),
  //           sem.iri('PRH:belongsToSubSubFamily'),
  //           subSubFamilyIri
  //         )
  //       )
  //       triples.push(
  //         sem.triple(
  //           subSubFamilyIri,
  //           sem.iri('PRH:preferredName'),
  //           subSubFamilyName
  //         )
  //       )
  //       triples.push(
  //         sem.triple(
  //           subSubFamilyIri,
  //           sem.iri('PRH:entityType'),
  //           sem.iri("proteinFamily")
  //         )
  //       )
  //     }
  //   }
  // }

  return triples

}

module.exports = {
  createTriples: createTriples
};
