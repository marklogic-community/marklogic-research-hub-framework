import Entity from '../Entity';

const icon = require('../../images/pills-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Drug extends Entity {

  getGraphTitle() {
    let title = null;
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';

      if (this.entity.genericMedicineName) {
        title += Entity.valueToTitle(
          this.entity.genericMedicineName,
          'Generic Medicine Name'
        );
      }

      if (this.entity.activeIngredients) {
        title += Entity.arrayToTitle(
          this.entity.activeIngredients,
          'activeSubstanceName',
          'Active Ingredients'
        );
      }
    }

    return title;
  }

  static getInstance(data) {
    return new Drug(data);
  }

  static getEntityName() {
    return 'Drug';
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
    return 'fas fa-pills uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      drug: {
        color: Drug.getGraphColor(),
        shape: Drug.getGraphShape(),
        image: Drug.getGraphIcon()
      },
      drugrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Drug.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Drug.getGraphShape(),
        image: Drug.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      drug: 'drug',
      drugrecommendation: 'drug'
    };
  }

  static getSearchReducerNamespace() {
    return 'drugSearch';
  }

  static getWorkspacePredicates() {
    return ['isAbout', 'isRelevant'];
  }

}

export default Drug;