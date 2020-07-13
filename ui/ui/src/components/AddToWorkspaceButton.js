import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import EntitiesWorkspaceConnector from '../containers/EntitiesWorkspaceConnector';
import AddToCaseModal from './AddToCaseModal';

class AddToWorkspaceButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };

    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
  }

  closeModal() {
    this.setState({ showModal: false });
  }
  openModal() {
    this.setState({ showModal: true });
  }

  render() {
    return (
      <>
        <Button
          bsSize="small"
          title="Add to Case"
          className="tertiary bright-pink-accent-fg add-to-case-button"
          disabled={
            !this.props.selectedEntities ||
            this.props.selectedEntities.length === 0
          }
          onClick={this.openModal}
        >
          <Glyphicon glyph="plus" /> Add to Workspace
        </Button>
        <AddToCaseModal show={this.state.showModal} close={this.closeModal} />
      </>
    );
  }
}

export default EntitiesWorkspaceConnector(AddToWorkspaceButton);
