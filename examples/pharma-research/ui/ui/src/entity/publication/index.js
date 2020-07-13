import { default as Publication } from './Publication';
import { default as PublicationDetailView } from './PublicationDetailView';
import { default as PublicationCard } from './PublicationCard';
import { default as PublicationResult } from './PublicationResult';

export default {
    class: Publication,
    plural: 'publications',
    cardView: PublicationCard,
    detailView: PublicationDetailView,
    resultView: PublicationResult,
    route: '/publication'
}