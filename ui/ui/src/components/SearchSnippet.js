import React from 'react';
import { coerceToArray } from '../utils';

const SearchSnippet = ({ match }) => {
  const highlightedMatches = match ? coerceToArray(match['match-text']) : [];
  const matchSpans = highlightedMatches.map((text, index) => {
    return (
      <em className={text.highlight !== undefined ? 'mark' : ''} key={index}>
        {text.highlight !== undefined ? text.highlight : text}
      </em>
    );
  });

  return <div className="ml-search-result-match">{matchSpans}</div>;
};

export default SearchSnippet;
