const error = require("/lib/error.sjs");
const entity = require("/lib/entity.sjs");
const user = require("/lib/user.sjs");
const recom = require("/lib/recommender.sjs");

let nodes = [];
let edges = [];
let maxLevel = 1;
let maxNodes = 1000;
let limitPerNode = 100;
let traversed = {};
let alreadyAddedtoNode = {};
let entityOptions = {
  'getRelationships': true,
  'getContent': false
}

let breakException = {};
let currentUser = user.getCurrentUser();

function isEntityInCurrentWorkspace(entityUri) {
  if(
    currentUser != null && 
    currentUser.hasOwnProperty("currentWorkspace")  && 
    currentUser.currentWorkspace.hasOwnProperty("content") && 
    currentUser.currentWorkspace.content != null && 
    currentUser.currentWorkspace.content.hasOwnProperty("entities") && 
    currentUser.currentWorkspace.content.entities.hasOwnProperty(entityUri)
  ) {
    return true;
  }
  else {
    return false; 
  }
};

function buildNodesAndEdges(level, entityUri, visibleIds, options = {}) {
  if((level <= maxLevel || options.autoExpand) && !traversed.hasOwnProperty(entityUri)) {
    const entityObject = entity.getData(entityUri, entityOptions);
    let nextLevel = level + 1;
    let id = entityUri;
    let label = entityObject.preferredName;
    let group = entityObject.type;
    if(!alreadyAddedtoNode.hasOwnProperty(id)) { 
      let node = {
        id: id,
        label: label,
        group: group + 'Recommendation',
        level: (level - 1),
        isInCurrentWorkspace: isEntityInCurrentWorkspace(entityUri),
        isRecommendation: true
      };

      if(nodes.length < maxNodes || (level - 1) == 0){
        nodes.push(node);
      }
      else {
        throw breakException;
      }

      alreadyAddedtoNode[id] = true;
    }

    traversed[id] = true;

    entityObject.relationships.forEach(function(relationship) {
      // Only include edges for links to nodes already visible on the graph.
      const relationshipId = relationship.uri;
      if (doesListContain(visibleIds, relationshipId.toString())) {
        // let relationshipLabel = relationship.preferredName;
        // let relationshipGroup = relationship.entityType;
        let edge = {
          from: id,
          to: relationshipId
        };
        
        edges.push(edge);
      }

      if((nextLevel <= maxLevel || relationship.autoExpand) && !traversed.hasOwnProperty(relationshipId) && nodes.length < maxNodes) {
        buildNodesAndEdges(nextLevel, relationship.uri, visibleIds, {autoExpand : relationship.autoExpand});
      }
    });
  }
};

function buildNodesAndEdgesv1(level, entityUri, options = {}) {
  if((level <= maxLevel || options.autoExpand) && !traversed.hasOwnProperty(entityUri)) {
    const entityObject = entity.getData(entityUri, entityOptions);
    let nextLevel = level + 1;
    let id = entityUri;
    let label = entityObject.preferredName;
    let group = entityObject.type;
    if(!alreadyAddedtoNode.hasOwnProperty(id)) { 
      let node = {
        id: id,
        label: label,
        group: group + 'Recommendation',
        level: (level - 1),
        isInCurrentWorkspace: isEntityInCurrentWorkspace(entityUri),
        isRecommendation: true
      };

      if(nodes.length < maxNodes || (level - 1) == 0){
        nodes.push(node);
      }
      else {
        throw breakException;
      }

      alreadyAddedtoNode[id] = true;
    }

    traversed[id] = true;

    entityObject.relationships.slice(0, limitPerNode).forEach(function(relationship) {
      let relationshipId = relationship.uri;
      let relationshipLabel = relationship.preferredName;
      let relationshipGroup = relationship.entityType;

      if(!alreadyAddedtoNode.hasOwnProperty(relationshipId) && nodes.length < maxNodes) {
        let node = {
          id: relationshipId,
          label: relationshipLabel,
          group: relationshipGroup + 'Recommendation',
          level: level,
          isInCurrentWorkspace: isEntityInCurrentWorkspace(entityUri),
          isRecommendation: true
        };
        
        if(nodes.length < maxNodes) {
          nodes.push(node);
        }
        else {
          throw breakException;
        }

        alreadyAddedtoNode[relationshipId] = true;

        let edge = {
          from: id,
          to: relationshipId
        };
        
        edges.push(edge);
      }

      if((nextLevel <= maxLevel || relationship.autoExpand) && !traversed.hasOwnProperty(relationshipId) && nodes.length < maxNodes) {
        buildNodesAndEdgesv1(nextLevel, relationship.uri, {autoExpand : relationship.autoExpand});
      }
    });
  }
};

// Created this function because using <indexOf> or <contains> on the array was not working.
function doesListContain(list, value) {
  let matches = false;
  for (let i=0; i < list.length; i++) {
    if (list[i] == value) {
      matches = true;
      break;
    }
  }

  return matches;
};

function get(context, params) {
  // Search on Pubs with text:  obesity exercise
  if(params.hasOwnProperty("id")) {
    let visibleIds = [];
    let workspaceId = null;
    let algorithmName = null;

    // uri can come in encoded many times
    const sourceIds = params.id.toString().split(",").map(key => decodeURIComponent(decodeURIComponent(decodeURIComponent(decodeURIComponent(key)))));

    /* ML Recommender V1 */
    var recommended = recom.bestNewConnection(sourceIds);
    var uris = [];
    recommended.forEach(function(value) {
      uris.push(value.node)
    });

    if(params.hasOwnProperty("maxResults")) {
      maxResults = params.maxResults;
    }

    if(params.hasOwnProperty("visibleIds")) {
      visibleIds = params.visibleIds.toString().split(",").map(key => decodeURIComponent(decodeURIComponent(decodeURIComponent(decodeURIComponent(key)))));
    }

    if(params.hasOwnProperty("workspaceId")) {
      workspaceId = params.workspaceId;
    }

    if(params.hasOwnProperty("algorithmName")) {
      algorithmName = params.algorithmName;
    }
    
    uris.forEach(function(uri) {
      try {
        buildNodesAndEdges(1, uri);
      }
      catch(e) {
        if(e !== breakException) throw e;
      }
    });
    
    // Remove the visible and source ids that overlap with the recommended nodes.
    const finalNodes = nodes.filter(node => {
      const idStr = fn.string(node.id);
      return (!visibleIds.includes(idStr) && !sourceIds.includes(idStr));
    });

    var data = {
      nodes: finalNodes,
      edges: edges,
      uris
    };

    return data;
  }
  else {
    return error.getError("general", "noId");
  }
};

function post(context, params, input) {
  // Search on Pubs with text:  obesity exercise
  if(input.root && input.root.ids) {
    let visibleIds = [];
    let workspaceId = null;
    let algorithmName = null;

    const sourceIds = Sequence.from(input.root.ids).toArray();
    var recommended = recom.bestNewConnection(sourceIds);
    var uris = [];
    var recommendedNodes = [];
    recommended.forEach(function(value) {
      uris.push(value.node);
      recommendedNodes.push(value.node);
    });

    if(params.hasOwnProperty("maxResults")) {
      maxLevel = params.maxResults;
    }

    if(params.hasOwnProperty("visibleIds")) {
      visibleIds = Sequence.from(input.root.ids).toArray();
    }

    if(params.hasOwnProperty("workspaceId")) {
      workspaceId = params.workspaceId;
    }

    if(params.hasOwnProperty("algorithmName")) {
      algorithmName = params.algorithmName;
    }

    const allIds = sourceIds.concat(uris);
    
    uris.forEach(function(uri) {
      try {
        buildNodesAndEdges(1, uri, allIds);
      }
      catch(e) {
        if(e !== breakException) throw e;
      }
    });

    // Remove the visible and source ids that overlap with the recommended nodes.
    const finalNodes = nodes.filter(node => {
      const idStr = node.id.toString();
      return (!doesListContain(visibleIds, idStr) && !doesListContain(sourceIds, idStr));
    });

    var data = {
      nodes: finalNodes,
      edges: edges,
      uris
    };

    return data;
  }
  else {
    return error.getError("general", "noId");
  }
};

exports.GET = get;
exports.POST = post;
