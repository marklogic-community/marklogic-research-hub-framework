
const messages = {
  "workspaceDetails:dubplateID": "Error with this workspace ID. There is more than one document with this ID.",
  "workspaceDetails:documentFound": "No document with that ID was found. Either the document doesnt exists or the current user has insufficient access to view it.",
  "general:noId": "No id was provided.",
  "workspaceDetails:noAction": "Either no rs:action was sent or the rs:action sent in does not exists.",
  "workspaceDetails:updateError": "An error happened while updating the workspace data.",
  "workspaceDetails:noEntity": "There was no entity sent in the body.",
  "workspaceDetails:entityNotArray": "The entity is not an array, it must be an array.",
  "workspaceDetails:deleteError": "An error happened while deleting the workspace data.",
}

function getError(namespace,code,error) {
  
  xdmp.setResponseCode(500,"Internal Server Error");
  
  let namespacedCode = namespace + ":" + code;
  
  let obj = {
    error: {
      code: namespacedCode,
      message: messages[namespacedCode],
      markLogicError: error
    }
  }
 
  return obj
};

exports.getError = getError;