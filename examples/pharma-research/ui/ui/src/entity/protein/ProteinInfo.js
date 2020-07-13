import React from 'react';

const ProteinInfo = ({ protein, geneLabel }) => {
  if (!protein) {
    return null;
  }
  return (
    <p>
      {geneLabel ? (
        <span>
          <strong>Gene:</strong> {geneLabel}
        </span>,
        <br/>
      ) : null}
      {protein.similarProtein &&
      protein.similarProtein.length > 0 &&
      protein.similarProtein.some(similar => similar.family != null) ? (
        <span>
          <strong>Family:</strong>{' '}
          {protein.similarProtein.map(similar => similar.family).join(', ')}
        </span>
      ) : null}
      {protein.similarProtein &&
      protein.similarProtein.length > 0 &&
      protein.similarProtein.some(similar => similar.subfamily != null) ? (
        <>
          <br />
          <span>
            <strong>Sub Family:</strong>{' '}
            {protein.similarProtein
              .map(similar => similar.subfamily)
              .join(', ')}
          </span>
        </>
      ) : null}
      {protein.similarProtein &&
      protein.similarProtein.length > 0 &&
      protein.similarProtein.some(similar => similar.subsubfamily != null) ? (
        <>
          <br />
          <span>
            <strong>Sub Sub Family:</strong>{' '}
            {protein.similarProtein
              .map(similar => similar.subsubfamily)
              .join(', ')}
          </span>
        </>
      ) : null}
    </p>
  );
};

export default ProteinInfo;
