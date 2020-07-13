import Concept from '../Concept';

const icon = require('../../images/lightbulb-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Topic extends Concept {

  getGraphTitle() {
    return this.concept.preferredName;
  }

  static getInstance(data) {
    return new Topic(data);
  }

  static getConceptName() {
    return 'Topic';
  }

  static getGraphColor() {
    return '#decbe4';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getGraphGroupOptions() {
    return {
        topic: {
            color: Topic.getGraphColor(),
            shape: Topic.getGraphShape(),
            image: Topic.getGraphIcon()
          },
          topicrecommendation: {
            borderWidth: recommendationBorderSize,
            shapeProperties: {
              useBorderWithImage: true
            },
            color: {
              background: Topic.getGraphColor(),
              border: recommendationBorderColor
            },
            shape: Topic.getGraphShape(),
            image: Topic.getGraphIcon()
        }
    }
  }

  static getGraphGroupPrefixes() {
    return {};
  }

}

export default Topic;
