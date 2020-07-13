/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, options) {

    const pub = require("/lib/pubMedHelper.sjs");
    const authorAffiliationCreator = require("/lib/createAuthorAffiliation.sjs");

    let results = [];

    let authorDoc = {};

    const json = require('/MarkLogic/json/json.xqy');
    let config = json.config('custom');
    config.whitespace = 'ignore';

    const doc = (cts.doc(id)).root.toObject();

    let authors = doc.envelope.instance.metadata.authors;
    //Check to if they are any authors for the publiction
    if (authors) {
        let authorsIndex = 0;

        let trimId = id.split('.').slice(0, -1).join('.');
        let pubname = trimId + ".xml";
        let publicationEntities = [];
        let publicationEntity = {
            uri: pubname,
            preferredName: doc.envelope.instance.metadata.title
        };
        publicationEntities.push(publicationEntity);
        //for all authors for the publication create author doc

        authors.forEach(author => {
            authorsIndex++;
            let PersonSurName = author.last;
            let PersonGivenName = author.first;
            // let PersonEmail = fn.head(author).xpath("*:email/string()");

            // ignore author entries that doesn't have a surname and given name
            if (!PersonSurName && !PersonGivenName) {
              return;
            }

            let filename = "/author/" + authorsIndex + trimId + ".json";
            //Get an array of affiliations for this doc
            let affiliation = null;

            let affiliations = [];

            if (author.affiliation && (author.affiliation.laboratory || author.affiliation.institution)) {
              affiliation = {
                organizationDivision: author.affiliation.laboratory,
                organizationName: author.affiliation.institution
              };
              if (author.affiliation.location) {
                affiliation.organizationCity = author.affiliation.location.settlement;
                affiliation.organizationCountry = author.affiliation.location.country;
              }
              affiliations.push(affiliation);
            }

            //get coauthors for
            let thisAuthorName = pub.getAuthorName(PersonGivenName, PersonSurName);
            let coAuthors = authors.map(a => `${a.first} ${a.last}`);
            let coAuthorsArray = [];

            coAuthors.forEach(function (coAuthor) {
                if (thisAuthorName !== coAuthor) {
                    let coAuthorJson = {
                        "author": coAuthor
                    };

                    coAuthorsArray.push(coAuthorJson);
                }
            });

            //get topics for author
            let topics = [];
            // let keywordsArray = (doc.xpath("//*:kwd-group/*:kwd/string()")).toArray();
            // keywordsArray.forEach(function (keyword) {
            //     let topic = {
            //         "topic": keyword
            //     };

            //     topics.push(topic);
            // });

            authorDoc = {
                "$type": "Author",
                "$version": "0.0.3",
                "$attachments": null,
                "docId": filename,
                "personName": thisAuthorName,
                "personSurName": PersonSurName,
                "personGivenName": PersonGivenName,
                // "personEmail": PersonEmail,
                "publications": [pubname],
                "publicationEntities": publicationEntities,
                "coAuthors": coAuthorsArray,
                "affiliations": affiliations,
                "topics": topics
            };

            results.push(authorDoc)
        });

        return results
    }
}


module.exports = {
    createContent: createContent
};
