import { default as Position } from './Position';
import { default as PositionDetailView } from './PositionDetailView';
import { default as PositionCard } from './PositionCard';
import { default as PositionResult } from './PositionResult';

export default {
    class: Position,
    plural: 'positions',
    cardView: PositionCard,
    detailView: PositionDetailView,
    resultView: PositionResult,
    route: '/position'
}
