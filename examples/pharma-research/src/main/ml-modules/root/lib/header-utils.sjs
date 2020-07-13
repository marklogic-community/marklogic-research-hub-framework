/**
 ** Collection of utility functions for headers related operations
 **
 **/
/**  
 ** Function to retrive organizatioName from affiliations array to populate
 ** institutionPreferredName as part of header commonFacets
 **
 ** @param affiliations object array
 **/
function getInstitutions(affiliations) {
    var institutions = [];
    if (affiliations != null) {
	    affiliations.forEach(function(affiliation) {
	    	institutions.push(affiliation.organizationName)
	    });
	}
  return institutions
};

module.exports = {
  getInstitutions: getInstitutions
};