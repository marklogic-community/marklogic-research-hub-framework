import React from 'react';
import { MenuItem } from 'react-bootstrap';
import Bookmark from './Bookmark';
import { entityConfig } from 'entity';
import { default as conceptConfig } from 'concept/conceptConfig';
import './GraphContextMenu.css';

const isEntity = node =>
  node &&
  Object.keys(entityConfig).includes(node.group.replace('recommendation', ''));

const getUri = node => {
  if (!node) {
    return;
  }
  if (node.originalIds) {
    return node.originalIds[0];
  }
  return node.id;
};

const GraphContextMenu = ({
  positionStyle,
  targetNode,
  detailHref,
  typeToConnect,
  setTypeToConnect,
  close,
  removeNode,
  addNodeGroupFilter,
  removeOrphanNodes,
  updateNodesAndEdges
}) => {
  const handleTypeToConnectChange = event => {
    setTypeToConnect(event.target.value);
  };

  const allConfig = Object.assign(Object.assign({}, entityConfig), conceptConfig);
  const relatedOptions = Object.keys(allConfig).map(key => {
    return <option key={key} value={key}>{allConfig[key].plural}</option>
  });

  return (
    <div style={positionStyle} className="dropdown open">
      <ul className="dropdown-menu open">
        <MenuItem header>
          <h6>
            {isEntity(targetNode) && (
              <Bookmark
                entity={{
                  uri: getUri(targetNode),
                  id: getUri(targetNode),
                  label: targetNode.label,
                  type: targetNode.group
                }}
              />
            )}{' '}
            {targetNode.label}
          </h6>
        </MenuItem>
        <MenuItem
          disabled={!detailHref}
          href={detailHref}
          target="_blank"
          onSelect={close}
        >
          See detail in new tab
        </MenuItem>
        <li role="presentation">
          <span>
            <a
              onClick={e => {
                e.preventDefault();
                updateNodesAndEdges(targetNode.originalIds || [targetNode.id], {
                  only: typeToConnect
                });
                close();
              }}
            >
              See related&nbsp;
            </a>
            <select value={typeToConnect} onChange={handleTypeToConnectChange}>
              {relatedOptions}
            </select>
            &nbsp;
            <a
              onClick={e => {
                e.preventDefault();
                updateNodesAndEdges(targetNode.originalIds || [targetNode.id], {
                  only: typeToConnect
                });
                close();
              }}
            >
              <i className="fas fa-lg fa-caret-right" />
            </a>
          </span>
        </li>
        <MenuItem
          onSelect={() => {
            removeNode();
            close();
          }}
        >
          Remove node
        </MenuItem>
        <MenuItem divider />
        <MenuItem
          onSelect={() => {
            addNodeGroupFilter(targetNode);
            close();
          }}
        >
          Hide all "{targetNode.group}" nodes
        </MenuItem>
        <MenuItem
          onSelect={() => {
            removeOrphanNodes();
            close();
          }}
        >
          Remove orphan nodes
        </MenuItem>
      </ul>
    </div>
  );
};

export default GraphContextMenu;
