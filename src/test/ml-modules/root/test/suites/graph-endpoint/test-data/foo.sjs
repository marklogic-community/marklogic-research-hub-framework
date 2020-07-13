const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class FooConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        const author = this.entity.envelope.instance.Author ||
            this.entity.envelope.instance.author ||
            this.entity.envelope.instance;
        return author.personName;
    }

    getType() {
        return 'foo';
    }

    getContent() {
        const content = this.entity.envelope.instance.Author
            || this.entity.envelope.instance.author
            || this.entity.envelope.instance;
        return content;
    }

    isEnrichable() {
      return false;
    }

    getRelatedCoAuthors(entityURI){
        var params = {
          "Entity": sem.iri(entityURI),
          "Authored":  sem.iri("PRH:authored"),
          "PreferredName":  sem.iri("PRH:preferredName"),
          "EntityType": sem.iri("PRH:entityType")
        }
        const sparql = `SELECT DISTINCT ?uri ?preferredName ?entityType ?strength
        WHERE
        { ?Entity  ?Authored ?publication .
          ?uri ?Authored ?publication.
          ?uri ?PreferredName ?preferredName.
          ?uri ?EntityType ?entityType.
          OPTIONAL{?Entity ?strength ?uri }
        }`

        //ML restricted to mastered authors
        let result = (sem.sparql(sparql,params,"map",sem.store([],cts.andQuery([cts.collectionQuery("authorProcessed")]))))
        if (xdmp.logLevel() == "debug") {
          meters = xdmp.queryMeters();
          logMeterStats("getRelatedCoAuthors", entityURI, "", meters);
        }
        return result.toArray();
    }

    getRelationships(type, entityURI) {
        let relationships = [];

        //institutions
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "affiliatedWith"))

        //authors
        relationships = relationships.concat(this.getRelatedCoAuthors(entityURI))

        //topics
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "wroteAbout"))

        //publications
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "authored"))

        return relationships
    }

    getPredicates() {
        return [
            'PRH:wroteAbout',
            'PRH:affiliatedWith',
            'PRH:authored',
            'PRH:authorFrequent',
            'PRH:authorOccasional',
            'PRH:authorSeldom'
        ];
    }

    getCollection() {
        return 'Foo';
    }

    getBoostQuery(entity, weight) {
      return cts.elementValueQuery(
        fn.QName("","authorPreferredName"),
        entity.xpath('./preferredName'),
        ["exact"],
        weight
      )
    }
}
