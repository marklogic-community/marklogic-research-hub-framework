
  /* CRUD interface for adding, removing and accessing entire Workspaces */

  function get(context, params) {
    const user = require("/lib/user.sjs");

    let currentUser = user.getCurrentUser();

    let results = [];

    let start = params.start || 1;
    let pageLength = params.pageLength || 10;
    let end =  (start + pageLength) - 1;

    let queryOptions = ["unfiltered"]
    let query =
      cts.andQuery([
        cts.collectionQuery("workspace"),
        cts.collectionQuery(currentUser.uri)
      ]);
    let total = cts.estimate(query,queryOptions)

    let workspaces =
      fn.subsequence(
        cts.search(query,queryOptions),
        start,
        end
      );

    for (var workspace of workspaces) {
      var workspaceJson = workspace.root.envelope.instance.workspace;

      var result = {
        name: workspaceJson.name,
        description: workspaceJson.description,
        id: workspaceJson.id
      };

      results.push(result);
    }

    var response = {
    	total: total,
    	start: start,
    	pageLength: pageLength,
    	results: results
    };

    return response;

  };

  function put(context, params, input) {
    const user = require("/lib/user.sjs");
    const entity = require("/lib/entity.sjs");

    declareUpdate();

    const DataHub = require("/data-hub/5/datahub.sjs");
    const datahub = new DataHub();

    var attachments = {
      input: input.root
    }

    let id = sem.uuidString();
    let workspaceURI = "/workspace/" + id + ".json";
    let currentUser = user.getCurrentUser();
    let name = attachments.input.name || "Untitled";
    let description = attachments.input.description || "";
    let entities = attachments.input.entities.toObject() || {};

    // Build the initial set of triples for the workspace.
    let triples = [
      sem.triple(sem.iri(currentUser.uri), sem.iri("hasWorkspace"), sem.iri(workspaceURI)),
      sem.triple(sem.iri(workspaceURI), sem.iri("PRH:preferredName"), name.toString()),
      sem.triple(sem.iri(workspaceURI), sem.iri("PRH:entityType"), "workspace")
    ];

    //first updates the Entities in memory then updates
    Object.keys(entities).forEach(function(key) {

      var currentEntityObject = entities[key];

      //allows us to get the preferredName and type
      var currentEntityData = entity.getData(key)

      entities[key] = {
          "preferredName": currentEntityData.preferredName,
          "type": currentEntityData.type,
          "predicates": entities[key].predicates
      }

      // Build triples for each predicate for the entity.
      Object.keys(entities[key].predicates).forEach(function(predicate) {
        triples.push(
          sem.triple(
            sem.iri(workspaceURI),
            sem.iri("PRH:" + predicate),
            sem.iri(key)
          )
        )
      });
    });

	  var content = {
  		'$attachments': attachments,
      '$type': "workspace",
      'name': name,
  		"description": description,
  		"id": id,
      "creator": {
        "uri": currentUser.uri,
        "preferredName": currentUser.preferredName,
      },
      "created": fn.currentDateTime(),
      "lastModified": fn.currentDateTime(),
      "entities": entities,
      "sharedWith": {}
    }

    var headers = {
      loadDate: fn.currentDateTime()
    };

    var envelope = datahub.flow.flowUtils.makeEnvelope(content, headers, triples, datahub.flow.consts.JSON);

    xdmp.documentInsert(
      workspaceURI, envelope,
      {
        permissions : [xdmp.permission('rest-reader', 'read'), xdmp.permission('rest-writer', 'update')],
        collections : ["workspace", currentUser.uri]
      }
    )

    var response = {
      name: attachments.input.name,
      id: id,
    }

    return response

  };

exports.PUT = put;
exports.GET = get;
