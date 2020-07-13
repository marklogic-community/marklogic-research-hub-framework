import Entity from '../Entity';

const icon = require('../../images/door-open-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class JobOpening extends Entity {

  getGraphTitle() {
    let title = 'Job Opening';
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Job Opening: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';
    }

    return title;
  }

  static getInstance(data) {
    return new JobOpening(data);
  }

  static getEntityName() {
    return 'JobOpening';
  }

  static getGraphColor() {
    return '#ccffcc';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-door-open uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      jobopening: {
        color: JobOpening.getGraphColor(),
        shape: JobOpening.getGraphShape(),
        image: JobOpening.getGraphIcon()
      },
      jobopeningrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: JobOpening.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: JobOpening.getGraphShape(),
        image: JobOpening.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      jobopening: 'jobopening',
      jobopeningrecommendation: 'jobopening'
    };
  }

  static getSearchReducerNamespace() {
    return 'jobopeningSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default JobOpening;
