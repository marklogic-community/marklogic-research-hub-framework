import React from 'react';
import { Col } from 'react-bootstrap';
import '../Card.css';
import './GeneCard.css';

const AlternativeNames = result => {
  const listItems = result.alternateFullNames
    .filter(name => typeof name === 'string')
    .map(name => {
      return <li key={name}>{name}</li>;
    });
  return Section('alternative names', listItems);
};

const Diseases = result => {
  const listItems = result.diseases.map(disease => {
    return <li key={disease.diseaseID}>{disease.diseaseName}</li>;
  });
  return Section('diseases', listItems);
};

function capitalize(str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

function Section(name, list) {
  if (list && list.length > 0) {
    const className = `profile-section ${name.replace(/\s/, '-')}`;
    return (
      <div className={className}>
        <h6>{capitalize(name)}</h6>
        <ul>{list}</ul>
      </div>
    );
  } else {
    return <></>;
  }
}

const GeneCard = props => {
  return (
    <div>
      <div className="gene-info-container">
        {props.entity && (
          <Col md={6}>
            <table className="card-stats">
              <tbody>
                <tr>
                  <td>Gene ID</td>
                  <td>{props.entity.geneID}</td>
                </tr>
                <tr>
                  <td>Gene type</td>
                  <td>{props.entity.geneType}</td>
                </tr>
                <tr>
                  <td>Chromosome</td>
                  <td>{props.entity.chromosome}</td>
                </tr>
                {/*
              <tr>
                <td>MIM number</td>
                <td>{props.entity.mimNumber}</td>
              </tr>
                */}
                <tr>
                  <td>Map location</td>
                  <td>{props.entity.mapLocation}</td>
                </tr>
                <tr>
                  <td>Symbol</td>
                  <td>{props.entity.symbol}</td>
                </tr>
              </tbody>
            </table>
          </Col>
        )}
        <Col md={6} className="gene-info">
          <AlternativeNames {...props.entity} />
          <Diseases {...props.entity} />
        </Col>
      </div>
      {props.children}
    </div>
  );
};

export default GeneCard;
