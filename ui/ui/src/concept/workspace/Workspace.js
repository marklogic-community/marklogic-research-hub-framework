import Concept from '../Concept';

const icon = require('../../images/briefcase-medical-solid.svg');

class Workspace extends Concept {

  getGraphTitle() {
    return this.concept.preferredName;
  }

  static getInstance(data) {
    return new Workspace(data);
  }

  static getConceptName() {
    return 'Workspace';
  }

  static getGraphColor() {
    return '#f76c83';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getGraphGroupOptions() {
    return {
        workspace: {
            color: Workspace.getGraphColor(),
            shape: Workspace.getGraphShape(),
            image: Workspace.getGraphIcon()
        }
    }
  }

  static getGraphGroupPrefixes() {
    return {};
  }

}

export default Workspace;
