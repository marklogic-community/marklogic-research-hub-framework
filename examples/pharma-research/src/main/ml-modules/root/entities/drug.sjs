const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class DrugConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.Drug.drugName;
    }

    getType() {
        return 'drug';
    }

    getContent() {
        return this.entity.envelope.instance.Drug;
    }

    isEnrichable() {
      return true;
    }

    getRelationships(type, entityURI) {
        let relationships = [];

        //activeIngredient
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "hasActiveIngredient"));

        //publications
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "isRelated"));

        return relationships;
    }

    getPredicates() {
        return [
            'PRH:isRelated',
            'PRH:hasActiveIngredient',
            'PRH:wasReferredToBy',
            'PRH:isAbout'
        ];
    }

    getCollection() {
        return 'Drug';
    }

    getBoostQuery(entity, weight) {
      return cts.orQuery([
        cts.elementAttributeValueQuery(
          fn.QName("http://marklogic.com/phr/lib/enrichment", "Drug"),
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
