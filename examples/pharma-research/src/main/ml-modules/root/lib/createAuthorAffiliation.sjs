'use strict';
const json = require('/MarkLogic/json/json.xqy');
const config = json.config('custom');

/*
Returns an array of author affiliations based on the affiliation reference
 */
function getAuthorAffiliations(author, doc) {
    let authorAffiliationsReferences = fn.head(author).xpath("(*:xref[@ref-type=('aff')]/@rid)");
    let affiliations = [];

    //check to see if this document publications has reference id mapping it to the affiliation else assume all the authors are from the same affiliations on the documents
    if (fn.exists(authorAffiliationsReferences)) {
        //for each affiliation reference key  create the affiliation sections

        for (let authorAffiliationReference of authorAffiliationsReferences) {

            let attrID = fn.string(authorAffiliationReference);
            let affiliationsXMLs = fn.head(doc).xpath("//*:aff").toArray();

            Object.keys(affiliationsXMLs).forEach(function (key) {
                let affiliationsXML = affiliationsXMLs[key];
                let authorAffId = fn.string(affiliationsXML.xpath("./@id"));

                //check if the aff id = to the author aff reference
                if (authorAffId === attrID) {

                    let institution = affiliationsXML.xpath(".//*:institution/string()");
                    let address = affiliationsXML.xpath(".//*:addr-line/string()");
                    let country = affiliationsXML.xpath(".//*:country/string()");

                    if (!fn.empty(address) && !fn.empty(institution) && !fn.empty(country)) {
                        let affiliationJson = (json.transformToJson(fn.head(affiliationsXML), config)).toObject();
                        let affiliation = {
                            organizationDivision: "",
                            organizationName: affiliationJson.aff.institution,
                            organizationCity: affiliationJson.aff["addr-line"],
                            organizationCountry: affiliationJson.aff.country
                        };

                        addAffiliationToList(affiliations, affiliation);
                    } else {
                        let affiliation = getAffiliation(affiliationsXML);
                        addAffiliationToList(affiliations, affiliation);
                    }
                }
            });
        }
    }
    else {
        // when authors have no affiliation ids we assumes the  affiliations is the same floor the authors on the pubmed doc
        let affiliationsXMLs = doc.xpath("//*:aff") ? fn.head(doc).xpath("//*:aff") : null;

        for (let affiliationsXML of affiliationsXMLs) {

            let institution = affiliationsXML.xpath(".//*:institution/string()");
            let address = affiliationsXML.xpath(".//*:addr-line/string()");
            let country = affiliationsXML.xpath(".//*:country/string()");

            if (!fn.empty(address) && !fn.empty(institution) && !fn.empty(country)) {

                let affiliationJson = (json.transformToJson(fn.head(affiliationsXML), config)).toObject();
                let affiliation = {
                    organizationDivision: "",
                    organizationName: affiliationJson.aff.institution,
                    organizationCity: affiliationJson.aff["addr-line"],
                    organizationCountry: affiliationJson.aff.country
                };

                addAffiliationToList(affiliations, affiliation);
            } else {
                let affiliation = getAffiliation(affiliationsXML);
                addAffiliationToList(affiliations, affiliation);
            }
        }
    }

    return affiliations
}

function isAffiliationInList(affiliationList, organizationName) {
    for (var i=0; i < affiliationList.length; i++) {
        let affiliation = affiliationList[i];

        if (affiliation.organizationName == organizationName) {
            return true;
        }
    }

    return false;
}

function addAffiliationToList(affiliationList, affiliation) {
    // add the affiliation only
    // if is not-null
    if (!affiliation) {
        return;
    }
    // has an organization name
    if (!affiliation.organizationName || affiliation.organizationName.length <= 0) {
        return;
    }
    // organization name is not single word
    if (affiliation.organizationName.split(/\s/).length <= 1) {
        return;
    }
    // is not a duplicate
    if (isAffiliationInList(affiliationList, affiliation.organizationName)) {
        return;
    }

    affiliationList.push(affiliation);
}

/*
This function extract affiliation info into a json object. When the department and organization info is not wrapped,
all affiliation i.e department, organization, city and Country are written to one property (loc), otherwise, an
institute property is added with an array containing the department and organization info, and only city and country
info are included in the loc property value.
 */
function getAffiliation(affiliationsXML) {

    let instElem = affiliationsXML.xpath(".//*:institution-wrap/institution/string()");
    let cityCountry = affiliationsXML.xpath("text()");

    if (instElem && cityCountry) {
        if (fn.empty(instElem)) {

            if (cityCountry.toArray().length === 2) {
                let affiliationStr = fn.replace(cityCountry.toArray().join(), "\\n", "");
                return extractNonWrappedAffiliation(affiliationStr);
            } else {
                let affiliationStr = fn.replace(cityCountry.toArray().join(""), "\\n", "");
                if (affiliationStr.length > 0) {
                    return extractNonWrappedAffiliation(affiliationStr);
                }
            }
        } else {
            return extractAffiliationWithWrappedInstitution(instElem, cityCountry);
        }

    }

}

/*
Normalizes the city string by replacing all strings that may have been tokenized
as part of city name but are not e.g city code
 */
function normalizeCityString(cityStr) {
    let cityItems = fn.tokenize(cityStr, " ").toArray();
    let sansDigits = [];
    cityItems.forEach(function (str) {
        let normItem = fn.normalizeSpace(str);
        let isNumber = /\d/.test(normItem);
        if (!isNumber && normItem.length > 3) {
            sansDigits.push(normItem)
        }
    });

    if (fn.contains(sansDigits.join(" "), "Cédex") ||
        fn.contains(sansDigits.join(" "), "Cedex") ||
        fn.contains(sansDigits.join(" "), "cedex"
        )) {
        return fn.replace(sansDigits.join(" "), sansDigits[sansDigits.length - 1], "");
    } else if (sansDigits.length > 1) {
        return sansDigits[sansDigits.length - 1];
    } else {

        return sansDigits.join(" ");
    }
}

/*
Cleans up the country string by removing all strings that are not part of country e.g state name or regions
 */
function normalizeCountryString(countryName) {

    let countryStrArr = fn.tokenize(fn.normalizeSpace(countryName), ",").toArray();

    if (countryStrArr.length <= 2) {
        return countryStrArr[countryStrArr.length - 1];

    } else {
        let sansNumbers = [];
        countryStrArr.forEach(function (str) {
            let normItem = fn.normalizeSpace(str);
            let isNumber = /\d/.test(normItem);
            if (!isNumber) {
                sansNumbers.push(normItem)
            }

        });

        if (sansNumbers.length === 2) {
            return sansNumbers[sansNumbers.length - 1];
        } else if (
            fn.startsWith(sansNumbers.join(" "), "Republic of") ||
            fn.startsWith(sansNumbers.join(" "), "Kingdom of") ||
            fn.startsWith(sansNumbers.join(" "), "People’s Republic of") ||
            fn.startsWith(sansNumbers.join(" "), "The")
        ) {
            return sansNumbers.join(" ");

        } else {
            return sansNumbers[sansNumbers.length - 1];
        }
    }
}

/*
This function handles the extraction of affiliation info from affiliation elements with wrapped institution element
 */
function extractAffiliationWithWrappedInstitution(institutionElement, locationElement) {
    locationElement = locationElement.toString();

    //Has both institutions and location info(city country)
    let institutionElements = institutionElement.toArray();
    let department = fn.replace(institutionElements[0], ",([^,]*)$", "");
    let orgname = fn.replace(institutionElements[1], ",([^,]*)$", "");

    let locInfoContents = fn.tokenize(locationElement, ",").toArray();

    let cityStr = locInfoContents[locInfoContents.length - 2];
    let countryStr = locInfoContents[locInfoContents.length - 1];


    let cityName = normalizeCityString(cityStr);
    //let countryName = normalizeCountryString(countryStr);

    let affiliationStr = fn.concat(fn.replace(institutionElements.join(), ", ,", ","), locationElement);
    let countryName = extractCountry(affiliationStr)

    return {
        organizationDivision: fn.normalizeSpace(department),
        organizationName: fn.normalizeSpace(orgname),
        organizationCity: fn.normalizeSpace(cityName),
        organizationCountry: fn.normalizeSpace(countryName)
    };

}

function extractInstitution(modified) {
    let instStrItems = [];
    for (let str of modified) {
        const hasNumber = /\d/;
        let isNumber = hasNumber.test(str);
        if (!isNumber) {
            instStrItems.push(str)
        }
    }
    let dept;
    let organization = "";
    for (let item of instStrItems) {

        if (fn.contains(item.toLowerCase(), "university") ||
            fn.contains(item.toLowerCase(), "universidade") ||
            fn.contains(item.toLowerCase(), "universiti") ||
            fn.contains(item.toLowerCase(), "université") ||
            fn.contains(item.toLowerCase(), "universidad") ||
            fn.contains(item.toLowerCase(), "universitaire") ||
            fn.contains(item.toLowerCase(), "universitas") ||
            fn.contains(item.toLowerCase(), "universität") ||
            fn.contains(item.toLowerCase(), "foundation") ||
            fn.contains(item.toLowerCase(), "organization") ||
            fn.contains(item.toLowerCase(), "corporation") ||
            fn.contains(item.toLowerCase(), "authority") ||
            fn.contains(item.toLowerCase(), "academy") ||
            fn.contains(item.toLowerCase(), "ministry") ||
            fn.contains(item.toLowerCase(), "virginia tech") ||
            (fn.contains(item.toLowerCase(), "institute") && !fn.contains(item.toLowerCase(), "national institutes of health")&& !fn.contains(item.toLowerCase(), "virginia"))  ||
            //fn.contains(item.toLowerCase(), "ltd") ||
            
            fn.contains(item.toLowerCase(), "inc.") ||
            fn.contains(item.toLowerCase(), "region")) {

            organization = item;
            //dept = fn.concat(fn.substringBefore(instStrItems.join(), item), fn.substringAfter(instStrItems.join(), item));
            dept = fn.substringBefore(instStrItems.join(), item);
            break;
        }

        if (
            fn.contains(item.toLowerCase(), "hospital") ||
            fn.contains(item.toLowerCase(), "hôpital")


        //fn.contains(item, "Centre") ||
        //fn.contains(item, "College") ||
        ) {
            organization = item;
            dept = fn.concat(fn.substringBefore(instStrItems.join(), item), fn.substringAfter(instStrItems.join(), item));
            //dept = fn.substringBefore(affJsonObject, item);
            break;
        }

        if (organization &&
            fn.contains(item.toLowerCase(), "department") ||
            fn.contains(item.toLowerCase(), "institute") ||
            fn.contains(item.toLowerCase(), "unit") ||
            fn.contains(item.toLowerCase(), "school") ||
            fn.contains(item.toLowerCase(), "faculty") ||
            fn.contains(item.toLowerCase(), "unité")
        ) {
            dept = item;
            //organization = instStrItems[instStrItems.indexOf(item) + 1];
            continue;

        }
        //assign the remaining item as the Organization
        if (!organization || !dept) {
            if (instStrItems.length === 1) {
                organization = "";
            } else {
                dept = instStrItems[0];
                organization = instStrItems[1];
            }
        }
    }
    return {dept, organization};
}

/*
This function handles affiliation elements with no wrapped institution elements
 */
function extractNonWrappedAffiliation(affiliationStr) {

    let affiliationStringItems = fn.tokenize(affiliationStr, ",").toArray();


    let cityStr = affiliationStringItems[affiliationStringItems.length - 2];
	
    let city = normalizeCityString(cityStr);

    let country = affiliationStringItems[affiliationStringItems.length - 1];
	
    //let countryName = normalizeCountryString(country);
    let countryName = extractCountry(affiliationStr);

    let modified = fn.subsequence(xdmp.arrayValues(affiliationStringItems), 1, affiliationStringItems.length - 2).toArray();

    let {dept, organization} = extractInstitution(modified);

    return {
	   
        organizationDivision: fn.normalizeSpace(fn.replace(dept, ",([^,]*)$", "")),
        organizationName: fn.normalizeSpace(organization),
        organizationCity: fn.normalizeSpace(city),
        organizationCountry: fn.normalizeSpace(countryName)
    };
}

function handleAffiliationsWithoutReferences(affiliationsXMLs) {

    config.whitespace = 'ignore';

    let extractedAffiliations = []
    if (fn.exists(affiliationsXMLs)) {

        for (let affXML of affiliationsXMLs) {
            //let affiliation = authAff.getAffiliation(affXML);
            let instElem = affXML.xpath(".//*:institution-wrap/institution/string()");
            let cityCountry = affXML.xpath("text()");
            let authorAffiliationReferenceJson = (json.transformToJson(affXML, config)).toObject();
			
            let deptName;
            let orgName;

            if (!fn.empty(instElem)) {

                if (instElem.toArray().length == 2) {
                    deptName = instElem.toArray()[0]
                    orgName = instElem.toArray()[1];
                } else {
                    orgName = instElem.toArray()[0];
                }
                let country = fn.tokenize(cityCountry.toArray(" "), ",").toArray();
                let countryName = country[country.length - 1];

                let city = fn.replace(cityCountry, countryName, "");
                let cityName = normalizeCityString(city);
                extractedAffiliations.push({
                    organizationDept: deptName,
                    organizationName: orgName,
                    city: cityName,
                    country: countryName
                });

            } else {
                if (authorAffiliationReferenceJson.aff._value) {// has _value
                    //resArray.push(authorAffiliationReferenceJson) ;
					
                    let organization = extractNonWrappedAffiliation(authorAffiliationReferenceJson.aff._value);
                    extractedAffiliations.push(organization);
                } else if (authorAffiliationReferenceJson.aff.institution) {//has institution
                    let deptOrg = authorAffiliationReferenceJson.aff.institution
                    let cityCountry = authorAffiliationReferenceJson.aff["addr-line"];
                    let affStr = deptOrg + ', ' + cityCountry;

                    let country = fn.tokenize(cityCountry.toArray().join(" "), ",").toArray();
                    let countryName = country[country.length - 1];
                    let city = fn.replace(cityCountry, countryName, "");
                    let cityName = normalizeCityString(city);

                    let modifiedDeptOrg = fn.tokenize(deptOrg, ",").toArray()
                    let org = modifiedDeptOrg[modifiedDeptOrg.length - 1];
                    let dept = fn.substringBefore(modifiedDeptOrg.join(), org);

                    extractedAffiliations.push({
                        organizationDept: dept,
                        organizationName: org,
                        city: cityName,
                        country: countryName,
                        all: affStr
                    })

                } else {
                    /* aff property value contains the affiliation string */
                    let organization = extractNonWrappedAffiliation(authorAffiliationReferenceJson.aff);
                    extractedAffiliations.push(organization);
                }
            }
        }
    }
    return extractedAffiliations;
}

function getCountry(stringArr) {
    let items = stringArr
    let numberless = []

    items.forEach(function (str, key) {
        let normItem = fn.normalizeSpace(str);
        let isNumber = /\d/.test(normItem);
        if (!isNumber && normItem.length > 0) {
            if (
                fn.contains(normItem, "Republic") ||
                fn.contains(normItem, "Kingdom") ||
                fn.contains(normItem, "People’s") ||
                fn.contains(normItem, "of") ||
                fn.contains(normItem, "The")
            ) {
                numberless.push(normItem)
            } else {
                //if (normItem.length == 1) {
                numberless.push(normItem)
                //}
            }
        }
    });

    if (numberless.length == 1) {
        return fn.distinctValues(numberless.join());
    } else if (numberless.length == 2) {
        let firstItem = numberless[0];
        if (firstItem === "New" ||
            firstItem === "South" ||
            firstItem === "Sri" ||
            firstItem === "Russian" ||
            firstItem === "The" ||
            firstItem === "Saudi" ||
            firstItem === "Hong") {
            return numberless.join(" ");
        } else {
            return numberless[1];
        }
    } else {
        return fn.distinctValues(numberless[numberless.length - 1]);
    }
}

function extractCountry(affiliationStr) {

    let countryName;
    let isEmpty = /^\s*$/.test(affiliationStr)
    if (affiliationStr && !isEmpty) {
        let affStrArr = fn.tokenize(fn.replace(affiliationStr, ", ", ","), ",")
        for (let strItem of affStrArr) {
            let isNumber = /\d/.test(strItem);
            if (isNumber && affStrArr.toArray().indexOf(strItem) === affStrArr.toArray().length - 1) {

                let cntyElems = fn.tokenize(strItem, " ")
                countryName = getCountry(cntyElems.toArray());
                break;
            } else if (affStrArr.toArray().indexOf(strItem) === affStrArr.toArray().length - 1) {

                let cntyElems = fn.tokenize(strItem, " ")

                countryName = getCountry(cntyElems.toArray());
                break;
            } else {
                //Contains all apart from country info, could be used to extract other aff items
                // countries.push(strItem)
            }
        }
    }
    return countryName;
}

module.exports = {
    extractCountry: extractCountry,
    extractInstitution: extractInstitution,
    getAffiliation: getAffiliation,
    normalizeCityString: normalizeCityString,
    handleAffiliationsWithoutReferences: handleAffiliationsWithoutReferences,
    extractAffiliationWithWrappedInstitution: extractAffiliationWithWrappedInstitution,
    extractNonWrappedAffiliation: extractNonWrappedAffiliation,
    getAuthorAffiliations: getAuthorAffiliations
};