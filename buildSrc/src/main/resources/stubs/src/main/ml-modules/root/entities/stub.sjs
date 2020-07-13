const EntityConfig = require('./entityconfig').EntityConfig;

/** See superclass EntityConfig for comments on these methods **/

module.exports = class StubConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.Stub.name;
    }

    getType() {
        return 'stub';
    }

    getContent() {
        return this.entity.envelope.instance.Stub;
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
          //for instance: "PRH:hasSkill"
        ];
    }

    getCollection() {
        return 'Stub';
    }

    getBoostQuery(entity, weight) {
        return cts.falseQuery()
    }
}
