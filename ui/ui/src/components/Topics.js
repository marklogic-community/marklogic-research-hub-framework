import React from 'react';
import TopicTag from './TopicTag';

const Topics = ({ topics }) => {
  return (
    <>
      {topics.map((topicPreferredName, index) => {
        let topicProps = {
          label: topicPreferredName
        };
        return <TopicTag key={index} topic={topicProps} />;
      })}
    </>
  );
};

export default Topics;
