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

  return extractInstanceGene(source);
}
  
/**
* Creates an object instance from some source document.
* @param source  A document or node that contains
*   data for populating a Gene
* @return An object with extracted data and
*   metadata about the instance.
*/
function extractInstanceGene(source) {
  // the original source documents
  //  let attachments = source;

  // now check to see if we have XML or json, then create a node clone from the root of the instance
  if (source instanceof Element || source instanceof ObjectNode) {
      let instancePath = '/*:envelope/*:attachments';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath += '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }

    let geneID = !fn.empty(fn.head(source.xpath('/GeneID'))) ? xs.string(fn.head(fn.head(source.xpath('/GeneID')))) : null;
    let symbol = !fn.empty(fn.head(source.xpath('/Symbol'))) ? xs.string(fn.head(fn.head(source.xpath('/Symbol')))) : null;
    let synonyms = source.xpath('/Synonyms/string()').toString();
    let description = !fn.empty(fn.head(source.xpath('/Full_name_from_nomenclature_authority'))) ? xs.string(fn.head(fn.head(source.xpath('/Full_name_from_nomenclature_authority')))) : null;
    if(!description || description == '-') {
      description = !fn.empty(fn.head(source.xpath('/description'))) ? xs.string(fn.head(fn.head(source.xpath('/description')))) : null;
    }
    let dbXrefs = source.xpath('/dbXrefs/string()').toString();
    
    let otherDesignations = source.xpath('/Other_designations/string()').toString();
    let taxID = !fn.empty(fn.head(source.xpath('/__tax_id'))) ? xs.string(fn.head(fn.head(source.xpath('/__tax_id')))) : null;
    let chromosome = !fn.empty(fn.head(source.xpath('/chromosome'))) ? xs.string(fn.head(fn.head(source.xpath('/chromosome')))) : null;
    let mapLocation = !fn.empty(fn.head(source.xpath('/map_location'))) ? xs.string(fn.head(fn.head(source.xpath('/map_location')))) : null;
    let typeOfGene = !fn.empty(fn.head(source.xpath('/type_of_gene'))) ? xs.string(fn.head(fn.head(source.xpath('/type_of_gene')))) : null;

    // for Synonyms
    if(synonyms != "-"){
    synonyms = synonyms.split("|")
    } else {
      synonyms = [];
    }
   
    var arr;
    // for alternateIDs
    if (dbXrefs != "-"){
     arr = (dbXrefs + "").split("|")
    }else {
      arr = [];
    }
    
    var alternateIDs = [];
    arr.forEach(function(element) {
      let parts = element.split(":")
      let id;
        if (parts.length == 3) {
          id = parts[2];
        } else {
          id = parts[1];
        }
      let source = parts[0];
      let obj = {
       source: source,
       id: id
      }
      alternateIDs.push(obj)
  });
  
  // for alternateFullNames
  if (otherDesignations != "-"){
    otherDesignations = otherDesignations.split("|");
  }else{
    otherDesignations = [];
  }
    
    
  
  // for mimNumber
  let geneSources = cts.search(cts.andQuery([
  cts.elementValueQuery(xs.QName("GeneID"), geneID,"exact"),
  cts.collectionQuery("GeneID")
  ])).toArray();
  
  let mimNumber = [];
  let medGen = [];

  geneSources.forEach(function(geneSource){  
    let mim = geneSource.root.xpath('/*:envelope/*:attachments/*:root/*:__MIM_number/text()').toString();
  
    mimNumber.push(mim);
    
    let obj = {
       mimNumber: mim,
       medGenCUI: geneSource.root.xpath('/*:envelope/*:attachments/*:root/*:MedGenCUI/text()').toString()
    }
    medGen.push(obj)
  });
    
  // for diseases
  let diseases = [];
  medGen.forEach(function(object){
      let diseaseSource = fn.head(cts.search(cts.andQuery([
      cts.elementValueQuery(xs.QName("__CUI"), object.medGenCUI,"exact"),
      cts.collectionQuery("DiseaseName")
      ])));
        if(diseaseSource){
        diseases.push({
        diseaseID: object.medGenCUI,
        diseaseName: diseaseSource.xpath('/*:envelope/*:attachments/*:root/*:name/text()'),
        mimNumber: object.mimNumber
          })
         }
        }
      );
  //otherDesignations = fn.distinctValues(otherDesignations).toArray();
  let terms = [];
  //terms = terms.concat(otherDesignations);
  terms.push(description);
  terms = fn.distinctValues(terms).toArray()
  
  let enrichment = {};
  enrichment.preferredName = description;
  enrichment.query = 
    cts.wordQuery( 
      terms, ["case-insensitive", "diacritic-insensitive", "stemmed", "punctuation-insensitive", "whitespace-insensitive"]
    ).toObject()

  // return the instance object
  return {
    'geneID': geneID,
    'mimNumber': mimNumber,
    'symbol': symbol,
    'alternativeSymbols': synonyms,
    'fullName': description,
    'alternateIDs': alternateIDs,
    'alternateFullNames': otherDesignations,
    'taxonomyID': taxID,
    'chromosome': chromosome,
    'mapLocation': mapLocation,
    'geneType': typeOfGene,
    'diseases': diseases,
    'hasDiseases': (diseases.length > 0),
    'enrichment': enrichment,
    '$type': 'Gene',
    '$version': '0.0.1',
    '$attachments': null
  }
};

module.exports = {
  createContent: createContent
};
