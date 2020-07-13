/* Registers react components for each Entity.

   You should update entityConfig.js to have the full list of Entities. This will boostrap the system so it can
   perform required processing here, such as registering all components.

   Typically, one would not directly edit this file.
 */

 import { createStore } from 'redux'

class EntityRegistry {

    static registry(state = {}, action) {
        switch (action.type) {
          case 'REGISTER':
            state[action.name] = action.class;
            return state;
          case 'GET':
            return state[action.name];
          default:
            return state
        }
    }

    static getClass(name) {
        return EntityRegistry.registryStore.getState()[name];
    }

    static getAllClasses() {
        const allClasses = [];
        for (var name in EntityRegistry.registryStore.getState()) {
            if (Object.prototype.hasOwnProperty.call(EntityRegistry.registryStore.getState(), name)) {
                allClasses.push(EntityRegistry.registryStore.getState()[name]);
            }
        }
        return allClasses;
    }

}

EntityRegistry.registryStore = createStore(EntityRegistry.registry);

export default EntityRegistry