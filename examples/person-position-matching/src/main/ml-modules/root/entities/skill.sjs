const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class PositionConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return '';
    }

    getType() {
        return 'skill';
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
          "PRH:requiresSkill",
          "PRH:hasSkill"
        ];
    }

    getCollection() {
        return 'Skill';
    }

    getBoostQuery(entity, weight) {
       return cts.falseQuery()
    }
}
