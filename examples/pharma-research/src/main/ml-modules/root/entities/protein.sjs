const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class ProteinConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.Protein.fullName;
    }

    getType() {
        return 'protein';
    }

    getContent() {
        return this.entity.envelope.instance.Protein;
    }

    isEnrichable() {
      return true;
    }

    getRelationships(type, entityURI) {
        var relationships = [];

        //drugs
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "targets"));

        //publications
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "isRelated"));

        relationships = relationships.concat(this.getMediatorLinks(entityURI))

        return relationships;
    }

    getPredicates() {
        return [
            'PRH:isRelated',
            'PRH:wasReferredToBy',
            'PRH:targets',
            'PRH:expressesMediation',
            'PRH:belongsToFamily',
            'PRH:belongsToSubFamily',
            'PRH:belongsToSubSubFamily',
            'PRH:mediationExpressedIn',
            'PRH:isRelevant'
        ];
    }

    getCollection() {
        return 'Protein';
    }

    getBoostQuery(entity, weight) {
      return cts.orQuery([
        cts.elementAttributeValueQuery(
          fn.QName("http://marklogic.com/phr/lib/enrichment", "Protein"),
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
