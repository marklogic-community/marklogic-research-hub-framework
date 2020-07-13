/* a Workspace is a special Entity which is built using services or the GUI. Like other entities, it has related entities.
   Unlike other entities, the semantics are that a Workspace is a container of Entities (and someday Concepts) rather than merely
   being related to them.

   Workspaces are Entities, so they can be discovered, linked to and put into other Workspaces. This amounts to a type
   of knowledge sharing among users. Workspaces are typically only visible to the person who created them (based on MarkLogic user).
   This can be customized in the SPARQL and other code, to not limit the Workspaces by user. */

const EntityConfig = require('./entityconfig').EntityConfig;

module.exports = class WorkspaceConfig extends EntityConfig {
    constructor(entity) {
        super(entity);
    }

    getPreferredName() {
        return this.entity.envelope.instance.workspace.name;
    }

    getType() {
        return 'workspace';
    }

    getContent() {
        return this.entity.envelope.instance.workspace;
    }

    isEnrichable() {
      return false;
    }

    getRelationships(type, entityURI) {
        let relationships = [];

        let entitiesObject = this.entity.envelope.instance.workspace.entities.toObject()

        Object.keys(entitiesObject).forEach(function(key) {
            var entityObject = entitiesObject[key]

            let obj = {
                entityType: entityObject.type,
                preferredName: entityObject.preferredName,
                uri: key
            }

            relationships.push(obj)
        });

        return relationships;
    }

    getPredicates() {
        return ['PRH:isRelevant'];
    }

    getCollection() {
        return 'workspace';
    }

    getBoostQuery(entity, weight) {
        return cts.falseQuery()
    }
}
