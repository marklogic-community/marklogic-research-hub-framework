/**
* Creates an string of the persons name using the source document.
* @param source  A document or node that contains
*   data for populating a CoAuthorAssociation
* @return a string with of the personName
* example source:
<Author xmlns="">
  <ValidYN>Y</ValidYN>
  <LastName>Shi</LastName>
  <ForeName>Yongli</ForeName>
  <Initials>Y</Initials>
  <AffiliationInfo>
    <Affiliation>College of pharmacy, Xinxiang Medical University, 453003, Xinxiang, PR China. Electronic address: shiyongli2005@163.com.</Affiliation>
  </AffiliationInfo>
</Author>
*/
function extractPersonName(source){
  
  var path;
 
  if (source.localName == "Author") {
    path = ""
  } else {
    path = "/"
  }
  
  // make author name 
  let PersonGivenName = source.xpath(path + "LastName/text()")
  let PersonMiddleName = source.xpath(path + 'Initials/text()')
  let PersonSurName =  source.xpath(path +  "ForeName/text()")
  
  let personName = PersonGivenName + ' ' + PersonSurName;
  
  return personName;
  
}

/*
  @param source expects a PubmedArticle xml element
  @return a squance of Author elements
*/
function extractAuthors(source) {
  
  return source.xpath("/PubmedArticle/MedlineCitation/Article/AuthorList/Author", {"es":"http://marklogic.com/entity-services"})
};

module.exports = {
  extractPersonName: extractPersonName,
    extractAuthors: extractAuthors
};