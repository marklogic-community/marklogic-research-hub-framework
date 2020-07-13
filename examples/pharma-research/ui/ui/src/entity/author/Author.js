import Entity from '../Entity';

const icon = require('../../images/address-card-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Author extends Entity {

  getGraphTitle() {
    let title = null;
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';

      if (this.entity.affiliations) {
        title += Entity.arrayToTitle(
          this.entity.affiliations,
          'organizationName',
          'Institutions'
        );
      }

      if (this.entity.topics) {
        title += Entity.arrayToTitle(
          this.entity.topics,
          'topic',
          'Topic'
        );
      }

      if (this.entity.coAuthors) {
        title += Entity.arrayToTitle(
          this.entity.coAuthors,
          'author',
          'CoAuthors'
        );
      }
    }

    return title;
  }

  static getInstance(data) {
    return new Author(data);
  }

  static getEntityName() {
    return 'Author';
  }

  static getGraphColor() {
    return '#ccebc5';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'far fa-address-card uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      author: {
        color: Author.getGraphColor(),
        shape: Author.getGraphShape(),
        image: Author.getGraphIcon()
      },
      authorrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Author.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Author.getGraphShape(),
        image: Author.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      author: 'author',
      authorrecommendation: 'author'
    };
  }

  static getSearchReducerNamespace() {
    return 'authorSearch';
  }

  static getWorkspacePredicates() {
    return ['isExpert', 'isPostDoctor', 'isRelevant'];
  }

}

export default Author;

