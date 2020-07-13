import React, { useEffect, useState } from 'react';
import entityConfig from '../entity/entityConfig';
import GenericEntityCard from 'components/GenericEntityCard';

const EntityComponent = ({ name, id, entity, loadEntity, type, removeWorkspaceEntity }) => {
  let [cachedEntity, setEntity] = useState(entity);
  useEffect(
    () => {
      if (!cachedEntity && id) {
        // Wrap 'id' in a Promise if not one itself to simplify following code..
        if (!(id instanceof Promise)) {
          id = Promise.resolve(id);
        }
        // Unwrap promises
        id.then(id => {
          loadEntity(id).then(entity => {
            if (entity) {
              setEntity(entity);
            }
          });
        });
      }
    },
    [id]
  );

  const EntityCard = entityConfig[type].cardView;
  return (cachedEntity ?
    <GenericEntityCard entity={cachedEntity} removeWorkspaceEntity ={removeWorkspaceEntity}>
      <EntityCard name={name} entity={cachedEntity} />
    </GenericEntityCard> : null
  );
};

export default EntityComponent;
