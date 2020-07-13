// A custom hook receives the following parameters via DHF. Each can be optionally declared.
var uris; // an array of URIs (may only be one) being processed
var content; // an array of objects for each document being processed
var options; // the options object passed to the step by DHF
var flowName; // the name of the flow being processed
var stepNumber; // the index of the step within the flow being processed; the first step has a step number of 1
var step; // the step definition object

content = content.map(c => {
    let value = c.value.toObject();

    let attachments = value.envelope.attachments;
    let headers = value.envelope.headers;

    if (attachments 
        && attachments.envelope 
        && attachments.envelope.instance 
        && attachments.envelope.instance.Skills) {

        headers.Skill = attachments.envelope.instance.Skills.split(',');
    }

    c.value = value;
    return c;
});