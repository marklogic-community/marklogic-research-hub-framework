import Concept from '../Concept';

const icon = require('../../images/crosshairs-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class ActiveIngredient extends Concept {

  getGraphTitle() {
    return this.concept.preferredName;
  }

  static getInstance(data) {
    return new ActiveIngredient(data);
  }

  static getConceptName() {
    return 'ActiveIngredient';
  }

  static getGraphColor() {
    return '#3D87CB';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getGraphGroupOptions() {
    return {
      activeingredient: {
        color: ActiveIngredient.getGraphColor(),
        image: ActiveIngredient.getGraphIcon(),
        shape: ActiveIngredient.getGraphShape()
      },
      activeingredientrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: ActiveIngredient.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: ActiveIngredient.getGraphShape(),
        image: ActiveIngredient.getGraphIcon(),
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {};
  }

}

export default ActiveIngredient;
