import Entity from '../Entity';

const icon = require('../../images/dna-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Gene extends Entity {

  getGraphTitle() {
    let title = null;
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';

      if (this.entity.alternateFullNames) {
        title += Entity.arrayToTitle(
          this.entity.alternateFullNames,
          null,
          'Alt Names'
        );
      }

      if (this.entity.geneType) {
        title += Entity.valueToTitle(this.entity.geneType, 'Gene Type');
      }
    }

    return title;
  }

  static getInstance(data) {
    return new Gene(data);
  }

  static getEntityName() {
    return 'Gene';
  }

  static getGraphColor() {
    return '#fed9a6';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-dna uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      gene: {
        color: Gene.getGraphColor(),
        shape: Gene.getGraphShape(),
        image: Gene.getGraphIcon()
      },
      generecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Gene.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Gene.getGraphShape(),
        image: Gene.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      gene: 'gene',
      generecommendation: 'gene'
    };
  }

  static getSearchReducerNamespace() {
    return 'geneSearch';
  }

  static getWorkspacePredicates() {
    return ['isAbout', 'isRelevant'];
  }

}

export default Gene;
