import React from 'react';

const Journal = ({ journal }) => {
  let date = journal['pub-date'] &&
    [
      journal['pub-date'].year,
      journal['pub-date'].month,
      journal['pub-date'].day
    ]
    .filter(i => i)
    .join('-');
  return (
    <span className="journal">
      {[journal.title, date].filter(i => i).join('; ')}
    </span>
  );
};

export default Journal;
