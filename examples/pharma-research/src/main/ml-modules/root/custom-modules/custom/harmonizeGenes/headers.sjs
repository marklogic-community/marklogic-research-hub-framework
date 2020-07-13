/*
 * Create Headers Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an object of headers
 */
function createHeaders(id, content, options) {
  return {

    'commonFacets': {
         'systemDateTimeCreated': fn.currentDateTime(),
         'typeOfGene': content.geneType,
         'chromosome': content.chromosome,
         'mapLocation': content.mapLocation,
         'relatedDiseaseNames': content.alternateFullNames
    },
    'relatedDiseases': content.diseases.map(disease => {
      return {
        id: disease.diseaseID,
        uri: '/disease/' + disease.diseaseID + '.json',
        name: disease.diseaseName
      }
    })
  };

}

module.exports = {
  createHeaders: createHeaders
};
