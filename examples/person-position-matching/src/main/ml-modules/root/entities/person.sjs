const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class PersonConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.Person.name;
    }

    getType() {
        return 'person';
    }

    getContent() {
        return this.entity.envelope.instance.Person;
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
          "PRH:hasSkill"
        ];
    }

    getCollection() {
        return 'Person';
    }

    getBoostQuery(entity, weight) {
        return cts.falseQuery()
    }
}
