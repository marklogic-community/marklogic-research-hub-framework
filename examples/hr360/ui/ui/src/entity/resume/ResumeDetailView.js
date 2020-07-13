import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import $ from 'jquery';
import GraphView from 'components/GraphView';
import DetailViewHeader from 'components/DetailViewHeader';
import Bookmark from 'components/Bookmark';

const ViewAsJson = ({ detail, contentType, label, id, graphData }) => {
  if (!detail) {
    return null;
  }

  const resume = detail;

  return (
    <div className="col-md-9">
      <section id="top" className="card-list quick-section">
        <a id="top_anchor" name="top" />
        <h1>
          <i className="fas fa-file" /> {resume.preferredName || id}
        </h1>
        <a href={'/employee?id=' + resume.employeeUri}>{resume.employeeName}</a>
        <div><strong>Category</strong> <span>{resume.category}</span></div>
        <p dangerouslySetInnerHTML={{ __html: resume.resumeText.replace(/[A-Z]{3}[A-Z ]+[A-Z]+(?![a-z])/g, '<br><strong>$&</strong></br>')}}></p>
      </section>
    </div>
  );
};

class ResumeDetailView extends Component {
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

  attachScrollListener() {
    var sections = $('section.quick-section'),
      nav = $('#controls');

    $(window).on('scroll', function() {
      var cur_pos = $(this).scrollTop();

      sections.each(function() {
        var top = $(this).offset().top - 10,
          bottom = top + $(this).outerHeight();

        if (cur_pos + 2 >= top && cur_pos <= bottom) {
          nav.find('a').removeClass('active');
          sections.removeClass('active');

          $(this).addClass('active');
          nav.find('a[href="#' + $(this).attr('id') + '"]').addClass('active');
        }
      });
    });

    nav.find('a').on('click', function() {
      var $el = $(this),
        id = $el.attr('href');

      var offset = 0;

      if (id !== '#top') {
        var idAnchorEl = $(id + '_anchor');
        if (idAnchorEl) {
          offset = idAnchorEl.offset().top;
        }
      }

      // console.log('id: ', id);
      // console.log('offset: ', offset);

      $('html, body').animate(
        {
          scrollTop: offset
        },
        500
      );

      return false;
    });
  }

  render() {
    const resume = this.props.detail && this.props.detail;
    if (!resume) return null;
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
                type: 'resume',
                label: resume.description || this.props.id
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
              this.props.detail &&
              (this.state.view === 'detail' ? (
                <>
                  <div id="detail">
                    <this.props.template {...this.props} />
                  </div>
                </>
              ) : (
                this.state.view === 'graph' && (
                  <section id="graph" className="quick-section">
                    <GraphView data={this.props.graphData} />
                  </section>
                )
              ))
            )}
          </Col>
        </Row>
      </>
    );
  }
}

ResumeDetailView.defaultProps = {
  template: ViewAsJson
};

ResumeDetailView.propTypes = {
  detail: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  template: PropTypes.func,
  contentType: PropTypes.string,
  error: PropTypes.string
};

export default ResumeDetailView;
