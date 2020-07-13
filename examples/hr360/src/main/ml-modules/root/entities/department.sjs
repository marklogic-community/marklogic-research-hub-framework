const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class DepartmentConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.department.departmentName;
    }

    getType() {
        return 'department';
    }

    getContent() {
        return this.entity.envelope.instance.department;
    }

    isEnrichable() {
        return false;
    }

    getRelationships(type, entityURI) {
        let relationships = [];
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "hasJobOpening"));
        return relationships;
    }

    getPredicates() {
        return [
          "PRH:hasJobOpening"
        ];
    }

    getCollection() {
        return 'department';
    }

    getBoostQuery(entity, weight) {
       return cts.falseQuery()
    }
}
