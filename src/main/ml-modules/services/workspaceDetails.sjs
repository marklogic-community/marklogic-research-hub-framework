/* CRUD interface for adding, removing and accessing contents of (existing) Workspaces */

const user = require("/lib/user.sjs");
const error = require("/lib/error.sjs");

function get(context, params) {
  if (params.hasOwnProperty("id")) {
    let id = decodeURIComponent(params.id);

    let currentUser = user.getCurrentUser();

    let query =
      cts.andQuery([
        cts.collectionQuery("workspace"),
        cts.collectionQuery(currentUser.uri),
        cts.jsonPropertyValueQuery("id", id)
      ]);

    let workspace =
      fn.subsequence(
        cts.search(query, ["unfiltered"]),
        1,
        2
      ).toArray();

    if (workspace[1] != null) {
      return error.getError("workspaceDetails", "dubplateID");
    } else {
      workspace = workspace[0];
    }

    if (workspace != null) {
      var workspaceJson = workspace.root.envelope.instance.workspace;

      return workspaceJson;
    } else {
      return error.getError("workspaceDetails", "documentFound");
    }
  } else {
    return error.getError("general", "noId");
  }
};

function put(context, params, input) {
  declareUpdate();

  if (params.hasOwnProperty("id")) {
    let id = decodeURIComponent(params.id);

    let currentUser = user.getCurrentUser();

    let query =
      cts.andQuery([
        cts.collectionQuery("workspace"),
        cts.collectionQuery(currentUser.uri),
        cts.jsonPropertyValueQuery("id", id)
      ]);

    let workspace =
      fn.subsequence(
        cts.search(query, ["unfiltered"]),
        1,
        2
      ).toArray();

    if (workspace[1] != null) {
      return error.getError("workspaceDetails", "dubplateID");
    } else {
      workspace = workspace[0];
    }

    if (workspace != null) {
      var response;

      switch (params.action) {
        case 'name':
          response = updateName(workspace, input);
          break;

        case 'description':
          response = updateDescription(workspace, input);
          break;

        case 'entity':
          response = updateEntity(workspace, input);
          break;

        case 'deleteEntity':
          response = deleteEntity(workspace, input);
          break;
        case 'deleteWorkspaceEntity':
          response = deleteWorkspaceEntity(workspace, input,id);
          break;

        case 'deleteWorkspace':
          response = deleteWorkspace(id, currentUser.uri);
          break;

        default:
          response = error.getError("workspaceDetails", "noAction");
          break;
      }
      return response;
    } else {
      return error.getError("workspaceDetails", "documentFound");
    }
  } else {
    return error.getError("general", "noId");
  }
};

function updateName(workspace, input) {
  try {
    //update name
    var doc = {
      input: input.root
    };

    var newName = doc.input.name;
    var n = new NodeBuilder();
    node = n.addText(newName).toNode();

    let name = workspace.xpath("/envelope/instance/workspace/name");

    xdmp.nodeReplace(name, node);

    updateLastModified(workspace);

    return { success: "The name was updated." };
  } catch (e) {
    return error.getError("workspaceDetails", "updateError", e);
  }
};

function updateDescription(workspace, input) {
  try {
    //update description
    var doc = {
      input: input.root
    };

    var newDescription = doc.input.description;
    var n = new NodeBuilder();
    node = n.addText(newDescription).toNode();

    let description = workspace.xpath("/envelope/instance/workspace/description");

    xdmp.nodeReplace(description, node);

    updateLastModified(workspace);

    return { success: "The description was updated." };
  } catch (e) {
    return error.getError("workspaceDetails", "updateError", e);
  }
};

function updateLastModified(workspace) {
  //update lastModified
  var newDate = xs.string(fn.currentDateTime());
  var n = new NodeBuilder();
  let node = n.addText(newDate).toNode();

  xdmp.nodeReplace(fn.head(workspace.xpath("/envelope/instance/workspace/lastModified")), node);
};

function updateEntity(workspace, input) {
  const entity = require("/lib/entity.sjs");

  try {
    //updates the entity
    var doc = {
      input: input.root
    };
    var workspaceURI = xdmp.nodeUri(workspace);

    var entities = doc.input.entities;
    var workspaceEntities = workspace.root.envelope.instance.workspace.entities;
    var workspaceName = workspace.root.envelope.instance.workspace.name;
    if (entities == null) {
      return error.getError("workspaceDetails", "noEntity");
    }

    //entities should be array but for some reasone its not
    /*
    if (!Array.isArray(entities) == true) {
      return error.getError("workspaceDetails","entityNotArray")
    }
    */

    //entities should be array but for some reasone its not
    //so we use this to get the keys
    var workspaceEntitiesObject = workspaceEntities.toObject();

    //first updates the Entities in memory then updates
    Object.keys(entities).forEach(function (key) {
      var currentEntityObject = entities[key];

      //checks to see if there is already existing predicates data
      //if there is it gets it
      let predicates = {};
      if (workspaceEntitiesObject.hasOwnProperty(currentEntityObject.entity)) {
        predicates = workspaceEntitiesObject[currentEntityObject.entity].predicates;
      }

      //replaces updated predicate
      predicates[currentEntityObject.predicate] = currentEntityObject.value;

      //allows us to get the preferredName and type
      var currentEntityData = entity.getData(currentEntityObject.entity);

      workspaceEntitiesObject[currentEntityObject.entity] = {
        "preferredName": currentEntityData.preferredName,
        "type": currentEntityData.type,
        "predicates": predicates
      };
    });

    //then replaces the node
    xdmp.nodeReplace(workspaceEntities, workspaceEntitiesObject);

    // recreate triples using the new set of workspace entities
    let currentUser = user.getCurrentUser();
    let triples = [
      sem.triple(sem.iri(currentUser.uri), sem.iri("hasWorkspace"), sem.iri(workspaceURI)),
      sem.triple(sem.iri(workspaceURI), sem.iri("PRH:preferredName"), workspaceName.toString()),
      sem.triple(sem.iri(workspaceURI), sem.iri("PRH:entityType"), "workspace")
    ];
    Object.keys(workspaceEntitiesObject).forEach(function (entityUriKey) {
      let entityPredicatesMap = workspaceEntitiesObject[entityUriKey].predicates;

      // Build triples for each predicate for the entity.
      Object.keys(entityPredicatesMap).forEach(function (predicate) {
        let newTriple = sem.triple(
          sem.iri(workspaceURI),
          sem.iri("PRH:" + predicate),
          sem.iri(entityUriKey)
        );

        triples.push(newTriple);
      });
    });
    xdmp.nodeReplace(workspace.root.envelope.triples, triples)

    updateLastModified(workspace);

    return { success: "The Entities was updated." };
  } catch (e) {
    return error.getError("workspaceDetails", "updateError", e);
  }
};

function deleteWorkspaceEntity(workspace, input, id) {

  try {
    var doc = {
      input: input.root
    };

    var entities = doc.input.entity;
    let workspaceURI = "/workspace/" + id + ".json";

    let entity = xdmp.urlDecode(entities[0])

    for (var y of fn.doc(workspaceURI))
      xdmp.nodeDelete(y.root.envelope.instance.workspace.entities[entity]);




    return { success: "The entity was deleted." };
  } catch (e) {
    return error.getError("workspaceDetails", "deleteError", e);
  }
};

function deleteEntity(workspace, input) {
  try {
    var doc = {
      input: input.root
    };

    var entities = doc.input.entities.toObject().map(x => x.entity);

    entities.forEach(function (entity) {
      // delete the entity
      var targetEntity = !fn.empty(workspace.xpath("/envelope/instance/workspace/entities/*[name()='" + entity + "']")) ? workspace.xpath("/envelope/instance/workspace/entities/*[name()='" + entity + "']") : null;
      if (targetEntity) {
        xdmp.nodeDelete(targetEntity);
      }

      // delete the triples associated with the entity
      let triples = Array.from(workspace.xpath("/envelope/triples/triple"));
      triples.forEach(function (triple) {
        if (triple.subject == entity || triple.object == entity) {
          xdmp.nodeDelete(triple);
        }
      });
    });

    return { success: "The entity was deleted." };
  } catch (e) {
    return error.getError("workspaceDetails", "deleteError", e);
  }
};

function deleteWorkspace(id, userUri) {
  try {
    let workspaceURI = "/workspace/" + id + ".json";

    xdmp.documentSetCollections(workspaceURI, ["deleted-workspace", userUri]);

    return { success: "The workspace was deleted." };
  } catch (e) {
    return error.getError("workspaceDetails", "deleteError", e);
  }
};

function deleteFunction(context, params) {
  declareUpdate();

  if (params.hasOwnProperty("id")) {
    let id = decodeURIComponent(params.id);

    let currentUser = user.getCurrentUser();
    deleteWorkspace(id, currentUser.uri);
  }
}

exports.PUT = put;
exports.GET = get;
exports.DELETE = deleteFunction;
