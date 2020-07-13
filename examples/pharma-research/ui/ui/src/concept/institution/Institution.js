import Concept from '../Concept';

const icon = require('../../images/building-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Institution extends Concept {

  getGraphTitle() {
    return this.concept.preferredName;
  }

  static getInstance(data) {
    return new Institution(data);
  }

  static getConceptName() {
    return 'Institution';
  }

  static getGraphColor() {
    return '#b3cde3';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getGraphGroupOptions() {
    return {
        institution: {
            color: Institution.getGraphColor(),
            shape: Institution.getGraphShape(),
            image: Institution.getGraphIcon()
          },
          institutionrecommendation: {
            borderWidth: recommendationBorderSize,
            shapeProperties: {
              useBorderWithImage: true
            },
            color: {
              background: Institution.getGraphColor(),
              border: recommendationBorderColor
            },
            shape: Institution.getGraphShape(),
            image: Institution.getGraphIcon()
          }
        }
  }

  static getGraphGroupPrefixes() {
    return {};
  }

}

export default Institution;
