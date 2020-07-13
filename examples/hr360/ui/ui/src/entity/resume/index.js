import { default as Resume } from './Resume';
import { default as ResumeDetailView } from './ResumeDetailView';
import { default as ResumeCard } from './ResumeCard';
import { default as ResumeResult } from './ResumeResult';

export default {
    class: Resume,
    plural: 'resumes',
    cardView: ResumeCard,
    detailView: ResumeDetailView,
    resultView: ResumeResult,
    route: '/resume'
}
