const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class EmployeeConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return `${this.entity.envelope.instance.employee.firstName} ${this.entity.envelope.instance.employee.lastName}`;
    }

    getType() {
        return 'employee';
    }

    getContent() {
        return this.entity.envelope.instance.employee;
    }

    isEnrichable() {
       return false;
    }

    getRelationships(type, entityURI) {
        let relationships = [];
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "hasDepartment"));
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "hasJobReview"));
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "hasResume"));
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "hasSkill"));
        return relationships;
    }

    getPredicates() {
        return [
          "PRH:hasDepartment",
          "PRH:hasJobReview",
          "PRH:hasResume",
          "PRH:hasSkill",
        ];
    }

    getCollection() {
        return 'employee';
    }

    getBoostQuery(entity, weight) {
        return cts.falseQuery()
    }
}
