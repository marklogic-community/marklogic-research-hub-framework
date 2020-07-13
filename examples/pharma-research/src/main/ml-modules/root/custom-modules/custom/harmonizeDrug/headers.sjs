/*
 * Create Headers Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an object of headers
 */

const studyHelper = require("/lib/studyHelper.xqy");

function createHeaders(id, content, options) {
  let url = fn.string(id);
  let fileId1 = url.substr(url.lastIndexOf("/") + 1);

  const imageID = fileId1
    .split(".")
    .slice(0, -1)
    .join(".");

  const currentDateTime = fn.currentDateTime();
  const elapsedTime = xdmp.elapsedTime();
  const HarmonizedTimestamp = currentDateTime.add(elapsedTime);

  // [GJo] Added to header to facilitate TDE generated triples
  const activeSubstances = getActiveSubstanceName(content);
  const studies = fn.head(studyHelper.getStudies(content.drugName));

  return {
    // sources is the mandatory field for mastering
    sources: [{ name: "DailyMed" }],
    lastestTimeStamp: HarmonizedTimestamp,
    imageKey: imageID,
    version: "1.0",
    createdBy: xdmp.getCurrentUser(),
    stageDocID: id,
    commonFacets: {
      systemDateTimeCreated: HarmonizedTimestamp,
      activeSubstanceNames: activeSubstances,
      drugName: content.drugName,
      genericMedicineName: content.genericMedicineName
    },
    // [GJo] Added to header to facilitate TDE generated triples
    activeSubstances: activeSubstances.map(substance => {
      let id = camelize(substance);
      return {
        name: substance,
        id: id,
        uri: "/activeIngredient/" + id + ".json"
      };
    }),
    relatedStudies: studies.map(study => {
      return study.uri;
    })
  };
}

function getActiveSubstanceName(content) {
  var activeSubstanceNames = [];
  content.activeIngredients.forEach(function(activeIngredient) {
    activeSubstanceNames.push(activeIngredient.activeSubstanceName);
  });
  return activeSubstanceNames;
}

function camelize(str) {
  return ('' + str)
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

module.exports = {
  createHeaders: createHeaders
};
