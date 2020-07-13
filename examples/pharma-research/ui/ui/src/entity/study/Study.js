import Entity from '../Entity';

const icon = require('../../images/syringe.svg');

class Study extends Entity {

  getGraphTitle() {
    let title = null;
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';

      if (this.entity.nctId) {
        title += Entity.valueToTitle(this.entity.nctId, 'NCT Id');
      }

      if (this.entity.drugs) {
        title += Entity.arrayToTitle(this.entity.drugs, null, 'Drugs');
      }
    }

    return title;
  }

  static getInstance(data) {
    return new Study(data);
  }

  static getEntityName() {
    return 'Study';
  }

  static getGraphColor() {
    return '#fae8b4';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-syringe uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      study: {
        color: Study.getGraphColor(),
        image: Study.getGraphIcon(),
        imagePadding: 5,
        shape: Study.getGraphShape()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      study: 'study',
      studyrecommendation: 'study'
    };
  }

  static getSearchReducerNamespace() {
    return 'studySearch';
  }

  static getWorkspacePredicates() {
    return ['isExpert','isPostDoctor', 'isRelevant'];
  }

}

export default Study;
