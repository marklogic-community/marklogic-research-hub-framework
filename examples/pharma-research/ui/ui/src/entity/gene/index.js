import { default as Gene } from './Gene';
import { default as GeneDetailView } from './GeneDetailView';
import { default as GeneCard } from './GeneCard';
import { default as GeneResult } from './GeneResult';

export default {
    class: Gene,
    plural: 'genes',
    cardView: GeneCard,
    detailView: GeneDetailView,
    resultView: GeneResult,
    route: '/gene'
}