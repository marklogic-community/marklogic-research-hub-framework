const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class JobReviewConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return `${this.entity.envelope.instance.jobreview.employeeName} Review`;
    }

    getType() {
        return 'jobreview';
    }

    getContent() {
        return this.entity.envelope.instance.jobreview;
    }

    isEnrichable() {
        return false;
    }

    getRelationships(type, entityURI) {
        let relationships = [];

        // no relationships
        //relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "impacts"));

        return relationships;
    }

    getPredicates() {
        return [
        ];
    }

    getCollection() {
        return 'jobreview';
    }

    getBoostQuery(entity, weight) {
       return cts.falseQuery()
    }
}
