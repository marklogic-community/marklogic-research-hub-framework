/* Registers react components for each Concept.

   You should update conceptConfig.js to have the full list of Concepts. This will boostrap the system so it can
   perform required processing here, such as registering all components.

   Typically, one would not directly edit this file.
 */
import { createStore } from 'redux'
import conceptConfig from './conceptConfig'

class ConceptRegistry {

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
        return ConceptRegistry.registryStore.getState()[name];
    }

    static getAllClasses() {
        const allClasses = [];
        for (var name in ConceptRegistry.registryStore.getState()) {
            if (Object.prototype.hasOwnProperty.call(ConceptRegistry.registryStore.getState(), name)) {
                allClasses.push(ConceptRegistry.registryStore.getState()[name]);
            }
        }
        return allClasses;
    }

}

ConceptRegistry.registryStore = createStore(ConceptRegistry.registry);

Object.keys(conceptConfig).forEach(key => {
    let config = conceptConfig[key];
    let conceptClass = config.class;
    ConceptRegistry.registryStore.dispatch({ type: 'REGISTER', name: conceptClass.getConceptName(), class: conceptClass });
})
export default ConceptRegistry