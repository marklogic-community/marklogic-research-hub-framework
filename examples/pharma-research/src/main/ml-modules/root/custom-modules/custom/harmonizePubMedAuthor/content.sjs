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

    const doc = (cts.doc(id)).root;

    let contributors = doc.xpath("//*:contrib-group");
    //Check to if they are any authors for the publiction
    if (contributors) {
        let authors = doc.xpath("//*:contrib[@contrib-type=('author')]");
        let authorsIndex = 0;

        let trimId = id.split('.').slice(0, -1).join('.');
        let pubname = trimId + ".xml";
        let publicationEntities = [];
        let publicationEntity = {
            uri: pubname,
            preferredName: pub.getPublicationPreferredName(doc)
        };
        publicationEntities.push(publicationEntity);
        //for all authors for the publication create author doc

        for (let author of fn.subsequence(authors, 1, 20)) {

            authorsIndex++;
            let PersonSurName = fn.head(author).xpath("*:name/*:surname/string()");
            let PersonGivenName = fn.head(author).xpath("*:name/*:given-names/string()");
            let PersonEmail = fn.head(author).xpath("*:email/string()");

            // ignore author entries that doesn't have a surname and given name
            if (fn.empty(PersonSurName) && fn.empty(PersonGivenName)) {
                continue;
            }

            let filename = "/author/" + authorsIndex + trimId + ".json";
            //Get an array of affiliations for this doc
            let affiliations = authorAffiliationCreator.getAuthorAffiliations(author, doc);

            //get coauthors for
            let thisAuthorName = pub.getAuthorName(PersonGivenName, PersonSurName);
            let coAuthors = pub.getCoAuthors(id);
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
            let keywordsArray = (doc.xpath("//*:kwd-group/*:kwd/string()")).toArray();
            keywordsArray.forEach(function (keyword) {
                let topic = {
                    "topic": keyword
                };

                topics.push(topic);
            });

            authorDoc = {
                "$type": "Author",
                "$version": "0.0.3",
                "$attachments": null,
                "docId": filename,
                "personName": thisAuthorName,
                "personSurName": PersonSurName,
                "personGivenName": PersonGivenName,
                "personEmail": PersonEmail,
                "publications": [pubname],
                "publicationEntities": publicationEntities,
                "coAuthors": coAuthorsArray,
                "affiliations": affiliations,
                "topics": topics
            };

            results.push(authorDoc)
        }

        return results
    }
}


module.exports = {
    createContent: createContent
};
