import React from 'react';
import ProteinInfo from './ProteinInfo';

const ProteinCard = ({ entity, geneLabel, id, label, ...props }) => {

  label = label || entity.fullName;
  
  return (
    <div>
      <ProteinInfo protein={entity} geneLabel={geneLabel} />
      {props.children}
    </div>
  );
};

export default ProteinCard;
