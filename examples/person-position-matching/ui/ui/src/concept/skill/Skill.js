import Concept from '../Concept';

const icon = require('../../images/book-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Skill extends Concept {

  getGraphTitle() {
    return this.concept.preferredName;
  }

  static getInstance(data) {
    return new Skill(data);
  }

  static getConceptName() {
    return 'Skill';
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
        skill: {
            color: Skill.getGraphColor(),
            shape: Skill.getGraphShape(),
            image: Skill.getGraphIcon()
          },
          skillrecommendation: {
            borderWidth: recommendationBorderSize,
            shapeProperties: {
              useBorderWithImage: true
            },
            color: {
              background: Skill.getGraphColor(),
              border: recommendationBorderColor
            },
            shape: Skill.getGraphShape(),
            image: Skill.getGraphIcon()
        }
    }
  }

  static getGraphGroupPrefixes() {
    return {};
  }

}

export default Skill;
