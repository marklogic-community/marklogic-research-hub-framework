module namespace s = "http://marklogic.com/search-results";

declare namespace search = "http://marklogic.com/appservices/search";

declare %private variable $snipItLength := 20;
declare %private variable $snipItLengthHafted := fn:round($snipItLength div 2);
declare %private variable $QueryOptions := ("distance-weight=-16","case-insensitive", "punctuation-insensitive", "diacritic-insensitive", "whitespace-insensitive", "stemmed");

(:
  gets N number of words around the queryText/term.
  Ideally it gets half of N before and half of N after.
  if there are not enough words in the before it will grab more until N from before
  same applys for after.
:)
declare function s:trimSurroundingWords(
  $terms as element(search:highlight)*
) as item()* {
  if ($terms) then
    let $term := $terms[1]
    let $getElement :=
      <e>
        <type>siblings</type>
        <before>{$term/preceding-sibling::node()/xs:string(.)}</before>
        <after>{$term/following-sibling::node()/xs:string(.)}</after>
      </e>

    let $mark := " " || $term/xs:string(.) || " "

    (: Get's all text before the mark :)
    let $before := $getElement/before/xs:string(.)

    let $wordsBefore := (fn:reverse(fn:analyze-string($before, "\w+|\w+[\p{P}\p{S}]", "im")//*:match/xs:string(.)))[1 to $snipItLength]
    let $wordCountBefore := fn:count($wordsBefore)

    (: Get's all text after the mark :)
    let $after := $getElement/after/xs:string(.)
    let $wordsAfter := (fn:analyze-string($after, "\w+|\w+[\p{P}\p{S}]", "im")//*:match/xs:string(.))[1 to $snipItLength]
    let $wordCountAfter := fn:count($wordsAfter)

    (: lets us know how many words we need to get before the mark, because their might not be enough words after the mark :)
    let $offsetCountBefore :=
      if ($wordCountAfter gt $snipItLengthHafted)
        then $snipItLengthHafted
        else $snipItLengthHafted + ($snipItLengthHafted - $wordCountAfter)

    (: lets us know how many words we need to get after the mark, because their might not be enough words before the mark :)
    let $offsetCountAfter :=
      if ($wordCountBefore gt $snipItLengthHafted)
        then $snipItLengthHafted
        else $snipItLengthHafted + ($snipItLengthHafted - $wordCountBefore)

    (: joins all selected words before the mark :)
    let $selectedWordsBefore := fn:string-join(fn:reverse($wordsBefore[1 to $offsetCountBefore]), " ")

    (: adds a ... if there is more words than we selected :)
    let $selectedWordsBefore :=
      if ($wordCountBefore lt $offsetCountBefore)
          then $selectedWordsBefore
        else '...' || $selectedWordsBefore

    (: joins all selected words before the mark :)
    let $selectedWordsAfter := fn:string-join($wordsAfter[1 to $offsetCountAfter], " ")

    (: adds a ... if there is more words than we selected :)
    let $selectedWordsAfter :=
      if ($wordCountAfter lt $offsetCountAfter)
        then $selectedWordsAfter
        else $selectedWordsAfter || '...'

    let $snipIt :=
      <search:match>
        {$selectedWordsBefore}
        {<search:highlight>{$mark}</search:highlight>}
        {$selectedWordsAfter}
      </search:match>

    let $highlighting :=
      let $q-terms := $terms/@term
      let $q-terms :=
        if ($q-terms) then $q-terms
        else
          $terms/text()
      return
        if (fn:exists($q-terms))
        then
          let $node :=
            <search:match>{$snipIt/xs:string(.)}</search:match>
          return
            cts:highlight($node, cts:word-query($q-terms ! xs:string(.), $QueryOptions), <search:highlight>{$cts:text}</search:highlight>)
        else
          $snipIt


    (: remarks up the terms in the shown text :)
    return $highlighting
  else ()
};

declare function s:build(
  $content as node(),
  $ctsqueryElement as schema-element(cts:query),
  $elementsToAvoid as node()*
) as element()* {
(: Updated to handle two word highlighting :)
    let $ctsquery :=
       cts:or-query($ctsqueryElement//cts:text/text())

    let $snippet :=
      cts:walk(
        $content,
        $ctsquery,
        if ($cts:node ne $cts:text and fn:not($cts:node/.. eq $elementsToAvoid) and fn:not($cts:node eq $elementsToAvoid)) then (
          $cts:node,
          xdmp:set($cts:action, "break")
        ) else (
          xdmp:set($cts:action, "continue")
        )
      )
    let $match :=
        if (fn:empty($snippet)) then ()
        else (
          cts:highlight(
            <search:match>{$snippet}</search:match>,
            $ctsquery,
            <search:highlight>{$cts:text}</search:highlight>
          )
        )
    let $trimmed := s:trimSurroundingWords(($match//search:highlight))
    return
       <search:snippet format="json">{$trimmed}</search:snippet>
};

declare function s:publication(
   $result as node(),
   $ctsquery as schema-element(cts:query),
   $options as element(search:transform-results)?
) as element(search:snippet) {
  let $content := $result/*:envelope/*:instance/element()[fn:name(.) != "info"]
  let $elementsToAvoid :=
   (
     ($content//*:AbstractText)[1],
     ($content//*:articleTitle)[1],
     ($content//*:Keyword),
     ($content//*:PubMedPubDate)[1],
     ($content//*:Journal)
   )
  return s:build($content, $ctsquery, $elementsToAvoid)

};

declare function s:snippet(
  $result as node(),
   $ctsquery as schema-element(cts:query),
   $options as element(search:transform-results)?
) as element(search:snippet) {
  let $javaScript := "
    var result;
    var ctsQuery;
    var options;

    const config = require('/entities/entityconfig.sjs');
    config.snippet(result, ctsQuery, options);
    "
  return
    xdmp:javascript-eval($javaScript, ("result", $result, "ctsQuery", $ctsquery, "options", $options))
};
