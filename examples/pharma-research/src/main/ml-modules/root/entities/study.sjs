const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class StudyConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.Study.title;
    }

    getType() {
        return 'study';
    }

    getContent() {
        return this.entity.envelope.instance.Study;
    }

    isEnrichable() {
      return false;
    }

    getRelationships(type, entityURI) {
        xdmp.log(`Getting Protein Relationships for ${entityURI}`)
        var relationships = [];

        //drugs
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "targets"));

        //publications
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "isRelated"));

        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "belongsToFamily"));
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "belongsToSubFamily"));
        relationships = relationships.concat(this.getRelatedEntitiesWhereSubject(entityURI, "belongsToSubSubFamily"));

        relationships = relationships.concat(this.getMediatorLinks(entityURI))

        /*
        Taxonomy in protein records of family, subfamily, etc..

        modifiesExpression

        protein family. isRelated can be used

        */

        return relationships;
    }

    getPredicates() {
        return [
            'PRH:isRelated',
            'PRH:isExpert'
        ];
    }

    getCollection() {
        return 'Study';
    }

    getBoostQuery(entity, weight) {
      return cts.falseQuery()
    }
}
