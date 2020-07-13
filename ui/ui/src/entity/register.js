/**
 * This file exists to register the entities while avoiding a circular dependency
 */
import entityConfig from './entityConfig';
import EntityRegistry from './EntityRegistry';

Object.keys(entityConfig).forEach(key => {
    let config = entityConfig[key];
    let entityClass = config.class;
    EntityRegistry.registryStore.dispatch({ type: 'REGISTER', name: entityClass.getEntityName(), class: entityClass });
})

export default {}