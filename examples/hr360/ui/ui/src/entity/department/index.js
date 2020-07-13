import { default as Department } from './Department';
import { default as DepartmentDetailView } from './DepartmentDetailView';
import { default as DepartmentCard } from './DepartmentCard';
import { default as DepartmentResult } from './DepartmentResult';

export default {
    class: Department,
    plural: 'departments',
    cardView: DepartmentCard,
    detailView: DepartmentDetailView,
    resultView: DepartmentResult,
    route: '/department'
}
