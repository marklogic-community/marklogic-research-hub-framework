import Entity from '../Entity';

const icon = require('../../images/book-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Publication extends Entity {

  getGraphTitle() {
    let title = null;
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';

        if (this.entity.journal) {
          let journal = this.entity.journal;
          title += Entity.valueToTitle(journal.title, 'Journal');
  
          // Include published date
          if(journal['pub-date']){
            let date =
              journal['pub-date'].year +
              '-' +
              journal['pub-date'].month +
              '-' +
              journal['pub-date'].day;
              title += Entity.valueToTitle(date, 'Publication Date');
            }
        }
    }
    return title;
  }

  static getInstance(data) {
    return new Publication(data);
  }

  static getEntityName() {
    return 'Publication';
  }

  static getGraphColor() {
    return '#fbb4ae';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-book uf-icon';
  }

  static getGraphGroupOptions() {
    return {

      publication: {
        color: Publication.getGraphColor(),
        shape: Publication.getGraphShape(),
        image: Publication.getGraphIcon()
      },
      publicationrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Publication.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Publication.getGraphShape(),
        image: Publication.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      publication: 'publication',
      publicationrecommendation: 'publication',
    };
  }

  static getSearchReducerNamespace() {
    return 'publicationSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}


export default Publication;
