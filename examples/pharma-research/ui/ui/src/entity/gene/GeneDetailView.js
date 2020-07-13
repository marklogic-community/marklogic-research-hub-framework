import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import GraphView from 'components/GraphView';
import DetailViewHeader from 'components/DetailViewHeader';
import Bookmark from 'components/Bookmark';

const ViewAsJson = ({ gene, id }) => {
  if (!gene) {
    return null;
  }

  // bug workaround
  gene.alternateFullNames = gene.alternateFullNames.filter(
    n => typeof n === 'string'
  );

  return (
    <div>
      <section id="top" className="card-list quick-section">
        <a id="top_anchor" name="top" />
        <h1>
          <i className="fas fa-dna" /> {gene.fullName || gene.geneID || id}
        </h1>
      </section>
      {gene.geneID && (
        <>
          <section id="geneID" className="quick-section">
            <a id="geneID_anchor" name="geneID" />
            <h6>Gene ID</h6>
            <div>{gene.geneID} (<a href={'https://www.ncbi.nlm.nih.gov/gene/'+gene.geneID} target="_blank">NCBI Gene Link</a>)</div>
          </section>
        </>
      )}
      {gene.geneType && (
        <>
          <section id="geneType" className="quick-section">
            <a id="geneType_anchor" name="geneType" />
            <h6>Gene Type</h6>
            <div>{gene.geneType}</div>
          </section>
        </>
      )}
      {gene.chromosome && (
        <>
          <section id="chromosome" className="quick-section">
            <a id="chromosome_anchor" name="chromosome" />
            <h6>Chromosome</h6>
            <div>{gene.chromosome}</div>
          </section>
        </>
      )}
      {gene.mapLocation && (
        <>
          <section id="mapLocation" className="quick-section">
            <a id="mapLocation_anchor" name="mapLocation" />
            <h6>Map Location</h6>
            <div>{gene.mapLocation}</div>
          </section>
        </>
      )}
      {gene.symbol && (
        <>
          <section id="symbol" className="quick-section">
            <a id="symbol_anchor" name="symbol" />
            <h6>Symbol</h6>
            <div>{gene.symbol}</div>
          </section>
        </>
      )}
      {gene.alternateFullNames &&
        gene.alternateFullNames.length > 0 && (
          <>
            <section id="synonyms" className="quick-section">
              <a id="synonyms_anchor" name="synonyms" />
              <h6>Synonyms</h6>
              <ul>
                {gene.alternateFullNames.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </section>
          </>
        )}
      {gene.dbXrefs && (
        <>
          <section id="dbXrefs" className="quick-section">
            <a id="dbXrefs_anchor" name="dbXrefs" />
            <h6>dbXrefs</h6>
            <div>{gene.dbXrefs}</div>
          </section>
        </>
      )}
      {gene.description && (
        <>
          <section id="description" className="quick-section">
            <a id="description_anchor" name="description" />
            <h6>Description</h6>
            <div>{gene.description}</div>
          </section>
        </>
      )}
      {gene.diseases &&
        gene.diseases.length > 0 && (
          <>
            <section id="relatedDiseases" className="quick-section">
              <a id="relatedDiseases_anchor" name="relatedDiseases" />
              <h6>Related Diseases</h6>
              {gene.diseases.map((disease, index) => (
                <div key={index}>{disease.diseaseName}</div>
              ))}
            </section>
          </>
        )}
    </div>
  );
};

class GeneDetailView extends Component {
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
        this.props.loadDetail(this.props.id);
      }
    }
  }

  render() {
    const gene = this.props.detail || {};
    if (!gene) return null;
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
                type: 'gene',
                label: gene.fullName || gene.geneID || this.props.id
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
            ) : this.props.detail && this.state.view === 'detail' ? (
              <div id="detail">
                <this.props.template {...this.props} gene={gene} />
              </div>
            ) : (
              <section id="graph">
                <GraphView data={this.props.graphData} />
              </section>
            )}
          </Col>
        </Row>
      </>
    );
  }
}

GeneDetailView.defaultProps = {
  template: ViewAsJson
};

GeneDetailView.propTypes = {
  detail: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  template: PropTypes.func,
  error: PropTypes.string
};

export default GeneDetailView;
