import { default as JobReview } from './JobReview';
import { default as JobReviewDetailView } from './JobReviewDetailView';
import { default as JobReviewCard } from './JobReviewCard';
import { default as JobReviewResult } from './JobReviewResult';

export default {
    class: JobReview,
    plural: 'jobreviews',
    cardView: JobReviewCard,
    detailView: JobReviewDetailView,
    resultView: JobReviewResult,
    route: '/jobreview'
}
