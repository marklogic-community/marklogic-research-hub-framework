import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import EntityContainer from 'containers/EntityContainer';
import Topics from 'components/Topics';
import GraphView from 'components/GraphView';
import Bookmark from 'components/Bookmark';
import DetailViewHeader from 'components/DetailViewHeader';
import './AuthorDetailView.css';
import EntityComponentList from '../../components/EntityComponentList';
import authorAPI from './AuthorAPI';

const renderAffiliations = author => {
  if (!(author && author.affiliations)) {
    return <Row />;
  }

  return (
    <ul>
      {author.affiliations.map((affiliation, index) => {
        return <li key={index}>{affiliation.organizationName}</li>;
      })}
    </ul>
  );
};

const ViewAsJson = ({ detail, id, graphData, view }) => {
  if (!detail) {
    return null;
  }

  const author = detail;

  const header = (
    <section id="top" className="card-list quick-section">
      <a id="top_anchor" name="top" />
      <h1>
        <i className="far fa-address-card" />
        &nbsp;
        {author.personName || id}
      </h1>
      <a href={'https://www.researchgate.net/search/researcher?q=' + encodeURIComponent(author.personName)} target="_blank">ResearchGate Search Link</a>
    </section>
  );

  const coauthors = author.coAuthors.map(async author => {
    const id = await authorAPI.fetchAuthorID(author.author);
    return {
      type: 'author',
      name: author.author,
      id: id
    };
  }).filter(author => author.id !== null);

  return (
    <div>
      {header}
      {view === 'detail' ? (
        <>
          {author.topics &&
            author.topics.length > 0 && (
              <section id="topics" className="quick-section">
                <a id="topics_anchor" name="topics" />
                <h4>Topics</h4>
                <Topics topics={author.topics.map(t => t.topic)} />
              </section>
            )}

          <section id="affiliations" className="quick-section">
            <a id="affiliations_anchor" name="affiliations" />
            <h4>Affiliations</h4>
            {renderAffiliations(author)}
          </section>

          {author.publications &&
            author.publications.length > 0 && (
              <>
                <section id="publications" className="quick-section">
                  <a id="publications_anchor" name="publications" />
                  <h4>Publications</h4>
                  <section className="author-publications">
                    {author.publications.map(pub => {
                      const pubId = encodeURIComponent(pub);
                      return (
                        <EntityContainer
                          type="publication"
                          key={pubId}
                          id={pubId}
                        />
                      );
                    })}
                  </section>
                </section>
              </>
            )}
          {author.coAuthors && (
            <>
              <section id="coauthors" className="quick-section">
                <a id="coauthors_anchor" name="coauthors" />
                <h4>Coauthors</h4>
                <section className="author-coauthors">
                  <EntityComponentList
                    entities={author.coAuthors.map(author => {
                      return {
                        type: 'author',
                        name: author.author,
                        id: authorAPI.fetchAuthorID(author.author)
                      };
                    })}
                  />
                </section>
              </section>
            </>
          )}
        </>
      ) : (
        <section id="graph" className="quick-section">
          <GraphView data={graphData} />
        </section>
      )}
    </div>
  );
};

class AuthorDetailView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      view: 'detail',
      showAddToCaseModal: false
    };

    this.showView = this.showView.bind(this);
    this.closeAddToCaseModal = this.closeAddToCaseModal.bind(this);
    this.openAddToCaseModal = this.openAddToCaseModal.bind(this);
  }

  showView(name) {
    this.setState({ view: name });
  }

  openAddToCaseModal() {
    this.setState({ showAddToCaseModal: true });
  }

  closeAddToCaseModal() {
    this.setState({ showAddToCaseModal: false });
  }

  componentDidMount() {
    if (!this.props.detail) {
      this.props.loadDetail(this.props.id);
    }
    this.props.loadGraph(this.props.id);
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      if (!this.props.detail) {
        this.props.loadDetail(this.props.id);
      }
    }
  }

  render() {
    const author = this.props.detail || {};
    return (
      <div>
        <DetailViewHeader
          changeView={this.showView}
          viewName={this.state.view}
        />
        <Row className="detail-view">
          <Col md={1}>
            <Bookmark
              entity={{
                id: this.props.id,
                uri: author.docId,
                type: 'author',
                label: author.personName || this.props.id
              }}
            />
          </Col>
          <Col md={11}>
            {this.props.error ? (
              <div id="detail">
                <p>
                  <strong>There was an error retrieving this document.</strong>
                </p>
                <p>
                  The server sent the following error message:&nbsp;
                  <span className="text-danger">{this.props.error}</span>
                </p>
              </div>
            ) : (
              this.props.detail && (
                <div id="detail">
                  <this.props.template {...this.props} view={this.state.view} />
                </div>
              )
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

AuthorDetailView.defaultProps = {
  template: ViewAsJson
};

AuthorDetailView.propTypes = {
  detail: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  template: PropTypes.func,
  contentType: PropTypes.string,
  error: PropTypes.string
};

export default AuthorDetailView;
