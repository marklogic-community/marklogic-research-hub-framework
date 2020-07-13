'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, options) {
  let doc = cts.doc(id);

  let source;

  // for xml we need to use xpath
  if(doc && xdmp.nodeKind(doc) === 'element' && doc instanceof XMLDocument) {
    source = doc
  }
  // for json we need to return the instance
  else if(doc && doc instanceof Document) {
    source = fn.head(doc.root);
  }
  // for everything else
  else {
    source = doc;
  }

  return extractInstanceTarget(source, options);
}

/**
* Creates an object instance from some source document.
* @param source  A document or node that contains
*   data for populating a Target
* @return An object with extracted data and
*   metadata about the instance.
*/
function extractInstanceTarget(source, options) {
  // the original source documents
  let attachments = source;
  // now check to see if we have XML or json, then create a node clone from the root of the instance
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/*:envelope/*:instance';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath += '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }

  let fullName = !fn.empty(fn.head(source.xpath('/*:protein/*:recommendedName/*:fullName/string()'))) ? xs.string(fn.head(source.xpath('/*:protein/*:recommendedName/*:fullName/string()'))) : null;
  let geneID = !fn.empty(fn.head(source.xpath('/*:dbReference[@type="GeneID"]/@id'))) ? xs.string(fn.head(source.xpath('/*:dbReference[@type="GeneID"]/@id'))) : null;
  let geneNameP = !fn.empty(source.xpath('/*:gene/*:name[@type="primary"]/text()')) ? source.xpath('/*:gene/*:name[@type="primary"]/text()') : null;
  let geneNameOL = !fn.empty(source.xpath('/*:gene/*:name[@type="ordered locus"]/text()')) ? source.xpath('/*:gene/*:name[@type="ordered locus"]/text()') : null;
  let geneNameORF = !fn.empty(source.xpath('/*:gene/*:name[@type="ORF"]/text()')) ? source.xpath('/*:gene/*:name[@type="ORF"]/text()') : null;
  let sequence = !fn.empty(fn.head(source.xpath('//sequence'))) ? xs.string(fn.head(fn.head(source.xpath('//sequence')))) : null;


  // For Demo Purposes
  let mediatesExpressionOf = []
  if(geneNameP == "ADRB3"){
    let targetDb = xdmp.database(options['targetDatabase']);
    let evalParams = null;
    let evalOptions = { "database": targetDb };
    let adbr3ProteinUri = fn.head(xdmp.eval(`
      let query = cts.andQuery([
        cts.collectionQuery('Protein'),
        cts.jsonPropertyValueQuery('fullName', '6-phosphogluconolactonase')
      ]);
      cts.uris(null, null, query);
      `, evalParams, evalOptions));

    if (adbr3ProteinUri != null) {
      let mediatesExpressionOfObj = {
        type: "mediatesExpressionOf",
        expression: adbr3ProteinUri
      }
      mediatesExpressionOf.push(mediatesExpressionOfObj);
    }
  }
  //For gene
  let gene = {
    geneID: geneID,
    primaryName: geneNameP,
    orderedLocusName: geneNameOL,
    ORFName: geneNameORF
  }

  //For drug
  var drug = [];
  let mimId = !fn.empty(source.xpath('/*:dbReference[@type="DrugBank"]/@id').toArray()) ? source.xpath('/*:dbReference[@type="DrugBank"]/@id').toArray() : null;
  let name = !fn.empty(source.xpath('/*:dbReference[@type="DrugBank"]/*:property[@type="generic name"]').toArray()) ? source.xpath('/*:dbReference[@type="DrugBank"]/*:property/@value').toArray() : null;

  if(mimId !== null && name !== null){
  for(var i=0; i < mimId.length; i++){
    drug.push({mimId: mimId[i],name: name[i]})
    }
  }

  //For similarProtein
  var similarProtein = [];
  var simcomments = source.xpath('/*:comment[@type="similarity"]/*:text/text()').toArray();

  simcomments.forEach(function(simcomment) {

  let fam = fn.analyzeString(simcomment, "Belongs to the (.*) family\.").xpath('/*:match/*:group/text()');
  let subfam = fn.analyzeString(simcomment, "family. (.*) subfamily\..*").xpath('/*:match/*:group/text()');
  let subsubfam = fn.analyzeString(simcomment, "subfamily. (.*) sub-subfamily\..*").xpath('/*:match/*:group/text()');

  similarProtein.push({family: fam, subfamily: subfam, subsubfamily: subsubfam})

    }
  )

  //For externalReferences
  var externalReferences = [];

  let UINPROT = !fn.empty(source.xpath('/*:accession/text()').toArray()) ? source.xpath('/*:accession/text()').toArray() : null;
  UINPROT.forEach(function(id){
    externalReferences.push({UINPROT: id});
  })

  let refName = source.xpath('/*:dbReference[not(@type=("GeneID", "DrugBank"))]/@type').toArray();
  let refID = source.xpath('/*:dbReference[not(@type=("GeneID", "DrugBank"))]/@id').toArray();

  if(refName !== null && refID !== null){
  for(var i=0; i < refName.length; i++){
    externalReferences.push({refName: refName[i],refID: refID[i]})
    }
  }

  let terms = fullName;
  let enrichment = {};
  enrichment.preferredName = fullName;
  enrichment.query =
  cts.wordQuery(
    terms, ["case-insensitive", "diacritic-insensitive", "stemmed", "punctuation-insensitive", "whitespace-insensitive"]
  ).toObject();


  // return the instance object
  return {
    'fullName': fullName,
    'gene': gene,
    'drug': drug,
    'sequence': sequence,
    'similarProtein': similarProtein,
    'mediatesExpressionOf' : mediatesExpressionOf,
    'externalReferences': externalReferences,
    'enrichment': enrichment,
    '$attachments': null,
    '$type': 'Protein',
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

