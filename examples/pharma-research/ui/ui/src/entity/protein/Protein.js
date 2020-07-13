import Entity from '../Entity';

const icon = require('../../images/bullseye-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Protein extends Entity {

  getGraphTitle() {
    let title = null;
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';

      if (
        this.entity.similarProtein &&
        this.entity.similarProtein.length > 0
      ) {
        if (this.entity.similarProtein[0].family) {
          title += Entity.valueToTitle(
            this.entity.similarProtein[0].family,
            'Family'
          );
        }
        if (this.entity.similarProtein[0].subfamily) {
          title += Entity.valueToTitle(
            this.entity.similarProtein[0].subfamily,
            'Sub-Family'
          );
        }
        if (this.entity.similarProtein[0].subsubfamily) {
          title += Entity.valueToTitle(
            this.entity.similarProtein[0].subsubfamily,
            'Sub-Sub-Family'
          );
        }
      }

      if (this.entity.gene) {
        title += Entity.valueToTitle(
          this.entity.gene.primaryName,
          'Gene'
        );
      }
    }

    return title;
  }

  static getInstance(data) {
    return new Protein(data);
  }

  static getEntityName() {
    return 'Protein';
  }

  static getGraphColor() {
    return '#f76c83';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-bullseye uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      protein: {
        color: Protein.getGraphColor(),
        image: Protein.getGraphIcon(),
        shape: Protein.getGraphShape()
      },
      proteinrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Protein.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Protein.getGraphShape(),
        image: Protein.getGraphIcon()
      },
      proteinfamily: {
        color: {
          background: Protein.getGraphColor(),
          border: '#333'
        },
        borderWidth: 4,
        image: Protein.getGraphIcon(),
        shape: Protein.getGraphShape()
      },
      proteinfamilyrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Protein.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Protein.getGraphShape(),
        image: Protein.getGraphIcon()
      },
      mediator: {
        color: {
          background: 'orange',
          border: 'darkred'
        },
        borderWidth: 6,
        selectedBorderWidth: 6,
        image: Protein.getGraphIcon(),
        shape: Protein.getGraphShape()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      protein: 'protein',
      proteinrecommendation: 'protein'
    };
  }

  static getSearchReducerNamespace() {
    return 'proteinSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default Protein;
