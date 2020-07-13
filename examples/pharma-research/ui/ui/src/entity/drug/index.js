import { default as Drug } from './Drug';
import { default as DrugDetailView } from './DrugDetailView';
import { default as DrugCard } from './DrugCard';
import { default as DrugResult } from './DrugResult';

export default {
    class: Drug,
    plural: 'drugs',
    cardView: DrugCard,
    detailView: DrugDetailView,
    resultView: DrugResult,
    route: '/drug'
}