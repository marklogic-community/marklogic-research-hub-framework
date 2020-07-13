import React from 'react';
import './TopicTag.css';

const TopicTag = props => <span className="tag">{props.topic.label}</span>;

export default TopicTag;
