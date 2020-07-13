import React from 'react';
import { Button } from 'react-bootstrap';
import { entityConfig } from 'entity';
import './UberFacets.css';

const uberFacets = Object.keys(entityConfig).concat('workspace');

const Icons = new Map(Object.keys(entityConfig).map(key => {
  return [key, entityConfig[key].class.getIcon()];
}));

const UberFacets = props => {
  const isSelected = uberFacet => props.uberFacet === uberFacet;

  const getClassName = uberFacet => (isSelected(uberFacet) ? 'selected' : '');

  const clickFacet = name => {
    let type = name === props.uberFacet ? null : name;
    props.setUberFacet(type);
  };

  return (
    <div className="uber-facets">
      <ul>
        {uberFacets.map(uberFacet => {
          return (
            <li key={uberFacet}>
              <Button
                variant="outline-primary"
                onClick={() => clickFacet(uberFacet)}
                className={getClassName(uberFacet)}
              >
                <i className={Icons.get(uberFacet)} aria-hidden="true" />
                {uberFacet}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export { UberFacets, Icons };
