const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class PositionConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.Position.description;
    }

    getType() {
        return 'position';
    }

    getContent() {
        return this.entity.envelope.instance.Position;
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
          "PRH:requiresSkill"
        ];
    }

    getCollection() {
        return 'Position';
    }

    getBoostQuery(entity, weight) {
       return cts.falseQuery()
    }
}
