declareUpdate()

const dhf = require('/data-hub/4/dhf.sjs');
const authors = require("/lib/authors.sjs");
const publication = require("/lib/publication.sjs");

let instancePath = '/';
let source = doc

const PIMD = source.xpath("/PubmedArticle/MedlineCitation/PMID/text()", {"es":"http://marklogic.com/entity-services"})

let authorlist = authors.extractAuthors(source);
let loadDate = fn.currentDateTime();
let authorIndex = 0;
for (var author of authorlist) {
  authorIndex++;

  let elapsedTime = xdmp.elapsedTime();
  let currentDateTime = loadDate.add(elapsedTime);

  var headers = {
    loadDate: currentDateTime,
    'commonFacets': {
       'systemDateTimeCreated': currentDateTime,
    }
  };

  let authorDocURI = fn.concat("/ncbiPubMed/Author/", PIMD , "/" , authorIndex, ".xml")

  var triples = [
    sem.triple(sem.iri(authorDocURI), "Authored", sem.iri(id))
  ];

    const json = require('/MarkLogic/json/json.xqy');
    let config = json.config('custom');

    config.whitespace = 'ignore';

    let source = json.transformToJson(author, config);

    let content = source;

  var envelope = dhf.makeEnvelope(content, headers, triples, 'xml');
  xdmp.documentInsert(
         authorDocURI, envelope,
         {
          permissions : xdmp.defaultPermissions(),
          collections : ["Author","Person", "Pubmed", "nbciPubMEd"]})

}
