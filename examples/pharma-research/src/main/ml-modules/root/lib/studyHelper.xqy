module namespace s = "http://marklogic.com/study-helper";

declare function s:getStudies($drug-name) as item()* {
    xdmp:invoke-function(function() {
        let $a := json:array()
        let $_ :=
            for $study in cts:search(fn:collection("Study"), cts:json-property-value-query("drugs", $drug-name, ("unstemmed", "case-insensitive")))
            let $o := json:object()
            return (
                map:put($o, "uri", xdmp:node-uri($study)),
                map:put($o, "title", $study//title/fn:string(.)),
                map:put($o, "linkUrl", $study//linkUrl/fn:string(.)),
                map:put($o, "armCount", $study//armCount/xs:int(.)),
                map:put($o, "nctId", $study//nctId/fn:string(.)),
                json:array-push($a, $o)
            )
        return
        $a
    },
    map:entry("database", xdmp:database("data-hub-FINAL")))
};