import Entity from '../Entity';

const icon = require('../../images/briefcase-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Department extends Entity {

  getGraphTitle() {
    let title = 'Title';
    if (this.entity && this.entity.departmentName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.departmentName) +
        '</p>';
    }

    return title;
  }

  static getInstance(data) {
    return new Department(data);
  }

  static getEntityName() {
    return 'Department';
  }

  static getGraphColor() {
    return '#ffffcc';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-building uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      department: {
        color: Department.getGraphColor(),
        shape: Department.getGraphShape(),
        image: Department.getGraphIcon()
      },
      departmentrecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Department.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Department.getGraphShape(),
        image: Department.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      department: 'department',
      departmentrecommendation: 'department'
    };
  }

  static getSearchReducerNamespace() {
    return 'departmentSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default Department;
