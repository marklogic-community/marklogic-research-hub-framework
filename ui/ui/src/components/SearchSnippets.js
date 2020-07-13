import React from 'react';
import PropTypes from 'prop-types';
import SearchSnippet from './SearchSnippet.js';

const SearchSnippets = ({ result }) => (
  <div className="ml-search-result-matches">
    {result.matches &&
      result.matches.map((match, index) => (
        <SearchSnippet match={match} key={index} />
      ))}
  </div>
);

SearchSnippets.propTypes = {
  result: PropTypes.shape({
    matches: PropTypes.array
  }).isRequired
};

export default SearchSnippets;
