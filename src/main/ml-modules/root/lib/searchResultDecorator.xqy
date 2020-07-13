module namespace d = "http://marklogic.com/search-decorator";

declare namespace search = "http://marklogic.com/appservices/search";

declare function d:decorator(
  $result-uri as xs:string,
  $result as node()
) as item() {
  (: search.queryText.query.qtext :)
  let $body := xdmp:get-request-body("json")
  let $body := 
    if (empty($body)) then (
      object-node {
        "root": object-node {
          "search": object-node {
            "query": object-node {
              "and-query": object-node {
                "queries": array-node {
                  object-node {
                    "qtext": xdmp:get-request-field("q", "")
                  }
                }
              }
            }
          }
        }
      }
    ) else ($body) 
  let $javaScript := "
    var doc;
    var body;
    let term = body.root.search.query['and-query'].queries[0].qtext;
    const entity = require('/lib/entity.sjs');
    let options = {
      'getRelationships': false,
      'getContent': true,
      'getHighlighted': true,
      'terms': term,
    };
    JSON.stringify(entity.getDataByDocument(doc, options));
    "
  return
   xdmp:javascript-eval($javaScript, ("doc", $result, "body", $body))


};