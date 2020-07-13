const test = require('/test/test-helper.xqy');
const lib = require('lib/affiliation-help.sjs');
const affiliation = require('/lib/createAuthorAffiliation.sjs')


let assertions = [];
// Scenario 1:
var uri = lib.URIS.foo
x = cts.doc(uri)
let affiliationsXMLs = x.xpath("//*:aff")


let affiliationStringItems = affiliation.handleAffiliationsWithoutReferences(affiliationsXMLs)



assertions.push(
  test.assertEqual("Technology Division", affiliationStringItems[0].organizationDivision),
  test.assertEqual("Momentx Corporation", affiliationStringItems[0].organizationName),
  test.assertEqual("USA", affiliationStringItems[0].organizationCountry),

  test.assertEqual("Department of Computer Science", affiliationStringItems[1].organizationDivision),
  test.assertEqual("Virginia Tech", affiliationStringItems[1].organizationName),
  test.assertEqual("USA", affiliationStringItems[1].organizationCountry),

  test.assertEqual("Department of Veterinary Services", affiliationStringItems[2].organizationDivision),
  test.assertEqual("Ministry of Animal Health and Fisheries Development", affiliationStringItems[2].organizationName),
  test.assertEqual("Nigeria", affiliationStringItems[2].organizationCountry),

  test.assertEqual("Computational Biology Unit", affiliationStringItems[3].organizationDivision),
  test.assertEqual("Clinical Research Institute of Montreal", affiliationStringItems[3].organizationName),
  test.assertEqual("Canada", affiliationStringItems[3].organizationCountry),

  test.assertEqual("Interdisciplinary Ph.D. Program in Genomics, Bioinformatics, and Computational Biology", affiliationStringItems[4].organizationDivision),
  test.assertEqual("Virginia Tech", affiliationStringItems[4].organizationName),
  test.assertEqual("USA", affiliationStringItems[4].organizationCountry),

  test.assertEqual("Computational Biology Unit", affiliationStringItems[5].organizationDivision),
  test.assertEqual("Clinical Research Institute of Montreal", affiliationStringItems[5].organizationName),
  test.assertEqual("Canada", affiliationStringItems[5].organizationCountry),

  test.assertEqual("Department of Chemistry, Faculty of Basic Sciences", affiliationStringItems[6].organizationDivision),
  test.assertEqual("Golestan University", affiliationStringItems[6].organizationName),
  test.assertEqual("Gorgan", affiliationStringItems[6].organizationCity),
  test.assertEqual("Iran.", affiliationStringItems[6].organizationCountry),


//TiCC, Tilburg University, Warandelaan 2, 5037 AB Tilburg, The Netherlands
  test.assertEqual("TiCC", affiliationStringItems[7].organizationDivision),
  test.assertEqual("Tilburg University", affiliationStringItems[7].organizationName),
  test.assertEqual("Tilburg", affiliationStringItems[7].organizationCity),
  test.assertEqual("The Netherlands", affiliationStringItems[7].organizationCountry),

  //School of Computational and Integrative Sciences, Jawaharlal Nehru University, New Delhi 110067, India
  test.assertEqual("School of Computational and Integrative Sciences", affiliationStringItems[8].organizationDivision),
  test.assertEqual("Jawaharlal Nehru University", affiliationStringItems[8].organizationName),
  test.assertEqual("Delhi", affiliationStringItems[8].organizationCity),
  test.assertEqual("India", affiliationStringItems[8].organizationCountry),


  //Biological Oceanography Division, Leibniz Institute of Marine Sciences (IFM-GEOMAR), Düsternbrooker Weg 20, 24105 Kiel, Germany
  test.assertEqual("Biological Oceanography Division", affiliationStringItems[9].organizationDivision),
  test.assertEqual("Leibniz Institute of Marine Sciences (IFM-GEOMAR)", affiliationStringItems[9].organizationName),
  test.assertEqual("Kiel", affiliationStringItems[9].organizationCity),
  test.assertEqual("Germany", affiliationStringItems[9].organizationCountry)

  );


assertions

