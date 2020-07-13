declare namespace search = 'http://marklogic.com/appservices/search';

declare function local:generate-buckets($totalYears) {
  let $currentDate := fn:current-date()
  let $currentYear := fn:year-from-date($currentDate) + 10

  let $monthList := ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')
  let $years :=
    for $year in $currentYear - $totalYears to $currentYear
      for $month in 1 to 12
        let $name := $monthList[$month] || ' ' || $year
        let $prefix := if ($month lt 10) then '0' else ''
        let $ge := $year || '-' || $prefix || $month || '-01'
        let $lt := xs:date($ge) + xs:yearMonthDuration("P1M")
         return
           <search:bucket name="{$name}" ge="{$ge}" lt="{$lt}">{$monthList[$month] || ' ' || $year}</search:bucket>

  return $years
};

declare function local:generate-revisedDate-range($doc) {
  let $revisedDateNode := $doc//search:constraint[@name = 'revisedDate']

  (: get the current nodes except the bucket nodes:)
  let $origNodes :=
    for $node in $revisedDateNode/node()/node()
      let $node-name := $node/name()
      return
        if ($node-name eq 'bucket') then
          ()
        else
          $node

  (: append new bucket nodes :)
  let $bucketNodes := local:generate-buckets(20)

  return
    <search:range type="xs:date" facet="true">
      { $origNodes }
      { $bucketNodes }
    </search:range>
};

let $uri := '/Default/data-hub-FINAL/rest-api/options/publications.xml'
let $doc := doc($uri)

let $newRevisedDateRange := local:generate-revisedDate-range($doc)

return
  xdmp:node-replace($doc/search:options/search:constraint[@name = 'revisedDate']/search:range, $newRevisedDateRange)
