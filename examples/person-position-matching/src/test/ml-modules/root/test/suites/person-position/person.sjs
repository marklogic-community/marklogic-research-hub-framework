const test = require('/test/test-helper.xqy');
const lib = require('lib/test-help.sjs');
const workspacelib = require("/marklogic.rest.resource/workspaceDetails/assets/resource.sjs");

declareUpdate();

const getWorkspaceParams = {"id": "test"};
const addEntitiesParams = {"action": "entity", "id": "test"};
const deleteEntitiesParams = {"action": "deleteEntity", "id": "test"};
const entityUris = [lib.URIS.employee1, lib.URIS.employee2];
const entities = {
    "entities":[
        {"predicate":"isExpert", "value":"Definite", "entity":entityUris[0]},
        {"predicate":"isExpert", "value":"Definite", "entity":entityUris[1]},
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
  test.assertEqual(2, Object.keys(checkFullPostInsert.entities).length),  // CHECK FINAL ENTITIES LIST HAS 2 ENTRIES
  test.assertEqual(0, Object.keys(checkEmptyPostDelete.entities).length), // CHECK FINAL ENTITIES LIST IS EMPTY POST DELETE
  test.assertEqual(entityUris, Object.keys(checkFullPostInsert.entities))   // CHECK INSERTED DOCUMENTS MATCH EXPECTED
);
assertions
