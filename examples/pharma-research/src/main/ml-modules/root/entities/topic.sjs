const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class TopicConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
      //TODO: throw an error
        return 'topic-preferredName';
    }

    getType() {
        return 'topic';
    }

    getContent() {
      //TODO: throw an error
        return 'topic-content';
    }

    isEnrichable() {
      return false;
    }

    getRelationships(type, entityURI) {
        let relationships = [];

        //publication
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "isAbout"));

        //author
        relationships = relationships.concat(this.getRelatedEntitiesWhereObject(entityURI, "wroteAbout"));

        return relationships;
    }

    getPredicates() {
        return [
            'PRH:wroteAbout',
            'PRH:isAbout'
        ];
    }

    getCollection() {
        return 'Topic';
    }

    getBoostQuery(entity, weight) {
      return cts.falseQuery()
    }
}
