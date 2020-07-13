import React from 'react';

const Affiliations = ({ affiliations }) => {
  return affiliations.map((affiliation, index) => {
    return (
      <div className="profile-section" key={`org${index}`}>
        <div>{affiliation.organizationName}</div>
      </div>
    );
  });
};

const Topics = ({ topics }) => {
  const topicsList = topics.map((topic, index) => {
    const topicName = topic.topic;
    return <li key={topicName + '-' + index}>{topicName}</li>;
  });
  if (topics && topics.length > 0) {
    return <div className="profile-section topics">{topicsList}</div>;
  } else {
    return <></>;
  }
};

const AuthorCard = props => {
  return (
    <div>
      {props.entity.affiliations && (
        <Affiliations affiliations={props.entity.affiliations} />
      )}
      {props.entity.topics && <Topics topics={props.entity.topics} />}
      {props.children}
    </div>
  );
};

export default AuthorCard;
