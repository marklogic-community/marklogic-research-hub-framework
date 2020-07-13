import Entity from '../Entity';

const icon = require('../../images/bullseye-solid.svg');
const recommendationBorderColor = '#F4364C';
const recommendationBorderSize = 5;

class Stub extends Entity {

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
    return new Stub(data);
  }

  static getEntityName() {
    return 'Stub';
  }

  static getGraphColor() {
    return '#000000';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-bullseye uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      stub: {
        color: Stub.getGraphColor(),
        shape: Stub.getGraphShape(),
        image: Stub.getGraphIcon()
      },
      stubrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Stub.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Stub.getGraphShape(),
        image: Stub.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      stub: 'stub',
      stubrecommendation: 'stub'
    };
  }

  static getSearchReducerNamespace() {
    return 'stubSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default Stub;
