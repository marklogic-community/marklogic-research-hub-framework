const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class ActiveIngredientConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return '';
    }

    getType() {
        return 'activeIngredient';
    }

    getContent() {
        return '';
    }

    isEnrichable() {
      return false;
    }

    getRelationships(type, entityURI) {
        let relationships = [];

        //drug
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "hasActiveIngredient"));

        return relationships;
    }

    getPredicates() {
        return [
            'PRH:hasActiveIngredient'
        ];
    }

    getCollection() {
        return 'ActiveIngredient';
    }

    getBoostQuery(entity, weight) {
      return cts.falseQuery()
    }
}
