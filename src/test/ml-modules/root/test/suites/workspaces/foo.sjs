const test = require('/test/test-helper.xqy');
const workspacelib = require("/marklogic.rest.resource/workspaceDetails/assets/resource.sjs");

declareUpdate();

const getWorkspaceParams = {"id": "workspaces-test"};
const addEntitiesParams = {"action": "entity", "id": "workspaces-test"};
const deleteEntitiesParams = {"action": "deleteEntity", "id": "workspaces-test"};
const entityUris = ["/foo/1/PubMed/PMID-9999991.json","/foo/1/PubMed/PMID-9999992.json","/foo/1/PubMed/PMID-9999993.json"];
const entities = {
    "entities":[
        {"predicate":"isExpert", "value":"Definite", "entity":entityUris[0]},
        {"predicate":"isExpert", "value":"Definite", "entity":entityUris[1]},
        {"predicate":"isExpert", "value":"Definite", "entity":entityUris[2]}
    ]
};
const input = xdmp.toJSON(entities);

const getWorkspace = () => {return [workspacelib.GET({}, getWorkspaceParams)]}; // Empty param is the context input which is required by a REST signature, but not used by the service
const insertDocuments = () => {return [workspacelib.PUT({}, addEntitiesParams, input)]}; // Empty param is the context input which is required by a REST signature, but not used by the service
const deleteDocuments = () => {return [workspacelib.PUT({}, deleteEntitiesParams, input)]}; // Empty param is the context input which is required by a REST signature, but not used by the service

const checkEmptyPreInsert = fn.head(xdmp.invokeFunction(getWorkspace))[0];
const insertionResult = fn.head(xdmp.invokeFunction(insertDocuments))[0];
const checkFullPostInsert = fn.head(xdmp.invokeFunction(getWorkspace))[0];
const deletionResult = fn.head(xdmp.invokeFunction(deleteDocuments))[0];
const checkEmptyPostDelete = fn.head(xdmp.invokeFunction(getWorkspace))[0];

let assertions = [];
assertions.push(
  test.assertEqual(1, 1),                                                   // SANITY CHECK
  test.assertExists(insertionResult.success),                               // CHECK INSERT RESULT COMES BACK AS SUCCESS
  test.assertExists(deletionResult.success),                                // CHECK DELETE RESULT COMES BACK AS SUCCESS
  test.assertEqual(0, Object.keys(checkEmptyPreInsert.entities).length),  // CHECK STARTING ENTITIES LIST IS EMPTY
  test.assertEqual(3, Object.keys(checkFullPostInsert.entities).length),  // CHECK FINAL ENTITIES LIST HAS 3 ENTRIES
  test.assertEqual(0, Object.keys(checkEmptyPostDelete.entities).length), // CHECK FINAL ENTITIES LIST IS EMPTY POST DELETE
  test.assertEqual(entityUris, Object.keys(checkFullPostInsert.entities))   // CHECK INSERTED DOCUMENTS MATCH EXPECTED
);
assertions;
