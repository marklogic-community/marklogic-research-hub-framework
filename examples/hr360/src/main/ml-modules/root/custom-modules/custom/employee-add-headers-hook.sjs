// A custom hook receives the following parameters via DHF. Each can be optionally declared.
var uris; // an array of URIs (may only be one) being processed
var content; // an array of objects for each document being processed
var options; // the options object passed to the step by DHF
var flowName; // the name of the flow being processed
var stepNumber; // the index of the step within the flow being processed; the first step has a step number of 1
var step; // the step definition object

content = content.map(c => {
    let value = c.value.toObject();

    let instance = value.envelope.instance.employee;
    let headers = value.envelope.headers;

    if (instance) {
      const department = fn.head(cts.search(
        cts.andQuery([
          cts.jsonPropertyValueQuery('departmentId', instance.departmentId),
          cts.collectionQuery('department')
        ])
      ))
      if (department) {
        headers.departmentUri = fn.baseUri(department);
        headers.departmentName = department.toObject().envelope.instance.department.departmentName;
      }
    }

    c.value = value;
    return c;
});
