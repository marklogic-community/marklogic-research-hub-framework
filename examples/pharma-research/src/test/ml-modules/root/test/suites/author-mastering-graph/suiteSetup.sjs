const test = require("/test/test-helper.xqy");

const database = xdmp.database("data-hub-FINAL-TEST");

console.log('suite setup');
test.loadTestFile("Author.entity.json", database, '/entities/Author.entity.json',[],['http://marklogic.com/entity-services/models']);
test.loadTestFile("Study.entity.json", database, '/entities/Study.entity.json',[],['http://marklogic.com/entity-services/models']);
test.loadTestFile("ActiveIngredient.entity.json", database, '/entities/ActiveIngredient.entity.json',[],['http://marklogic.com/entity-services/models']);
test.loadTestFile("Protein.entity.json", database, '/entities/Protein.entity.json',[],['http://marklogic.com/entity-services/models']);
test.loadTestFile("Gene.entity.json", database, '/entities/Gene.entity.json',[],['http://marklogic.com/entity-services/models']);
test.loadTestFile("publication.entity.json", database, '/entities/publication.entity.json',[],['http://marklogic.com/entity-services/models']);
test.loadTestFile("Substance.entity.json", database, '/entities/Substance.entity.json',[],['http://marklogic.com/entity-services/models']);
test.loadTestFile("drug.entity.json", database, '/entities/drug.entity.json',[],['http://marklogic.com/entity-services/models']);

test.loadTestFile("mastered.json", database, '/com.marklogic.smart-mastering/merged/4570777bc64fed0ace9a3a5cc43154c6.json',[],["authorProcessed", "authorContent", "Author", "mdm-merged", "mdm-content", "authorMerged"]);
test.loadTestFile("PMID-5383544.json", database, '/author/2/PubMed/PMID-5383544.json',[],["authorProcessed", "authorContent", "Author", "mdm-archived"]);
test.loadTestFile("PMID-6262605.json", database, '/author/2/PubMed/PMID-6262605.json',[],["authorProcessed", "authorContent", "Author", "mdm-archived"]);
test.loadTestFile("PMID-6306753.json", database, '/author/2/PubMed/PMID-6306753.json',[],["authorProcessed", "authorContent", "Author", "mdm-archived"]);
test.loadTestFile("PMID-7080097.json", database, '/author/2/PubMed/PMID-7080097.json',[],["authorProcessed", "authorContent", "Author", "mdm-archived"]);

test.loadTestFile("PMID-5383544.xml", database, '/PubMed/PMID-5383544.xml',[],["publication", "Publication"]);
test.loadTestFile("PMID-6262605.xml", database, '/PubMed/PMID-6262605.xml',[],["publication", "Publication"]);
test.loadTestFile("PMID-6306753.xml", database, '/PubMed/PMID-6306753.xml',[],["publication", "Publication"]);
test.loadTestFile("PMID-7080097.xml", database, '/PubMed/PMID-7080097.xml',[],["publication", "Publication"]);

// Make sure wwe're actually running in the test db
let assertions = [];
assertions.push(
  test.assertEqual(xdmp.database(), database)
)
assertions
