'use strict';

const test = require('/test/test-helper.xqy');
const search = require('/lib/searchModel.xqy');
let result = "passed";

let options = `<options xmlns="http://marklogic.com/appservices/search">
<search-option>unfiltered</search-option>
<page-length>10</page-length>

<!-- Limit all searches to this additional query -->
<additional-query>
  <cts:collection-query xmlns:cts="http://marklogic.com/cts">
    <cts:uri>workspace</cts:uri>
  </cts:collection-query>
</additional-query>

<!-- Full-text search options -->
<term apply="term">
  <empty apply="all-results"/>
</term>

<result-decorator apply="decorator"
    ns="http://marklogic.com/search-decorator"
    at="/lib/searchResultDecorator.xqy"/>

<!-- Default sort order. You can also associate states with sort orders to allow switching sort orders -->
<sort-order direction="descending">
  <score/>
</sort-order>

<return-query>1</return-query>

<!-- This will extract the person's name from the search.  This path is specific to the person data
      sample data set.  As of beta release, you may override this by editing the default search route
      config options used in middle-tier/routes/api/index.js -->
<extract-document-data selected="include">
  <extract-path>//*:instance/*</extract-path>
</extract-document-data>
</options>
`;

let sQ = `{
  "query": {
    "queries": [{
      "term-query": {
        "text": [ "TempWork" ]
      }
    }]
}}`

let a = {"format": "json", "workspaceId": "66e6f69e-cccf-4650-84ab-1c03fdb1e3e8"};

try {
  result = search.searchtest(fn.head(xdmp.unquote(sQ)), fn.head(xdmp.unquote(options)).root, 1, 10, a);
}
catch(e) {
  result = e.stack;
}

test.assertExists(result);