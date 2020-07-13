import React, { useEffect } from 'react';
import WorkspaceCard from './WorkspaceCard';

const Workspace = ({ name, id, workspace, loadWorkspace, removeEntity }) => {
  useEffect(
    () => {
      if (!workspace && id) {
        loadWorkspace(id);
      }
    },
    [id]
  );
  let workspaceObj = {};
  if (workspace) {
    workspaceObj = workspace;
  }

  const resultObj = {
    label: name,
    id: id,
    entities: workspaceObj.entities,
    extracted: {
      content: []
    },
    removeEntity: removeEntity
  };

  return workspace ? <WorkspaceCard entity={resultObj} /> : null;
};

export default Workspace;
