const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class ResumeConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return `${this.entity.envelope.instance.resume.employeeName} Resume`;
    }

    getType() {
        return 'resume';
    }

    getContent() {
        return this.entity.envelope.instance.resume;
    }

    isEnrichable() {
        return false;
    }

    snippet(result, ctsQuery, options) {
      const snippeting = require('/lib/snippeting.xqy');
      return snippeting.build(this.getContent(), ctsQuery, Sequence.from([]))
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
        return 'resume';
    }

    getBoostQuery(entity, weight) {
       return cts.falseQuery()
    }
}
