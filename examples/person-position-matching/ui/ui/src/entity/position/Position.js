import Entity from '../Entity';

const icon = require('../../images/briefcase-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Position extends Entity {

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
    return new Position(data);
  }

  static getEntityName() {
    return 'Position';
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
    return 'fas fa-briefcase uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      position: {
        color: Position.getGraphColor(),
        shape: Position.getGraphShape(),
        image: Position.getGraphIcon()
      },
      positionrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Position.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Position.getGraphShape(),
        image: Position.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      position: 'position',
      positionrecommendation: 'position'
    };
  }

  static getSearchReducerNamespace() {
    return 'positionSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default Position;
