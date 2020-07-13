import React, { useState, useEffect, useRef } from 'react';
import 'vis/dist/vis.css';
import vis from 'vis';
import { Fade } from '@marklogic-community/grove-core-react-components';
import { isEqual } from 'lodash';
import GraphContextMenu from './GraphContextMenu';
import ConceptRegistry from 'concept/ConceptRegistry';
import { EntityRegistry } from 'entity';
import WaitSpinner from './WaitSpinner';

const genericIcon = require('../images/generic.png');
const usersIcon = require('../images/users-solid.svg');

const MAX_LABEL_LENGTH = 30;

function truncateLabel(string) {
  return typeof string === 'string' && string.length > MAX_LABEL_LENGTH
    ? string.substring(0, MAX_LABEL_LENGTH) + '...'
    : string;
}

const chartStyle = {
  width: '100%',
  height: '600px',
  border: '1px solid #C0C0C0',
  position: 'relative'
};

class GraphParser {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }
  async getVisData(ids) {
    let data = {};
    // TODO this code is basically repeated from graph-redux/actions.js
    // In future the search graph should be hooked up to redux but right now we are in a rush
    // and it is not so striaght forward
    const url = new URL('/v1/resources/graph', document.baseURI);
    ids = ids.map(encodeURIComponent).join(',');
    url.searchParams.append('rs:id', ids);
    const response = await fetch(url.toString());
    data = await response.json();
    if (data && data.nodes) {
      data.nodes.forEach(node => {
        if (node.group) {
          node.group = node.group.toLowerCase();
        }
      });
    }
    return data;
  }

  async getEntity(id) {
    let data = {};
    const url = new URL('/v1/resources/entity', document.baseURI);
    url.searchParams.append('rs:id', encodeURIComponent(id));
    const response = await fetch(url.toString());
    data = await response.json();
    return data.entity || {};
  }

  async getRecommendedData(ids) {
    let data = {};
    // TODO this code is basically repeated from graph-redux/actions.js
    // In future the search graph should be hooked up to redux but right now we are in a rush
    // and it is not so straight forward
    const url = new URL('/v1/resources/recommend', document.baseURI);
    const response = await fetch(url.toString(), {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: ids })
    });

    data = await response.json();
    if (data && data.nodes) {
      data.nodes.forEach(node => {
        if (node.group) {
          node.group = node.group.toLowerCase();
        }
      });
    }

    return data;
  }
}

function drawGlyph(ctx, label, node) {
  const height = 20;
  ctx.font = `bold ${height}px sans-serif`;
  const width = ctx.measureText(label).width;
  const startPos = [node.x - width / 2, node.y - node.baseSize + height / 2];
  const endPos = [startPos[0] + width, startPos[1]];
  ctx.strokeStyle = 'rgb(0, 220, 240)';
  ctx.lineWidth = height + 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(...startPos);
  ctx.lineTo(...endPos);
  ctx.stroke();
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, startPos[0], startPos[1] + height / 2 + 1);
  ctx.fill();
}

function drawIconGlyph(ctx, icon, node) {
  const image = new Image(20, 20);
  image.src = icon;
  const size = 30;
  const startPos = [
    node.x + node.baseSize - size / 2,
    node.y - node.baseSize + size / 2
  ];
  const endPos = [startPos[0], startPos[1]];
  ctx.strokeStyle = '#f5f5f5';
  ctx.lineCap = 'round';
  ctx.lineWidth = size + 4;
  ctx.beginPath();
  ctx.moveTo(...startPos);
  ctx.lineTo(...endPos);
  ctx.stroke();
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.drawImage(
    image,
    startPos[0] - size / 2,
    startPos[1] - size / 2,
    size,
    size
  );
  ctx.fill();
}

const GraphView = props => {
  const container = useRef(null);
  const [network, setNetwork] = useState();
  const [currentIds, setCurrentIds] = useState([]);
  const [currentNodeFilters, setCurrentNodeFilters] = useState([]);
  const [searching, setSearching] = useState(false);
  const [nodeFilterToAdd, setNodeFilterToAdd] = useState();
  const [nodeFilterToRemove, setNodeFilterToRemove] = useState();
  const [dataToAdd, setDataToAdd] = useState();
  const [dataToRemove, setDataToRemove] = useState();
  const [shadowNodesSet] = useState(new vis.DataSet({}));
  const [nodesSet] = useState(new vis.DataSet({ queue: true }));
  const [shadowEdgesSet] = useState(new vis.DataSet({}));
  const [edgesSet] = useState(new vis.DataSet({}));
  const [nodeDropdown, setNodeDropdown] = useState();
  const [typeToConnect, setTypeToConnect] = useState('author');
  const graphParser = new GraphParser();

  var recommendCheck = React.createRef();

  var groupPrefix = {};

  let groupsOptions = {
    Unknown: {
      shape: 'circle',
      color: '#999'
    }
  };

  ConceptRegistry.getAllClasses().forEach(conceptClass => {
    groupsOptions = {
      ...groupsOptions,
      ...conceptClass.getGraphGroupOptions(),
    };

    groupPrefix = {
      ...groupPrefix,
      ...conceptClass.getGraphGroupPrefixes()
    }
  });
  EntityRegistry.getAllClasses().forEach(entityClass => {
    groupsOptions = {
      ...groupsOptions,
      ...entityClass.getGraphGroupOptions(),
    };

    groupPrefix = {
      ...groupPrefix,
      ...entityClass.getGraphGroupPrefixes()
    }
  });

  const hrefFor = targetNode => {
    // Be aware that targetNode.group strings are lowercase converted
    let prefix = groupPrefix[targetNode.group];
    if (prefix) {
      return `/${prefix}?id=${encodeURIComponent(targetNode.id)}`;
    }
  };

  const options = {
    nodes: {
      font: {
        strokeWidth: 0,
        size: 30,
        background: '#f4f4f4'
      },
      size: 40,
      margin: 20,
      shape: 'circularImage',
      image: genericIcon
    },
    edges: {
      font: {
        size: 10,
        align: 'bottom'
      },
      width: 3,
      color: {
        // color: edgeColour
        inherit: 'both'
      }
    },
    interaction: {
      hover: true
    },
    physics: {
      // enabled: false,
      solver: 'forceAtlas2Based',
      forceAtlas2Based: {
        gravitationalConstant: -100,
        centralGravity: 0.008,
        springLength: 100,
        springConstant: 0.05,
        damping: 0.4,
        avoidOverlap: 0
      },
      maxVelocity: 150, // default 50
      minVelocity: 6, // default 0.1
      stabilization: {
        enabled: true,
        iterations: 100,
        onlyDynamicEdges: false,
        fit: true
      },
      timestep: 0.5,
      adaptiveTimestep: true
    },
    groups: groupsOptions
  };

  useEffect(
    () => {
      if (!network && container && container.current) {
        const newNetwork = new vis.Network(
          container.current,
          { nodes: nodesSet, edges: edgesSet },
          options
        );
        newNetwork.on('click', params => {
          if (params.nodes[0]) {
            let targetNode = nodesSet.get(params.nodes[0]);
            if (targetNode) {
              handleTitle(params.nodes[0], targetNode);
            }
          }
        });
        newNetwork.on('afterDrawing', ctx => {
          for (let id in newNetwork.body.nodes) {
            if (newNetwork.body.nodes.hasOwnProperty(id)) {
              const node = newNetwork.body.nodes[id];
              const rawNode = newNetwork.body.data.nodes._data[id];
              if (rawNode) {
                if (rawNode.group === 'mediator') {
                  drawGlyph(ctx, 'INTERNAL', node);
                } else if (rawNode.group === 'proteinfamily') {
                  drawIconGlyph(ctx, usersIcon, node);
                }
              }
            }
          }
        });
        newNetwork.on('doubleClick', params => {
          newNetwork.stopSimulation();
          setNodeDropdown(null);
          const nodeURI = params.nodes[0];
          if (nodeURI) {
            updateNodesAndEdges([nodeURI]);
          }
        });
        newNetwork.on('oncontext', params => {
          params.event.preventDefault();
          newNetwork.stopSimulation();
          setNodeDropdown(null);
          const coordinates = params.pointer.DOM;
          const targetNodeId = newNetwork.getNodeAt(coordinates);
          let targetNode;
          if (targetNodeId) {
            targetNode = nodesSet.get(targetNodeId);
          }
          if (targetNode) {
            setNodeDropdown({ coordinates, targetNode });
          }
        });
        newNetwork.on('hoverNode', params => {
          if (params.node) {
            let targetNode = nodesSet.get(params.node);
            if (targetNode) {
              handleTitle(params.node, targetNode);
            }
          }
        });
        setNetwork(newNetwork);
      }
    },
    [container]
  );
  useEffect(
    () => {
      if (nodeFilterToAdd) {
        setNodeFilterToAdd();
        setCurrentNodeFilters([...currentNodeFilters, nodeFilterToAdd]);
      }
    },
    [nodeFilterToAdd]
  );

  const updateNetwork = () => {
    const toRemove = shadowNodesSet.get({
      filter: node =>
        currentNodeFilters.map(f => f.filter).some(filter => filter(node))
    });
    nodesSet.update(
      shadowNodesSet.get({
        filter: node =>
          currentNodeFilters.map(f => f.filter).every(filter => !filter(node))
      })
    );
    nodesSet.remove(toRemove);
    nodesSet.flush();
    edgesSet.update(shadowEdgesSet.get());
  };

  const addDataToNetwork = data => {
    if (data) {
      if (data.nodes) {
        shadowNodesSet.update(data.nodes);
      }
      if (data.edges) {
        shadowEdgesSet.update(data.edges);
      }
      setDataToAdd(data);
    }
  };

  useEffect(updateNetwork, [dataToAdd, currentNodeFilters]);

  useEffect(
    () => {
      if (!dataToRemove) {
        return;
      }
      shadowNodesSet.remove(dataToRemove.nodes);
      nodesSet.remove(dataToRemove.nodes);
      nodesSet.flush();
      shadowEdgesSet.remove(dataToRemove.edges);
      edgesSet.remove(dataToRemove.edges);
      setDataToRemove(null);
    },
    [dataToRemove]
  );

  const handleTitle = async (id, targetNode) => {
    // Lookup node details when it hasn't already been loaded.
    if (!targetNode.title) {
      let data = await graphParser.getEntity(id);
      let type = data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : null;
      let conceptClass = ConceptRegistry.getClass(type)
      if (!conceptClass) {
        conceptClass = EntityRegistry.getClass(type)
        if (!conceptClass) {
          return;
        }
      }
      let concept = conceptClass.getInstance(data);
      if (concept) {
        let conceptTitle = concept.getGraphTitle();
        if (conceptTitle) {
          targetNode.title = conceptTitle;
          addDataToNetwork({ nodes: [targetNode] });
        }
      }
    }
  };




  const updateNodesAndEdges = async (uris, options = {}) => {
    if (!uris || uris.length === 0) {
      return;
    }
    const data = await graphParser.getVisData(uris);
    let nodes = data.nodes;
    let edges = data.edges;
    const urisSet = new Set(uris);
    if (options.only) {
      let removedNodes = [];
      if (nodes) {
        nodes = nodes.filter(node => {
          const matches = urisSet.has(node.id) || node.group === options.only;
          if (!matches) {
            removedNodes.push(node.id);
          }
          return matches;
        });
      }
      if (edges) {
        edges = edges.filter(edge => {
          return !removedNodes.some(
            nodeId => edge.from === nodeId || edge.to === nodeId
          );
        });
      }
    }
    addDataToNetwork(massageData({ nodes, edges }));
  };

  const updateRecommendedNodesAndEdges = async (options = {}) => {
    // Collect the visible nodes.  The forEach loop is necessary because
    // some of the objects do not have an 'id' property.
    const visibleNodes = Object.values(network.body.data.nodes._data);
    const visibleIds = [];
    visibleNodes.forEach(x => {
      if (x.id) {
        visibleIds.push(x.id);
      }
    });
    const data = await graphParser.getRecommendedData(visibleIds);

    let nodes = data.nodes;
    let edges = data.edges;
    const urisSet = new Set(visibleIds);
    if (options.only) {
      let removedNodes = [];
      if (nodes) {
        nodes = nodes.filter(node => {
          const matches = urisSet.has(node.id) || node.group === options.only;
          if (!matches) {
            removedNodes.push(node.id);
          }
          return matches;
        });
      }
      if (edges) {
        edges = edges.filter(edge => {
          return !removedNodes.some(
            nodeId => edge.from === nodeId || edge.to === nodeId
          );
        });
      }
    }

    // Remove recommended edges that overlap with existing edges to prevent
    // duplicate links from being rendered.
    let currentEdges = shadowEdgesSet.get();
    if (edges) {
      edges = edges.filter(edge => {
        return !currentEdges.some(
          currentEdge =>
            edge.from === currentEdge.from && edge.to === currentEdge.to
        );
      });
    }

    addDataToNetwork(massageData({ nodes, edges }));
  };

  const diffDataAndApplyChanges = data => {
    // Possibly, in the future, keep track of the original ids
    // to calculate toRemove, check them first. If it has to be removed,
    // check its neighbors. If each has to be removed, cascade forward
    // and check neighbors.
    //
    // This would allow you to keep work done by the user in expanding
    // out and exploring the graph (unless it has its legs cut out from
    // under it, because it no longer links to an original node)
    //
    if (!data) {
      return;
    }
    const stagedNodes = data.nodes || [];
    const newNodeIds = stagedNodes.map(node => node.id);
    const toRemove = shadowNodesSet.get({
      filter: node => !newNodeIds.includes(node.id)
    });
    // Not removing edges, as a feature, at least for now
    // Open to learning from experience here.
    setDataToRemove({ nodes: toRemove });
    addDataToNetwork(data);
  };

  const massageData = data => {
    if (data) {
      if (data.nodes) {
        data.nodes.forEach(node => {
          node.label = truncateLabel(node.label);
          if (node.level === 0) {
            node.size = 60;
          }
        });
      }

      if (data.edges) {
        data.edges.forEach(edge => {
          edge.id = [edge.from, edge.to].sort().join('-');
        });
      }
    }

    return data;
  };

  useEffect(
    () => {
      (async () => {
        let data;
        setSearching(false);
        if (props.ids && !isEqual(props.ids, currentIds)) {
          setCurrentIds(props.ids);
          setSearching(true);
          data =
            props.ids.length > 0 ? await graphParser.getVisData(props.ids) : {};
        } else {
          data = props.data;
        }
        diffDataAndApplyChanges(massageData(data));
        if (recommendCheck.current && recommendCheck.current.checked) {
          await updateRecommendedNodesAndEdges();
        }
        setSearching(false);
      })();
    },
    [props.data, props.ids]
  );

  useEffect(
    () => {
      if (nodeFilterToRemove) {
        setCurrentNodeFilters(
          currentNodeFilters.filter(f => f.id !== nodeFilterToRemove)
        );
      }
    },
    [nodeFilterToRemove]
  );

  const removeNodeFilter = id => setNodeFilterToRemove(id);

  const addNodeGroupFilter = targetNode => {
    if (targetNode) {
      const group = targetNode.group;
      setNodeFilterToAdd({
        id:
          'nodeFilter-' +
          Math.random()
            .toString(36)
            .substr(2, 16),
        description: `Hiding ${group}s`,
        filter: node => node.group === group
      });
    }
  };

  const handleIncludeRecommendationsChanged = event => {
    network.stopSimulation();
    setNodeDropdown(null);

    if (event.target.checked) {
      // Get recommended data.
      updateRecommendedNodesAndEdges();
    } else {
      // Hide the recommended data on the graph.
      let nodes = Object.values(network.body.data.nodes._data);
      nodes = nodes.filter(val => val.group.endsWith('recommendation'));
      setDataToRemove({ nodes: nodes });
    }
  };

  return (
    <div style={{position: 'relative'}}>
      <div>
        <span>
          <input
            ref={recommendCheck}
            name="includeRecommendations"
            type="checkbox"
            checked={props.includeRecommendations}
            onChange={handleIncludeRecommendationsChanged}
          />
          <span> Include Recommendations</span>
        </span>
      </div>
      <WaitSpinner show={searching} />
      <div ref={container} style={chartStyle} id="chart">
        {nodeDropdown ? (
          <GraphContextMenu
            typeToConnect={typeToConnect}
            setTypeToConnect={setTypeToConnect}
            targetNode={nodeDropdown.targetNode}
            close={() => setNodeDropdown(null)}
            detailHref={hrefFor(nodeDropdown.targetNode)}
            positionStyle={{
              position: 'absolute',
              top: nodeDropdown.coordinates.y,
              left: nodeDropdown.coordinates.x
            }}
            updateNodesAndEdges={updateNodesAndEdges}
            removeNode={() => {
              setDataToRemove({
                nodes: [nodeDropdown.targetNode],
                edges: network.getConnectedEdges(nodeDropdown.targetNode.id)
              });
            }}
            addNodeGroupFilter={addNodeGroupFilter}
            removeOrphanNodes={() => {
              const nodesToRemove = shadowNodesSet.get({
                filter: node => network.getConnectedEdges(node.id).length === 0
              });
              setDataToRemove({ nodes: nodesToRemove });
            }}
          />
        ) : null}
      </div>
      <div>
        {currentNodeFilters.map(filter => (
          <Fade key={filter.id}>
            <div
              className="grove-current-filter cf-button"
              style={{ cursor: 'pointer' }}
              onClick={() => removeNodeFilter(filter.id)}
            >
              <i className="glyphicon glyphicon-remove-circle icon-white ml-facet-remove-filter" />{' '}
              {filter.description}
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
};

export default GraphView;
