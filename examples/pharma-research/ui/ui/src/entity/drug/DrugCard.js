import React from 'react';
import HighlightMatch from 'components/HighlightMatch';

const ActiveIngredients = result => {
  if (result.activeIngredients.length > 0) {
    const activeIngredients = result.activeIngredients.map((ingredient, idx) => {
      return <li key={idx}>{ingredient.activeSubstanceName}</li>;
    });
    return (
      <div className="profile-section active-ingredients">
        <h6>Active Ingredients</h6>
        <ul>{activeIngredients}</ul>
      </div>
    );
  } else {
    return <></>;
  }
};

const DrugCard = props => {
  return (
    <div>
      <div className="description">
        {<HighlightMatch match={props.entity.description} />}
      </div>
      <ActiveIngredients {...props.entity} />
      {props.children}
    </div>
  );
};

export default DrugCard;
