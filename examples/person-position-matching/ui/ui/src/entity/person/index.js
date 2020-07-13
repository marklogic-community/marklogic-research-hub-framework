import { default as Person } from './Person';
import { default as PersonDetailView } from './PersonDetailView';
import { default as PersonCard } from './PersonCard';
import { default as PersonResult } from './PersonResult';

export default {
    class: Person,
    plural: 'persons',
    cardView: PersonCard,
    detailView: PersonDetailView,
    resultView: PersonResult,
    route: '/person'
}
