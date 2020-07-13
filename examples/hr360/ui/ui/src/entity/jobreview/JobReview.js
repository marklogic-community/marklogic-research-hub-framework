import Entity from '../Entity';

const icon = require('../../images/star-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class JobReview extends Entity {

  getGraphTitle() {
    let title = 'Job Review';
    if (this.entity && this.entity.reviewCode) {
      title =
        '<p><b>Job Review: </b>' +
        Entity.truncateTitle(this.entity.reviewCode) +
        '</p>';
    }

    return title;
  }

  static getInstance(data) {
    return new JobReview(data);
  }

  static getEntityName() {
    return 'JobReview';
  }

  static getGraphColor() {
    return '#ccffff';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-star uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      jobreview: {
        color: JobReview.getGraphColor(),
        shape: JobReview.getGraphShape(),
        image: JobReview.getGraphIcon()
      },
      jobreviewrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: JobReview.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: JobReview.getGraphShape(),
        image: JobReview.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      jobreview: 'jobreview',
      jobreviewrecommendation: 'jobreview'
    };
  }

  static getSearchReducerNamespace() {
    return 'jobreviewSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default JobReview;
