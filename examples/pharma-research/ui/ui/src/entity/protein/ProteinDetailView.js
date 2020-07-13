import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import GraphView from 'components/GraphView';
import ProteinInfo from './ProteinInfo';
import DetailViewHeader from 'components/DetailViewHeader';
import Bookmark from 'components/Bookmark';

const ViewAsJson = ({ protein, contentType, label, id, graphData }) => {
  if (!protein) {
    return null;
  }

  return (
    <div>
      <section id="top" className="card-list quick-section">
        <a id="top_anchor" name="top" />
        <h1>{protein.fullName || protein.proteinID || id}</h1>
      </section>
      <section>
        <ProteinInfo protein={protein} />
        <a href={'https://www.uniprot.org/uniprot/?query=%22' + (protein.fullName || protein.proteinID) + '%22'} target="_blank">UniProtKB Search Link</a>
      </section>
    </div>
  );
};

class ProteinDetailView extends Component {
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
    const protein = this.props.detail;
    if (!protein) return null;
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
                type: 'protein',
                label: protein.fullName || protein.proteinID || this.props.id
              }}
            />
          </Col>
          <Col md={11}>
            <div>
              {this.props.error ? (
                <div id="detail">
                  <p>
                    <strong>
                      There was an error retrieving this document.
                    </strong>
                  </p>
                  <p>
                    The server sent the following error message:&nbsp;
                    <span className="text-danger">{this.props.error}</span>
                  </p>
                </div>
              ) : this.props.detail && this.state.view === 'detail' ? (
                <div id="detail">
                  <this.props.template {...this.props} protein={protein} />
                </div>
              ) : (
                <section id="graph" className="quick-section">
                  <GraphView data={this.props.graphData} />
                </section>
              )}
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

ProteinDetailView.defaultProps = {
  template: ViewAsJson
};

ProteinDetailView.propTypes = {
  detail: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  template: PropTypes.func,
  contentType: PropTypes.string,
  error: PropTypes.string
};

export default ProteinDetailView;
