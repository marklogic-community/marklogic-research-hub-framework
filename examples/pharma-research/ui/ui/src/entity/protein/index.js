import { default as Protein } from './Protein';
import { default as ProteinDetailView } from './ProteinDetailView';
import { default as ProteinCard } from './ProteinCard';
import { default as ProteinResult } from './ProteinResult';

export default {
    class: Protein,
    plural: 'proteins',
    cardView: ProteinCard,
    detailView: ProteinDetailView,
    resultView: ProteinResult,
    route: '/protein'
}