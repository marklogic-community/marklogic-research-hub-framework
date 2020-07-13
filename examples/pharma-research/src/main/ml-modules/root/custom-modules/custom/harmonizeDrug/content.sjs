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

  let onlyUnique = function(value, index, self) {
      return self.indexOf(value) === index;
  }

  const drug = {};

  let originalDrugDoc = cts.doc(id)
  let url = fn.string(id)
  let fileId1 = url.substr(url.lastIndexOf('/') + 1)
  const imageID = fileId1.split('.').slice(0, -1).join('.')
  let imageUris = originalDrugDoc.xpath("//*:zipImageURL/fn:string(.)")
  let productMedicineInfo = originalDrugDoc.xpath("/*:envelope/*:instance/*:document/*:component/*:structuredBody/*:component/*:section/*:subject/*:manufacturedProduct[1]/*:manufacturedMedicine")
  if (!fn.empty(productMedicineInfo)){

    let names = fn.head(originalDrugDoc.xpath("/*:envelope/*:instance/*:document/*:component/*:structuredBody/*:component/*:section/*:subject/*:manufacturedProduct[1]/*:manufacturedMedicine/*:name/string()"));

    let adverseReactionsXML = fn.stringJoin((fn.head(productMedicineInfo)).xpath("//*:section[*:code/@displayName='ADVERSE REACTIONS SECTION']/string()"));
    let adverseReactions =fn.normalizeSpace( ((fn.string(adverseReactionsXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));

    let genericMedicineNameXML = fn.stringJoin((fn.head(originalDrugDoc)).xpath("/*:envelope/*:instance/*:document/*:component/*:structuredBody/*:component/*:section/*:subject[1]/*:manufacturedProduct[1]/*:manufacturedMedicine/*:asEntityWithGeneric/*:genericMedicine[1]/*:name[1]/string()"))
    let genericMedicineName = ((fn.string(genericMedicineNameXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, "");

    let descriptionXML = fn.stringJoin((fn.head(productMedicineInfo)).xpath("//*:section[*:code/@displayName='DESCRIPTION SECTION']/string()"))
    let description = fn.normalizeSpace(((fn.string(descriptionXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));

    let contraindicationsXML = fn.stringJoin((fn.head(productMedicineInfo)).xpath("//*:section[*:code/@displayName='CONTRAINDICATIONS SECTION'][1]/string()"))
    let contraindications = fn.normalizeSpace(((fn.string(contraindicationsXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));

    let warningsXML = fn.stringJoin((fn.head(productMedicineInfo)).xpath("//*:section[*:code/@displayName='WARNINGS SECTION']/string()"), "")
    let warnings = fn.normalizeSpace(((fn.string(warningsXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));

    let indicationsXML = fn.stringJoin((fn.head(productMedicineInfo)).xpath("//*:section[*:code/@displayName='INDICATIONS &amp; USAGE SECTION']/string()"), "")
    let indications = fn.normalizeSpace(((fn.string(indicationsXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));

    let activeIngredients =  (fn.distinctValues((fn.head(productMedicineInfo)).xpath("//*:activeIngredient/*:activeIngredientSubstance/*:name/string()"), ""))

    let ingredientCodes = (fn.distinctValues((fn.head(productMedicineInfo)).xpath("//*:activeIngredient/*:activeIngredientSubstance/*:code[@codeSystemName='FDA SRS']/@code ! fn:string(.) "))).toArray()
    let activeSubstanceFDALink = "https://fdasis.nlm.nih.gov/srs/unii/" + ingredientCodes

    // Build a drug fingerprint based on active ingredient codes
    let activeIngredientCodeList = ingredientCodes.slice();
    activeIngredientCodeList.sort();
    activeIngredientCodeList = activeIngredientCodeList.filter(onlyUnique);
    let drugFingerprint = fn.stringJoin(activeIngredientCodeList, "-")


    var drugInstance = {
      "drugName" : names,
      "drugFingerprint": drugFingerprint,
      "productType" : "manufacturedMedicine",
      "zipImageURLkey": imageID,
      "zipImageURLs": imageUris,
      "genericMedicineName" : genericMedicineName,
      "activeIngredients" :[ {
        "activeSubstanceName" : fn.head(activeIngredients),
        "ingredientCodes" : fn.head(ingredientCodes),
        "activeSubstanceFDALink" : fn.head(activeSubstanceFDALink)
      }],
      "adverseReactions" : adverseReactions,
      "description": description,
      "contraindications":contraindications,
      "warnings":warnings ,
      "indications" : indications,
      "$type": "Drug",
      "$version": "0.0.1"
    }

    Object.assign(drug,drugInstance )
  }
  else {
    let productInfo = originalDrugDoc.xpath("/*:envelope/*:instance/*:document/*:component/*:structuredBody/*:component/*:section/*:subject[1]/*:manufacturedProduct[1]/*:manufacturedProduct")

    let nameXML = fn.head(originalDrugDoc.xpath("/*:envelope/*:instance/*:document/*:component/*:structuredBody/*:component/*:section/*:subject/*:manufacturedProduct[1]/*:manufacturedProduct/*:name/string()"));
    let name = ((fn.string(nameXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, "");

    let genericMedicineNameXML = fn.stringJoin((fn.head(originalDrugDoc)).xpath("/*:envelope/*:instance/*:document/*:component/*:structuredBody/*:component/*:section/*:subject[1]/*:manufacturedProduct[1]/*:manufacturedProduct/*:asEntityWithGeneric/*:genericMedicine[1]/*:name[1]/string()"))
    let genericMedicineName = ((fn.string(genericMedicineNameXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, "");

    let adverseReactionsXML = fn.stringJoin((fn.head(originalDrugDoc)).xpath("//*:section[*:code/@displayName='ADVERSE REACTIONS SECTION']/string()"));
    let adverseReactions = fn.normalizeSpace(((fn.string(adverseReactionsXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));

    let descriptionXML = fn.stringJoin((fn.head(originalDrugDoc)).xpath("//*:section[*:code/@displayName='DESCRIPTION SECTION']/string()"))
    let description = fn.normalizeSpace(((fn.string(descriptionXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));


    let contraindicationsXML = fn.stringJoin((fn.head(originalDrugDoc)).xpath("//*:section[*:code/@displayName='CONTRAINDICATIONS SECTION'][1]/string()"))
    let contraindications = fn.normalizeSpace(((fn.string(contraindicationsXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));

    let warningsXML = fn.stringJoin((fn.head(originalDrugDoc)).xpath("//*:section[*:code/@displayName='WARNINGS SECTION']/string()"), "")
    let warnings = fn.normalizeSpace(((fn.string(warningsXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));


    let indicationsXML = fn.stringJoin((fn.head(originalDrugDoc)).xpath("//*:section[*:code/@displayName='INDICATIONS &amp; USAGE SECTION']/string()"), "")
    let indications = fn.normalizeSpace(((fn.string(indicationsXML)).replace(/(\r\n|\n|\r)/gm, " ")).replace(/(\r\n|\t|\r)/gm, ""));

    let drugIngredients = originalDrugDoc.xpath("/*:envelope/*:instance/*:document/*:component/*:structuredBody/*:component/*:section/*:subject/*:manufacturedProduct[1]/*:manufacturedProduct[1]/*:ingredient/*:ingredientSubstance/*:name/string()")

    let activeIngredients =  fn.head(originalDrugDoc).xpath("//*:ingredient[@classCode=('ACTIB', 'ACTIM', 'ACTIR')]")

    let activeIngredientsIndex = 0;
    let activeIngredientsArray = [];
    let activeIngredientCodesArray = [];

    for (var activeIngredient of activeIngredients) {

      activeIngredientsIndex++;

      let activeIngredientSubstance = fn.head(activeIngredient).xpath("*:ingredientSubstance");
      let activeSubstanceName = fn.head(activeIngredientSubstance).xpath("*:name/string()");
      let activeSubstanceCode = fn.head(activeIngredientSubstance).xpath("*:code/@code/string()");
      let activeSubstanceFDALink = "https://fdasis.nlm.nih.gov/srs/unii/" + activeSubstanceCode

      var activeIngredientsObject = {

        "activeSubstanceName" : activeSubstanceName,
        "activeSustanceCode" : activeSubstanceCode,
        "activeSubstanceFDALink" : activeSubstanceFDALink
      }

      activeIngredientsArray.push(activeIngredientsObject)
      activeIngredientCodesArray.push( activeSubstanceCode.toString() );
    }

    // Build a drug fingerprint based on active ingredient codes
    let activeIngredientCodeList = activeIngredientCodesArray.slice();
    activeIngredientCodeList.sort();
    activeIngredientCodeList = activeIngredientCodeList.filter(onlyUnique);
    let drugFingerprint = fn.stringJoin(activeIngredientCodeList, "-")

    var drugInstance = {
      "drugName" : name.trim(),
      "drugFingerprint": drugFingerprint,
      "productType" : "manufacturedProduct",
      "zipImageURLkey": imageID,
      "zipImageURLs": imageUris,
      "genericMedicineName" : genericMedicineName,
      "activeIngredients" : Array.from(new Set(activeIngredientsArray)),
      "drugIngredients" : drugIngredients,
      "adverseReactions":adverseReactions,
      "description":description,
      "warnings":warnings,
      "indications":indications,
      "$type": "Drug",
      "$version": "0.0.1",
      "id": fn.concat((fn.substringBefore(fn.head(id), ".")), "." , "json")
    }

    Object.assign(drug,drugInstance )
  }


  let terms = drug.drugName;
  let enrichment = {};
  enrichment.preferredName = drug.drugName;
  enrichment.query =
  cts.wordQuery(
    terms, ["case-insensitive", "diacritic-insensitive", "stemmed", "punctuation-insensitive", "whitespace-insensitive"]
    ).toObject();

  drug.enrichment = enrichment;
  return drug

}

module.exports = {
  createContent: createContent
};
