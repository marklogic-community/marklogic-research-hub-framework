const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class JobOpeningConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.jobopening.jobTitle;
    }

    getType() {
        return 'jobopening';
    }

    getContent() {
        return this.entity.envelope.instance.jobopening;
    }

    isEnrichable() {
        return false;
    }

    getRelationships(type, entityURI) {
        let relationships = [];
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "requiresSkill"));
        return relationships;
    }

    getPredicates() {
        return [
          "PRH:requiresSkill",
        ];
    }

    getCollection() {
        return 'jobopening';
    }

    getBoostQuery(entity, weight) {
       return cts.falseQuery()
    }
}
