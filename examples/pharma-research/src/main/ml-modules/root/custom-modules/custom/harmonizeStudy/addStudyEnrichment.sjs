// A custom hook receives the following parameters via DHF. Each can be optionally declared.
var uris; // an array of URIs (may only be one) being processed
var content; // an array of objects for each document being processed
var options; // the options object passed to the step by DHF
var flowName; // the name of the flow being processed
var stepNumber; // the index of the step within the flow being processed; the first step has a step number of 1
var step; // the step definition object

content = content.map(c => {
    let value = c.value.toObject();
    let study = value.envelope.instance.Study;

    let studyIds = study.studyIds ? study.studyIds : [];
    let queryTerms = studyIds.concat(study.nctId).filter(id => id.length > 5);
    study.enrichment = {};
    study.enrichment.preferredName = study.nctId;
    study.enrichment.query =cts.wordQuery(
        queryTerms,
        [
            "case-insensitive",
            "diacritic-insensitive",
            "unstemmed",
            "punctuation-insensitive",
            "whitespace-insensitive"
        ]
    ).toObject();
    c.value = value;
    c.value.envelope.attachments = null;
    return c;
});
