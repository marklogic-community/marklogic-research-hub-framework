import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  FormControl,
  InputGroup,
  Glyphicon,
  Button
} from 'react-bootstrap';
import './SearchBar.css';

const SearchBar = ({
  queryText,
  onQueryTextChange,
  onSearchExecute,
  placeholder = 'Search...',
  searchPending,
  workspaceRelevanceQuery,
  onWorkspaceRelevanceToggle
}) => {
  return (
    // <Col md={4} mdOffset={7} className="ml-search-bar">
    <div
    // className="pull-right"
    >
      <form
        role="search"
        onSubmit={e => {
          e.preventDefault();
          onSearchExecute();
        }}
      >
        <FormGroup controlId="searchBox" className="search-group">
          <InputGroup>
            <FormControl
              className="ml-qtext-input"
              type="text"
              placeholder={placeholder}
              value={queryText}
              onChange={e => onQueryTextChange(e.target.value)}
            />
            <InputGroup.Button>
              <Button
                className="btn-raised ml-search-item"
                type="button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (onWorkspaceRelevanceToggle) {
                    onWorkspaceRelevanceToggle(!workspaceRelevanceQuery);
                  }
                }}
              >
                {workspaceRelevanceQuery
                  ? 'Workspace Relevance: ON'
                  : 'Workspace Relevance: OFF'}
              </Button>
              <Button
                className="ml-execute-search btn-raised"
                disabled={searchPending}
                type="submit"
              >
                <Glyphicon glyph="search" />
              </Button>
              {/* <Button
                onClick={() => onQueryTextChange('')}
                className="ml-qtext-clear btn-raised"
              >
                <Glyphicon glyph="remove" /> Clear
              </Button> */}
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </form>
    </div>
    // </Col>
  );
};

SearchBar.propTypes = {
  queryText: PropTypes.string.isRequired,
  onQueryTextChange: PropTypes.func,
  onQueryTextClear: PropTypes.func,
  onSearchExecute: PropTypes.func,
  placeholder: PropTypes.string,
  searchPending: PropTypes.bool,
  workspaceRelevanceQuery: PropTypes.bool,
  onWorkspaceRelevanceToggle: PropTypes.func
};

export default SearchBar;
