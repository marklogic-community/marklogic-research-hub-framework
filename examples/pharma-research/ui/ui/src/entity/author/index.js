import { default as Author } from './Author';
import { default as AuthorDetailView } from './AuthorDetailView';
import { default as AuthorCard } from './AuthorCard';
import { default as AuthorResult } from './AuthorResult';

export default {
    class: Author,
    plural: 'authors',
    cardView: AuthorCard,
    detailView: AuthorDetailView,
    resultView: AuthorResult,
    route: '/author'
}