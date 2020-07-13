/* service endpoint to get data and perhaps relationships for a particular entity. 
   Delegates to a library module to do most of the work.
   */
  
const error = require("/lib/error.sjs");
const entity = require("/lib/entity.sjs");

function get(context, params) {
  
  if (params.hasOwnProperty("id") && params.id !== 'null') {
    var entityUri = decodeURIComponent(params.id);
    var options = {
    	'getRelationships': true,
    	'getContent': true,
      'getHighlighted': false,
      'terms': "",
  	}

    if (params.hasOwnProperty("getRelationships")){
      options.getRelationships = params.getRelationships
    }

    if (params.hasOwnProperty("getContent")){
      options.getContent = params.getContent
    }

    if (params.hasOwnProperty("getHighlighted")){
      options.getHighlighted = params.getHighlighted
    }
    
    if (params.hasOwnProperty("terms")){
      options.terms = params.terms
    }

    var entityObject = entity.getData(entityUri, options);

    return entityObject;

  } else {
    return error.getError("general","noId");
  }
  
};

exports.GET = get;