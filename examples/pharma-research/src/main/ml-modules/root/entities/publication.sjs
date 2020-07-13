var graphLib = require("/lib/graph-lib.sjs");
const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class PublicationConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
      return this.entity.xpath("*:instance/*:publication/*:article/*:articleTitle/text()");
    }

    getType() {
        return 'publication';
    }

    getContent() {
      const json = require('/MarkLogic/json/json.xqy');
      let contentXML = this.entity.xpath("*:instance/*:publication/*:article")
      let config = json.config('custom');
      config['array-element-names'] = [xs.QName('author'),xs.QName('topic'),xs.QName('abstract'),xs.QName('body')]

      config.whitespace = 'ignore';

      return json.transformToJson(contentXML, config).root.article;
    }

    isEnrichable() {
      return false;
    }

    getRelationships(type, entityURI) {
        var relationships = [];

        //authors
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "authored"));

        //topics
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI,"isAbout"));

        //Gene, Drugs, Proteins
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI,"isRelated"));

        return relationships
    }

    getPredicates() {
        return [
            'PRH:isAbout',
            'PRH:isRelated',
            'PRH:isRelevant'
        ];
    }

    getRelatedEntitiesOfMyType(uris, expansionSpec) {
      // if the uri have enrichment query, we get results from a cts.search()
      let ctsResult = super.getRelatedEntitiesOfMyTypeUsingQuery(uris, expansionSpec);

      // we can also get results from sparql
      let sparqlResult = super.getRelatedEntitiesOfMyTypeUsingTriples(uris, expansionSpec);

      // override the sparql results with cts.search() results
      return Object.assign(sparqlResult, ctsResult);
    }

    getDefaultExpansionSpec() {
      return {
        limit : 30
      };
    }

    getCollection() {
        return 'Publication';
    }

    getBoostQuery(entity, weight) {
      return cts.elementValueQuery(
        fn.QName("","articleTitle"),
        entity.xpath('./preferredName'),
        ["exact"],
        weight
      )
    }

    snippet(result, ctsQuery, options) {
      let content = fn.head(result.xpath('/*:envelope/*:instance/element()[fn:name(.) != "info"]'));

      let elementsToAvoid = [
         content.xpath('(//*:AbstractText)[1]'),
         content.xpath('(//*:articleTitle)[1]'),
         content.xpath('(//*:Keyword)'),
         content.xpath('(//*:PubMedPubDate)[1]'),
         content.xpath('(//*:Journal)'),
      ]
      const snippeting = require('/lib/snippeting.xqy');
      return snippeting.build(content, ctsQuery, Sequence.from(elementsToAvoid))
    }
}
