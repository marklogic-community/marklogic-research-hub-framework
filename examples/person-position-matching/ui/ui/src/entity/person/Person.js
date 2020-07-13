import Entity from '../Entity';

const icon = require('../../images/user-circle-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Person extends Entity {

  getGraphTitle() {
    let title = 'Title';
    if (this.entity && this.entity.Name) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.Name) +
        '</p>';
    }

    return title;
  }

  static getInstance(data) {
    return new Person(data);
  }

  static getEntityName() {
    return 'Person';
  }

  static getGraphColor() {
    return '#ffffcc';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-user uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      person: {
        color: Person.getGraphColor(),
        shape: Person.getGraphShape(),
        image: Person.getGraphIcon()
      },
      personrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Person.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Person.getGraphShape(),
        image: Person.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      person: 'person',
      personrecommendation: 'person'
    };
  }

  static getSearchReducerNamespace() {
    return 'personSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default Person;
