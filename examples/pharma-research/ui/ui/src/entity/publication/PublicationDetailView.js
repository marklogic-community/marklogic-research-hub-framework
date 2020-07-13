import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import Topics from 'components/Topics';
import Journal from 'components/Journal';
import GraphView from 'components/GraphView';
import Bookmark from 'components/Bookmark';
import DetailViewHeader from 'components/DetailViewHeader';
import { coerceToArray } from 'utils';
import './PublicationDetailView.css';
import EntityComponentList from '../../components/EntityComponentList';
import authorAPI from '../author/AuthorAPI';

const AuthorTemplate = ({ publication, contentType, id, graphData }) => {
  const journal = publication.journal && {
    title: publication.journal.title,
    issue: {
      volume: publication.journal.volume,
      date:
        publication.journal['pub-date'] &&
        [
          publication.journal['pub-date'].year,
          publication.journal['pub-date'].month,
          publication.journal['pub-date'].day
        ]
          .filter(i => i)
          .join('-')
    }
  };

  if (publication.abstracts && publication.abstracts.abstract && !Array.isArray(publication.abstracts.abstract)) {
    publication.abstracts.abstract = [publication.abstracts.abstract];
  }

  return (
    <div className="col-md-9">
      <section id="top" className="quick-section">
        <a id="top_anchor" name="top" />
        <h1>
          <i className="fas fa-book" /> {publication.articleTitle || id}
        </h1>
        <a href={'https://www.ncbi.nlm.nih.gov/pubmed/' + publication.pudMedId} target="_blank">NCBI PubMed Link</a>
        <h4>
          {publication.authors &&
            publication.authors.author &&
            publication.authors.author.length && (
              <>
                {publication.authors.author
                  .map(author => {
                    return author.preferredName;
                  })
                  .join(', ')}
                <br />
              </>
            )}
        </h4>
        <h6>
          <Journal journal={journal} />
        </h6>
        <div>
          {publication.abstracts && publication.abstracts.abstract ? (<h4>Abstract</h4>): ''}
          {publication.abstracts && publication.abstracts.abstract.map(
            (abstract, index) => (
              <section key={index}>
                {abstract.abstractTitle !== 'Main' && (
                  <h5>{abstract.abstractTitle}</h5>
                )}
                <p>{abstract.abstractMessage}</p>
              </section>
            )
          )}
        </div>
        <div>
          {publication.bodies && publication.bodies.body ? (<h4>Article Body</h4>): ''}
          {publication.bodies && publication.bodies.body.map(
            (b, index) => (
              <section key={index}>
                <p>{b}</p>
              </section>
            )
          )}
        </div>
      </section>

      {publication.topics && (
        <>
          <section id="topics" className="quick-section">
            <a id="topics_anchor" name="topics" />
            <h6>Topics</h6>
            <Topics topics={coerceToArray(publication.topics.topic)} />
          </section>
        </>
      )}

      {publication.authors &&
        publication.authors.author &&
        publication.authors.author.length && (
          <>
            <section id="authors" className="publication-authors">
              <a id="authors_anchor" name="authors" />
              <h6>Author Details</h6>
              <EntityComponentList
                entities={publication.authors.author.map(author => {
                  return {
                    type: 'author',
                    name: author.preferredName,
                    id: authorAPI.fetchAuthorID(author.preferredName)
                  };
                })}
              />
            </section>
          </>
        )}
    </div>
  );
};

class PublicationDetailView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      view: 'detail'
    };

    this.showView = this.showView.bind(this);
  }

  showView(name) {
    this.setState({ view: name });
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
        this.props.loadDetail(this.props.id, {
          api: { getDoc: this.fetchPublication }
        });
      }
    }
  }

  render() {
    if (!this.props.detail) {
      return null;
    }

    let publication = this.props.detail;
    if (publication.relationships) {
      publication.authorNames = publication.relationships
        .filter(r => r.entityType === 'author')
        .map(r => r.preferredName);
    }
    /*if (this.props.contentType) {
      if (this.props.contentType.lastIndexOf('application/json') !== -1) {
        throw new Error(
          "publications are now json! But this code won't handle it"
        );
      } else if (this.props.contentType.lastIndexOf('application/xml') !== -1) {
        var x2js = new X2JS();
        const envelope = x2js.xml2js(this.props.detail).envelope;
        publication = envelope.instance.publication.content.article;
      }
    }*/

    return (
      <>
        <DetailViewHeader
          changeView={this.showView}
          viewName={this.state.view}
        />
        <Row className="detail-view">
          <Col md={1}>
            <Bookmark
              entity={{
                id: this.props.id,
                uri: unescape(this.props.id),
                type: 'publication',
                label: publication.articleTitle || this.props.id
              }}
            />
          </Col>
          <Col md={11}>
            {this.props.error ? (
              <div id="detail">
                <p>
                  <strong>
                    There was an error retrieving this publication.
                  </strong>
                </p>
                <p>
                  The server sent the following error message:&nbsp;
                  <span className="text-danger">{this.props.error}</span>
                </p>
              </div>
            ) : (
              this.props.detail &&
              (this.state.view === 'detail' ? (
                <div id="detail">
                  <this.props.template
                    {...this.props}
                    publication={publication}
                  />
                </div>
              ) : (
                <section id="graph" className="quick-section">
                  <GraphView data={this.props.graphData} />
                </section>
              ))
            )}
          </Col>
        </Row>
      </>
    );
  }
}

PublicationDetailView.defaultProps = {
  template: AuthorTemplate
};

PublicationDetailView.propTypes = {
  detail: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  template: PropTypes.func,
  contentType: PropTypes.string,
  error: PropTypes.string
};

export default PublicationDetailView;
