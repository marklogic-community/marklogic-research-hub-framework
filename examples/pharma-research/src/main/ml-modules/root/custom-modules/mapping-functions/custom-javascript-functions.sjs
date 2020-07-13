'use strict';

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

function getDrugs(study) {
  let nctId = fn.head(study.xpath("clinical_study/*:id_info/*:nct_id/string()"));
  let drugs = study.xpath('clinical_study/*:intervention[*:intervention_type=("Drug", "Biological")]/*:intervention_name/string()');
  let filteredDrugs = [];
  if (drugs) {
    drugs = drugs.toArray()
    filteredDrugs = drugs.filter(drug => {
      let score = fn.max(words(drug).map((word, idx) => {
        let query = cts.andQuery([
          cts.elementValueQuery("nct_id", nctId),
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

  return Sequence.from(filteredDrugs);
}

function distinctValues(values) {
  return fn.distinctValues(values)
}

module.exports = {
  getDrugs,
  distinctValues
};
