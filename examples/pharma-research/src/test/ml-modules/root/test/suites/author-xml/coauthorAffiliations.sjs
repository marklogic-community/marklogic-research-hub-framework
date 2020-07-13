const test = require('/test/test-helper.xqy');
const pub = require("/lib/pubMedHelper.sjs");

let assertions = [];

const id = '/foo.xml'
const doc = cts.doc(id)
const authorAffiliationsReferences = [
  "Aff1",
  "Aff2",
  "AF3_14_0002",
  "AF3_14_0003",
  "AF3_14_0004",
  "AF3_14_0005",
  "AF3_14_0006"
]

const res = pub.getCoAuthorsAffiliationsName(authorAffiliationsReferences, doc).sort();
const expected = [
  "Department of Life Science, Genome and Systems Biology Degree Program, National Taiwan University, Taipei 10617, Taiwan; ",
  "Department of Internal Medicine, National Taiwan University Hospital, ",
  "Diabetes Prevention Unit, Department of Chronic Disease Prevention, National Institution for Health and Welfare, Helsinki, Finland",
  ", Folkhälsan Research Centre, Helsinki, Finland",
  "Unit of General Practice, Helsinki University of Central Hospital, Helsinki, Finland",
  ", Vasa Central Hospital, Vaasa, Finland",
  "Department of General Practice and Primary Health Care, University of Helsinki, Helsinki, Finland"
].sort()

assertions.push(
  test.assertEqual(expected, res)
)
assertions
