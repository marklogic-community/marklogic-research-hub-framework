import Concept from './Concept';

const icon = require('../images/bullseye-solid.svg');
const recommendationBorderColor = '#F4364C';
const recommendationBorderSize = 5;

class Stub extends Concept {

  getGraphTitle() {
    return this.concept.preferredName;
  }

  static getInstance(data) {
    return new Stub(data);
  }

  static getConceptName() {
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
    return {};
  }

}

export default Stub;
