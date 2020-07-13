import { default as Employee } from './Employee';
import { default as EmployeeDetailView } from './EmployeeDetailView';
import { default as EmployeeCard } from './EmployeeCard';
import { default as EmployeeResult } from './EmployeeResult';

export default {
    class: Employee,
    plural: 'employees',
    cardView: EmployeeCard,
    detailView: EmployeeDetailView,
    resultView: EmployeeResult,
    route: '/employee'
}
