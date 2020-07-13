'use strict';

function getPublicationPreferredName(publicationDoc) {
  return fn.stringJoin(fn.head(publicationDoc.xpath("/*:envelope/*:attachments/*:article/*:front/*:article-meta/*:title-group/*:article-title/string()")), " ");
}

function getPublicationCitation(publicationDoc) {
  let doc = publicationDoc
  let citationSeq = doc.xpath("//*:element-citation")
  let NumberOfCitation = fn.count(citationSeq)
  const citation = new NodeBuilder();
  citation.startElement("citations");
  if (fn.exists(NumberOfCitation)) { citation.addElement('NumberOfCitations', xs.string(NumberOfCitation)) };
  for (let citationElement of citationSeq) {

    citation.startElement("citation")
    let pudMedCentralKey = fn.head(citationElement).xpath("*:pub-id[@pub-id-type='pmc']/string()");
    let pudMedId = fn.head(citationElement).xpath("*:pub-id[@pub-id-type='pmid']/string()");
    let articleTitle = fn.stringJoin(fn.head(citationElement).xpath("*:article-title/string()"), " : ");
    if (fn.exists(pudMedCentralKey)) { citation.addElement('pudMedCentralKey', pudMedCentralKey) };
    if (fn.exists(pudMedId)) { citation.addElement('pudMedId', pudMedId) };
    if (fn.exists(articleTitle)) { citation.addElement('articleTitle', articleTitle) };
    citation.endElement();
  }
  citation.endElement();

  return citation.toNode()
}

/*
 * getCoAuthors function
 *
 * @param id - the identifier of Pubmed publication
 *
 * @return - Arrary of CoAthours
 */
function getCoAuthors(id) {
  var doc = cts.doc(id);
  var root = doc.root;
  let authors = doc.xpath("//*:contrib[@contrib-type=('author')]")
  let coAuthorArray = []
  if (fn.exists(authors)) {
    for (var author of authors) {

      let personSurName = fn.head(author).xpath("*:name/*:surname/string()");
      let personGivenName = fn.head(author).xpath("*:name/*:given-names/string()");
      let authorName = getAuthorName(personGivenName, personSurName)
      coAuthorArray.push(authorName)
    }
    return coAuthorArray
  }
  else { return coAuthorArray }
};

function getCoAuthorsXML(id) {
  var doc = cts.doc(id);
  var root = doc.root;
  let authors = doc.xpath("//*:contrib[@contrib-type=('author')]")
  let coAuthorArray = []
  if (fn.exists(authors)) {
    let authorName = doc.xpath("//*:contrib[@contrib-type=('author')]/node()");
    return authorName
  }
  else { return coAuthorArray }
};

/*
 * @param doc - the pubMed XML
 * @param  authorAffiliationsReferences - the author reference ID
 *
 * @return  Array of The AffiliationNames for the author reference ID
*/
function getCoAuthorsAffiliationsName(authorAffiliationsReferences, doc) {
  let affiliations = [];

  //check to see if this document publications has reference id mapping it to the affiliation else assume all the authors are from the same affiliations on the documents
  if (fn.exists(authorAffiliationsReferences)) {
    //for each affiliation reference key  create the affiliation sections
    let affiliationsXMLs = fn.head(doc).xpath(`//*:aff[@id = ("${authorAffiliationsReferences.join('","')}")]`)
    for (let authorAffiliationReference of authorAffiliationsReferences) {
      let attrID = fn.string(authorAffiliationReference);
      for (let affiliationsXML of affiliationsXMLs) {
        let authorAffId = fn.head(affiliationsXML.xpath('@id/string()'))
        let organizationName;

        //check if the aff id = to the author aff reference
        if (authorAffId === attrID) {
          organizationName = affiliationsXML.xpath('./string-join(text(), "")!normalize-space(.)')
          const institution = fn.stringJoin(affiliationsXML.xpath("//*:aff[@id=('" + attrID + "')]//*:institution/string()"));
          if (institution) {
            organizationName = institution
          }

          affiliations.push(organizationName);
        }
      }
    }
  }
  return affiliations;
};

/*
 * @param doc - the pubMed XML
 * @param  authorAffiliationsReferences - the author reference ID
 *
 * @return  Array of The AffiliationNames for the author reference ID
*/
function getCoAuthorsAffiliationsArray(authorAffiliationsReferences, doc) {
  const json = require('/MarkLogic/json/json.xqy');
  let config = json.config('custom');
  config.whitespace = 'ignore';

  let affiliations = [];
  var authorAffiliationReference;

  //check to see if this document publications has reference id mapping it to the affiliation else assume all the authors are from the same affiliations on the documents
  if (fn.exists(authorAffiliationsReferences)) {

    //for each affiliation reference key  create the affiliation sections
    for (authorAffiliationReference of authorAffiliationsReferences) {

      let attrID = fn.string(authorAffiliationReference);
      let affiliationsXMLs = fn.head(doc).xpath("//*:aff")

      for (var affiliationsXML of affiliationsXMLs) {

        let authorAffiliationReferenceJson = (json.transformToJson(fn.head(affiliationsXML), config)).toObject();
        let authorAffId = authorAffiliationReferenceJson.aff.id
        let organizationName, organizationAddress, organizationCity, organizationDivision, organizationCountry, iftest;

        //check if the aff id = to the author aff reference
        if (authorAffId === attrID) {
          organizationName = authorAffiliationReferenceJson.aff._value;
          let institutionWrap = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:institution-wrap");
          //check if the institution has a wrapper
          if (fn.exists(institutionWrap)) {
            organizationName = fn.stringJoin(fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:institution-wrap/*:institution/string()"));
          }
          // check if there institution element
          else if (fn.exists(organizationName)) {
            organizationName = authorAffiliationReferenceJson.aff._value;
          }
          else {
            organizationName = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:institution/string()");
          }

          organizationDivision = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:named-content[@content-type='organisation-division']/string()");
          organizationCity = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:named-content[@content-type='city']/string()");

          organizationAddress = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:addr-line/string()");
          organizationCountry = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:country/string()");

          organizationDivision = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:named-content[@content-type='organisation-division']/string()");
          organizationCity = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:named-content[@content-type='city']/string()");

          organizationAddress = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:addr-line/string()");
          organizationCountry = fn.head(doc).xpath("//*:aff[@id=('" + attrID + "')]/*:country/string()");

          let OrganizationAssociation = {
            "organizationName": organizationName,
            "organizationCity": organizationCity,
            "organizationDivision": organizationDivision,
            "organizationAddress": organizationAddress,
            "organizationCountry": organizationCountry,
          }

          affiliations.push(OrganizationAssociation);
        }
      }
    }
  }
  return affiliations;
};

/*
 * getAuthorsXML2 function
 *
 * @param id - the identifier of Pubmed publication
 *
 * @return - XML nodes of the authors for the pubMed publication
 */
function getAuthorsXML2(id) {
  var doc = (cts.doc(id)).root;

  let authors = doc.xpath("//*:contrib[@contrib-type=('author')]")

  const authorsNB = new NodeBuilder();
  authorsNB.startElement('authors');

  if (fn.exists(authors)) {
    for (var author of authors) {
      if(fn.empty(fn.head(author).xpath(".//contrib-group"))) {
        let PersonSurName = fn.head(author).xpath("*:name/*:surname/string()");
        let PersonGivenName = fn.head(author).xpath("*:name/*:given-names/string()");
        let authorAffiliationsReferences = fn.head(author).xpath("(*:xref[@ref-type=('aff')]/@rid)");
        let authorInstitutions = getCoAuthorsAffiliationsName(authorAffiliationsReferences.toObject(), doc);

        // ignore author entries that doesn't have a surname and given name
        if (fn.empty(PersonSurName) && fn.empty(PersonGivenName)) {
          continue;
        }

        let preferredName = getAuthorName(PersonGivenName, PersonSurName)
        preferredName = preferredName;
        authorsNB.startElement('author');
        authorsNB.addElement('preferredName', preferredName);
        authorsNB.startElement('institutions');

        if (fn.exists(authorInstitutions)) {
          for (let authorInstitution of authorInstitutions) {
            try {
              authorsNB.addElement('institution', fn.stringJoin(authorInstitution, " "));
            } catch (e) {
              xdmp.log("authorInstitutions erorr with id:" + id, "error")
              xdmp.log(e, "error")
            }
          }
        } else {
          let authorInstitutions = doc.xpath("(//*:aff/string())");
          for (let authorInstitution of authorInstitutions) {
            authorsNB.addElement('institution', fn.stringJoin(authorInstitution, " "));
          }
        }
        authorsNB.endElement()
        authorsNB.endElement();
      }
    }
  }

  authorsNB.endElement();
  return authorsNB.toNode();
};

function getAuthorName(personGivenName, personSurName) {
  return fn.head(personGivenName) + " " + fn.head(personSurName)
}

function getAbstractXML(doc)
{
  const abstractNB = new NodeBuilder();
  abstractNB.startElement('abstracts');

  for (let abstract of doc.xpath('//*:abstract'))
  {
    const childNames = abstract.xpath('distinct-values(*/local-name())').toArray();
    if (childNames.length === 1 && childNames[0] === 'sec')
    {
      for (let section of abstract.xpath('sec'))
      {
        abstractNB
          .startElement('abstract')
          .addElement('abstractTitle', section.xpath('*:title/string()'))
          .addElement('abstractMessage', fn.stringJoin(section.xpath('*:p/string()'), ' '))
          .endElement();
      }
    }
    else
    {
      abstractNB
        .startElement('abstract')
        .addElement('abstractTitle', abstract.xpath('if (exists(*:title)) then *:title else if (@abstract-type) then translate(@abstract-type,"-"," ") else "Main"'))
        .addElement('abstractMessage', fn.stringJoin(abstract.xpath('*:p/string()'), ' '))
        .endElement();
    }
  }
  abstractNB.endElement();
  return abstractNB.toNode();
};

function getTopicsXML(keywordsArray) {
  const topicsNB = new NodeBuilder();
  topicsNB.startElement('topics');
  for (let keyword of keywordsArray) {
    topicsNB.addElement('topic', keyword);
  }
  topicsNB.endElement();
  return topicsNB.toNode();
}

module.exports = {
  getCoAuthorsAffiliationsName,
  getCoAuthorsXML,
  getCoAuthors,
  getAuthorsXML2,
  getCoAuthorsAffiliationsArray,
  getAuthorName,
  getAbstractXML,
  getTopicsXML,
  getPublicationPreferredName,
  getPublicationCitation
};
