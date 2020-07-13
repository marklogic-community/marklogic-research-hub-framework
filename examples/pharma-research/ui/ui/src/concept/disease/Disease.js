import Concept from '../Concept';

const icon = require('../../images/bug-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Disease extends Concept {

  getGraphTitle() {
    return this.concept.preferredName;
  }

  static getInstance(data) {
    return new Disease(data);
  }

  static getConceptName() {
    return 'Disease';
  }

  static getGraphColor() {
    return '#8BBEE8';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getGraphGroupOptions() {
    return {
        disease: {
            color: Disease.getGraphColor(),
            shape: Disease.getGraphShape(),
            image: Disease.getGraphIcon()
          },
          diseaserecommendation: {
            borderWidth: recommendationBorderSize,
            shapeProperties: {
              useBorderWithImage: true
            },
            color: {
              background: Disease.getGraphColor(),
              border: recommendationBorderColor
            },
            shape: Disease.getGraphShape(),
            image: Disease.getGraphIcon()
          }
    }
  }

  static getGraphGroupPrefixes() {
    return {};
  }

}

export default Disease;
