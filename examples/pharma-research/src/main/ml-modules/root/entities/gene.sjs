const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class GeneConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.Gene.fullName;
    }

    getType() {
        return 'gene';
    }

    getContent() {
        return this.entity.envelope.instance.Gene;
    }

    isEnrichable() {
      return true;
    }

    getRelationships(type, entityURI) { // TODO: check if this function is being used
        let relationships = [];

        //diseases
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "impacts"));

        //publications
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "isRelated"));

        return relationships;
    }

    getPredicates() {
        return [
            'PRH:isRelated',
            'PRH:impacts',
            'PRH:hasActiveIngredient',
            'PRH:wasReferredToBy',
            'PRH:isAbout'
        ];
    }

    getCollection() {
        return 'Gene';
    }

    getBoostQuery(entity, weight) {
      return cts.orQuery([
        cts.elementAttributeValueQuery(
          fn.QName("http://marklogic.com/phr/lib/enrichment", "Gene"),
          xs.QName("preferredName"),
          entity.xpath('./preferredName'),
          ["exact"],
          weight
        ),
        cts.jsonPropertyValueQuery(
          "fullName",
          entity.xpath('./preferredName'),
          ["exact"],
          weight
        )
      ])
    }
}
