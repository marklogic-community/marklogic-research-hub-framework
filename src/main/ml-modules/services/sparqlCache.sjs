/**
* This services is called periodically to prevent the sparql plan from expiring.
* See ui/middle-tier/node-app.js > keepCacheHot()
*/
function get(context, params) {
  const graphSparql = require("/lib/graph-sparql.sjs");

  let options = {
  };

  let uris = [
      "/PubMed/PMID-4947825.xml",
      "/author/6/PubMed/PMID-2556796.json",
      "/drug/20151210_2687330c-50dc-0339-e054-00144ff88e88.json",
      "/gene/162963.json",
      "/Protein/uniprot_sprot.xml-0-529683.json",
      "/drugStudyData//pubMedData/full/allStudyData/AllPublicXML.zip/NCT0053xxxx/NCT00532753.json",
      "/workspace/15284cad-ea61-4518-bf86-e575e7879f63.json",
      "/topic/cancer.json",
      "/activeIngredient/rIBOFLAVIN.json"
  ];
  let startTime = new Date().getTime();
  graphSparql.buildGraph(uris, options);
  let endTime = new Date().getTime();
  let cost = (endTime - startTime);
  xdmp.log('cost services/sparqlCache.sjs: ' + cost + 'ms');

  return {
    cost: cost
  }
}

exports.GET = get;
