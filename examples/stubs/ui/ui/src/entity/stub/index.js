import { default as Stub } from './Stub';
import { default as StubDetailView } from './StubDetailView';
import { default as StubCard } from './StubCard';
import { default as StubResult } from './StubResult';

export default {
    class: Stub,
    plural: 'stubs',
    cardView: StubCard,
    detailView: StubDetailView,
    resultView: StubResult,
    route: '/stub'
}
