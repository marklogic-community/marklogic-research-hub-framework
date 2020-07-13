import React from 'react';
import { coerceToArray } from '../utils';

const HighlightMatch = ({ match }) => {
  const highlightedMatches = match ? coerceToArray(match['match-text']) : [];
  const matchSpans = highlightedMatches.map((text, index) => {
    return (
      <span
        className={text.highlighted !== undefined ? 'mark' : ''}
        key={index}
      >
        {text.highlighted !== undefined ? text.highlighted : text}
      </span>
    );
  });
  return <span>{matchSpans}</span>;
};

export default HighlightMatch;
