'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/

function createContent(id, options) {
  let source = cts.doc(id)

  let drugs = getDrugs(id);

  const studyIds = fn.distinctValues(source.xpath("/*:envelope/*:instance/*:clinical_study/*:id_info/(*:org_study_id|*:secondary_id)/string()")).toArray();
  const nctId = fn.head(source.xpath("/*:envelope/*:instance/*:clinical_study/*:id_info/*:nct_id/string()"));

  let queryTerms = studyIds.concat(nctId).filter(id => id.length > 5);
  let enrichment = {};
  enrichment.preferredName = nctId;
  enrichment.query =
    cts.wordQuery(
      queryTerms,
      [
        "case-insensitive",
        "diacritic-insensitive",
        "unstemmed",
        "punctuation-insensitive",
        "whitespace-insensitive"
      ]
    ).toObject()

  let study = {
    title: fn.head(source.xpath("/*:envelope/*:instance/*:clinical_study/(*:official_title|*:brief_title)[1]/string()")),
    summary: fn.head(source.xpath("/*:envelope/*:instance/*:clinical_study/*:brief_summary/*:textblock/string()")),
    studyIds: studyIds,
    nctId: nctId,
    linkUrl: fn.head(source.xpath("/*:envelope/*:instance/*:clinical_study//required_header/url/fn:string(.)")),
    drugs: drugs,
    enrichment: enrichment,
    '$attachments': null,
    '$type': 'Study',
    '$version': '0.0.1'
  };

  let armCount = fn.head(source.xpath("/*:envelope/*:instance/*:clinical_study/*:number_of_arms/string()"));

  if (armCount) {
    study.armCount = xs.int(armCount);

    study.armType = study.armCount > 1 ? 'parallel' : 'single';
  }
  return study;
}

function words(w) {
  let res = [w];
  let toks = fn.tokenize(w, " ");
  let count = fn.count(toks);
  let subword = fn.stringJoin(fn.subsequence(toks, 1, count - 1), " ");
  if (count > 1) {
    res.concat(words(subword));
  }
  return res;
}

function getDrugs(uri) {
  let doc = cts.doc(uri)
  let drugs = doc.xpath('/*:envelope/*:instance/*:clinical_study/*:intervention[*:intervention_type=("Drug", "Biological")]/*:intervention_name/string()');
  let filteredDrugs = [];
  if (drugs) {
    drugs = drugs.toArray()
    filteredDrugs = drugs.filter(drug => {
      let score = fn.max(words(drug).map((word, idx) => {
        let query = cts.andQuery([
          cts.documentQuery(uri),
          cts.elementQuery(xs.QName('official_title'), cts.wordQuery(word, 'unstemmed', 64 / idx))
        ]);
        let res = fn.head(cts.search(query, 'score-logtf'))
        if (res) {
          return cts.score(res) || 0;
        }
        return 0;
      }));
      return score > 0
    });
  }

  return filteredDrugs;//results.push(`[${uri}] ` + filteredDrugs)
}

module.exports = {
  createContent: createContent
};
