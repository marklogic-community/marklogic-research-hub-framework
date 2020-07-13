import { default as JobOpening } from './JobOpening';
import { default as JobOpeningDetailView } from './JobOpeningDetailView';
import { default as JobOpeningCard } from './JobOpeningCard';
import { default as JobOpeningResult } from './JobOpeningResult';

export default {
    class: JobOpening,
    plural: 'jobopenings',
    cardView: JobOpeningCard,
    detailView: JobOpeningDetailView,
    resultView: JobOpeningResult,
    route: '/jobopening'
}
