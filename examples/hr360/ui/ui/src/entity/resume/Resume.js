import Entity from '../Entity';

const icon = require('../../images/file-regular.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Resume extends Entity {

  getGraphTitle() {
    let title = 'Resume';
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Resume: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';
    }

    return title;
  }

  static getInstance(data) {
    return new Resume(data);
  }

  static getEntityName() {
    return 'Resume';
  }

  static getGraphColor() {
    return '#ffccff';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-file uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      resume: {
        color: Resume.getGraphColor(),
        shape: Resume.getGraphShape(),
        image: Resume.getGraphIcon()
      },
      resumerecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Resume.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Resume.getGraphShape(),
        image: Resume.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      resume: 'resume',
      resumerecommendation: 'resume'
    };
  }

  static getSearchReducerNamespace() {
    return 'resumeSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default Resume;
