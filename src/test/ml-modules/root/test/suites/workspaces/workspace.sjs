const test = require('/test/test-helper.xqy');
const workspacelib = require("/marklogic.rest.resource/workspaceDetails/assets/resource.sjs");

declareUpdate();

const getWorkspaceParams = {"id": "workspaces-test"};
const addEntitiesParams = {"action": "entity", "id": "workspaces-test"};
const deleteEntitiesParams = {"action": "deleteEntity", "id": "workspaces-test"};
const changeWorkspaceNameParams = {"action": "name", "id": "workspaces-test"};
const changeWorkspaceDescParams = {"action": "description", "id": "workspaces-test"};

const entityUris = ["/workspace/secworkspace.json"];
const entities = {
    "entities":[
        {"predicate":"isRelevant", "value":"Definite", "entity":entityUris[0]}
    ]
};
const updateWorkspaceEntityInput = xdmp.toJSON(entities);

const updateWorkspaceDetail = {"name": "NewTestWorkspace", "description": "New description"};
const updateWorkspaceDetailInput = xdmp.toJSON(updateWorkspaceDetail);

const getWorkspace = () => {return [workspacelib.GET({}, getWorkspaceParams)]}; // Empty param is the context input which is required by a REST signature, but not used by the service
const addWorkspaceEntity = () => {return [workspacelib.PUT({}, addEntitiesParams, updateWorkspaceEntityInput)]}; // Empty param is the context input which is required by a REST signature, but not used by the service
const deleteWorkspaceEntity = () => {return [workspacelib.PUT({}, deleteEntitiesParams, updateWorkspaceEntityInput)]}; // Empty param is the context input which is required by a REST signature, but not used by the service
const changeWorkspaceName = () => {return [workspacelib.PUT({}, changeWorkspaceNameParams, updateWorkspaceDetailInput)]}; // Empty param is the context input which is required by a REST signature, but not used by the service
const changeWorkspaceDesc = () => {return [workspacelib.PUT({}, changeWorkspaceDescParams, updateWorkspaceDetailInput)]}; // Empty param is the context input which is required by a REST signature, but not used by the service

// test insert and delete entity within workspace
const checkPreAddEntity = fn.head(xdmp.invokeFunction(getWorkspace))[0];
const addWorkspaceEntityResult = fn.head(xdmp.invokeFunction(addWorkspaceEntity))[0];
const checkPostAddEntity = fn.head(xdmp.invokeFunction(getWorkspace))[0];
const deleteWorkspaceEntityResult = fn.head(xdmp.invokeFunction(deleteWorkspaceEntity))[0];
const checkPostDeleteEntity = fn.head(xdmp.invokeFunction(getWorkspace))[0];

// test update workspace name
const checkNamePreChange = fn.head(xdmp.invokeFunction(getWorkspace))[0].toObject();
const nameChangeResult = fn.head(xdmp.invokeFunction(changeWorkspaceName))[0];
const checkNamePostChange = fn.head(xdmp.invokeFunction(getWorkspace))[0].toObject();

// test update workspace description
const checkDescPreChange = fn.head(xdmp.invokeFunction(getWorkspace))[0].toObject();
const descChangeResult = fn.head(xdmp.invokeFunction(changeWorkspaceDesc))[0];
const checkDescPostChange = fn.head(xdmp.invokeFunction(getWorkspace))[0].toObject();

let assertions = [];
assertions.push(
    test.assertEqual(1, 1),                                                   // SANITY CHECK

    // check workspace entity insert/update
    test.assertTrue(Object.keys(checkPreAddEntity.entities).length === 0),  // CHECK STARTING ENTITIES LIST IS EMPTY
    test.assertExists(addWorkspaceEntityResult.success),                               // CHECK INSERT RESULT COMES BACK AS SUCCESS
    test.assertTrue(Object.keys(checkPostAddEntity.entities).length === 1),  // CHECK FINAL ENTITIES LIST HAS 1 ENTRY
    test.assertExists(deleteWorkspaceEntityResult.success),                                // CHECK DELETE RESULT COMES BACK AS SUCCESS
    test.assertTrue(Object.keys(checkPostDeleteEntity.entities).length === 0), // CHECK FINAL ENTITIES LIST IS EMPTY POST DELETE
    test.assertEqual(entityUris, Object.keys(checkPostAddEntity.entities)),   // CHECK INSERTED DOCUMENTS MATCH EXPECTED

    // check workspace name change
    test.assertEqual("TestWorkspace", checkNamePreChange.name),          // CHECK STARTING NAME IS TESTWORKSPACE
    test.assertExists(nameChangeResult.success),                         // CHECK NAME CHANGE RESULT COMES BACK AS SUCCESS
    test.assertEqual("NewTestWorkspace", checkNamePostChange.name),      // CHECK CHANGED NAME IS NEWTESTWORKSPACE

    // check workspace description change
    test.assertEqual("Description", checkDescPreChange.description),    // CHECK STARTING DESCRIPTION IS DESCRIPTION
    test.assertExists(descChangeResult.success),                         // CHECK DESCRIPTION CHANGE RESULT COMES BACK AS SUCCESS
    test.assertEqual("New description", checkDescPostChange.description) // CHECK CHANGED DESCRIPTION IS NEW DESCRIPTION
);
assertions;