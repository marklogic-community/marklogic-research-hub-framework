import { default as Study } from './Study';
import { default as StudyDetailView } from './StudyDetailView';
import { default as StudyCard } from './StudyCard';
import { default as StudyResult } from './StudyResult';

export default {
    class: Study,
    plural: 'studys',
    cardView: StudyCard,
    detailView: StudyDetailView,
    resultView: StudyResult,
    route: '/study'
}