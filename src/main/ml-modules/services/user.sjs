const user = require("/lib/user.sjs");
const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();
const error = require("/lib/error.sjs");

function get(context, params) {
    let response;
    let currentUser = user.getCurrentUser();
    
    return currentUser
  };


function put(context, params, input) { 
  
  declareUpdate(); 
  if (params.hasOwnProperty("workspaceId")){
    let response;
    let currentUser = user.getCurrentUserName();
    let docUri = user.userNameToURI(currentUser);

    let userdoc = {
      "userName": currentUser,
      "uri": docUri,
      "preferredName": currentUser,
      "currentWorkspaceID": decodeURIComponent(params.workspaceId), 
      '$type': 'User',
      '$version': '0.0.1',
    }

    let headers = {};
    let triples = {};

    response = datahub.flow.flowUtils.makeEnvelope(userdoc, headers, triples, datahub.flow.consts.JSON);
    
    xdmp.documentInsert(
        docUri,
        response,
        {
          permissions : [xdmp.permission('rest-reader', 'read'), xdmp.permission('rest-writer', 'update')],
          collections : ["user"]
        }
      )

    return {success: "The user's current workspace was updated."};
  } else {
    return error.getError("general","noId");
  }
    
};

exports.GET = get ;
exports.PUT = put ;

