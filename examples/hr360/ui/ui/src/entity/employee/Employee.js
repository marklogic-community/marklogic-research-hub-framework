import Entity from '../Entity';

const icon = require('../../images/user-circle-solid.svg');
const recommendationBorderColor = '#f4e842';
const recommendationBorderSize = 5;

class Employee extends Entity {

  getGraphTitle() {
    let title = 'Title';
    if (this.entity && this.entity.preferredName) {
      title =
        '<p><b>Name: </b>' +
        Entity.truncateTitle(this.entity.preferredName) +
        '</p>';
    }

    return title;
  }

  static getInstance(data) {
    return new Employee(data);
  }

  static getEntityName() {
    return 'Employee';
  }

  static getGraphColor() {
    return '#ffcccc';
  }

  static getGraphShape() {
    return 'circularImage';
  }

  static getGraphIcon() {
    return icon;
  }

  static getIcon() {
    return 'fas fa-user uf-icon';
  }

  static getGraphGroupOptions() {
    return {
      employee: {
        color: Employee.getGraphColor(),
        shape: Employee.getGraphShape(),
        image: Employee.getGraphIcon()
      },
      employeerecommendation: {
        borderWidth: recommendationBorderSize,
        shapeProperties: {
          useBorderWithImage: true
        },
        color: {
          background: Employee.getGraphColor(),
          border: recommendationBorderColor
        },
        shape: Employee.getGraphShape(),
        image: Employee.getGraphIcon()
      }
    }
  }

  static getGraphGroupPrefixes() {
    return {
      employee: 'employee',
      employeerecommendation: 'employee'
    };
  }

  static getSearchReducerNamespace() {
    return 'employeeSearch';
  }

  static getWorkspacePredicates() {
    return ['isRelevant'];
  }

}

export default Employee;
