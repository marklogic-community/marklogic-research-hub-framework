import React from 'react';
import Journal from 'components/Journal';
import HighlightMatch from 'components/HighlightMatch';

const Topics = ({ topics }) => {
  if (topics[0]) {
    topics = Array.isArray(topics[0]) ? topics[0] : [topics[0]];
    const topicsList = topics.map(topic => {
      return <li key={topic}>{topic}</li>;
    });
    if (topicsList && topicsList.length > 0) {
      return (
        <div className="profile-section topics">
          <h6>Topics</h6>
          {topicsList}
        </div>
      );
    }
  }
  return null;
};


const PublicationCard = props => (
  <div>
    {props.entity.journal && <Journal journal={props.entity.journal} />}
    <div className="publicationAbstract">
      {props.entity.highlightedAbstractText ? (
        <HighlightMatch match={props.entity.highlightedAbstractText} />
      ) : (
        props.entity.abstractText
      )}
    </div>
    {props.entity.topics && <Topics topics={props.entity.topics} />}
    {props.children}
  </div>
);

export default PublicationCard;
