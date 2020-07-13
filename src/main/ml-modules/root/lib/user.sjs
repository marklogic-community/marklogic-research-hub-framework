function getCurrentUserName() {
  let userName = xdmp.getRequestHeader('userName', xdmp.getCurrentUser());
  return userName
};

function userNameToURI(userName) {
  return '/user/'+ userName +'.json';
};

function getCurrentUser() {
  let userName = getCurrentUserName();
  
  let uri = userNameToURI(userName);
  
  let user;
  if (fn.docAvailable(uri)) {
    var doc = cts.doc(uri);
    user = doc.root.envelope.instance.User
    user = user.toObject();
  } else { 
    user = {
      userName: userName,
      uri: uri,
      preferredName: userName,
      currentWorkspaceID: "unknown" //ToDo change this to be a real ID sent from the frontend
    }
  }  

  const entity = require("/lib/entity.sjs");

  let entityOptions = {
    'getRelationships': false,
    'getContent': true,
  }
 
  user.currentWorkspace = entity.getData("/workspace/"+ user.currentWorkspaceID + ".json", entityOptions)
  return user
};

function insertUserDoc(userDoc) {
  declareUpdate()
return  xdmp.documentInsert(
           userDoc.uri, userDoc,
           {
            permissions : [xdmp.permission('rest-reader', 'read'), xdmp.permission('rest-writer', 'update')],
            collections : ["user"]}) 
};

exports.getCurrentUserName = getCurrentUserName;
exports.userNameToURI = userNameToURI;
exports.getCurrentUser = getCurrentUser;
exports.insertUserDoc = insertUserDoc;