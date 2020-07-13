import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import SearchSnippets from 'components/SearchSnippets.js';
import AuthorCard from './AuthorCard';
import HighlightMatch from 'components/HighlightMatch';
import GenericEntityCard from 'components/GenericEntityCard';

const AuthorResult = ({ result, entity, ...props }) => {
  const name = result.highlightedLabel ? (
    <HighlightMatch match={result.highlightedLabel} />
  ) : (
    result.label
  );
  return (
    <GenericEntityCard entity={entity}>
      <AuthorCard
        {...props}
        entity={entity}
        name={name}
      >
        <Row>
          <Col md={12}>
            <SearchSnippets result={result} />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <span
              onClick={() => {
                props.addFilter(
                  'publication',
                  'Author',
                  null,
                  entity.personName
                );
                props.setUberFacet('publication');
              }}
            >
              Search related publications
            </span>
          </Col>
        </Row>
      </AuthorCard>
    </GenericEntityCard>
  );
};

AuthorResult.defaultProps = {
  detailPath: '/detail',
};

AuthorResult.propTypes = {
  content: PropTypes.func,
  header: PropTypes.func,
  detailPath: PropTypes.string,
  result: PropTypes.shape({
    id: PropTypes.string
  })
};

export default AuthorResult;
