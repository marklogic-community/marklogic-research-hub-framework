import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

class Dialog extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      show: false
    };
  }

  // Handle onClick, onClick1, and onClick2 events
  handleClick(btnNbr) {
    return () => {
      if (this.props.onClick && this.props.onClick[0]) {
        if (btnNbr === 1 && this.props.onClick[0]) this.props.onClick[0]();
        else if (btnNbr === 2 && this.props.onClick[1]) this.props.onClick[1]();
      }
      this.handleClose();
    };
  }

  handleClose = () => {
    if (this.props && this.props.onClose) this.props.onClose();
    this.setState({ show: false });
  };

  static getDerivedStateFromProps(props, state) {
    if (props.show !== state.show) {
      return { show: props.show };
    }
    return {};
  }

  render() {
    let headerIcon = this.props.header ? this.props.header : 'info-circle';
    let faIcon = 'fa fa-' + headerIcon;
    let btn1Text = this.props.btn1 ? this.props.btn1 : '';
    let btn2Text = this.props.btn2 ? this.props.btn2 : '';
    let btn1 = (
      <button onClick={this.handleClick(1)} className="btn btn-default">
        {btn1Text}
      </button>
    );
    let btn2 = (
      <button onClick={this.handleClick(2)} className="btn btn-warning">
        {btn2Text}
      </button>
    );
    let buttons = this.props.btn2 ? (
      <>
        {btn1}
        {btn2}
      </>
    ) : (
      <span>{btn1}</span>
    );
    return (
      <>
        <Modal
          {...this.props}
          show={this.state.show}
          onHide={this.handleClose}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered="true"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              <i className={faIcon} />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.props.msg}</Modal.Body>
          <Modal.Footer>{buttons}</Modal.Footer>
        </Modal>
      </>
    );
  }
}

/**
 * Some commonly used types of dialogs (message box, error, yes or no, ok or cancel)
 * NOTE:   All handlers are optional (onClick, yes, no, ok, cancel)
 * EXCEPT: Although onClose is technically optional, you should add a function that sets a state to hide the dialog in the parent (see examples below)
 *         This 'lifts' the dialog's close state when the dialog is closed.
 *         Failure to do this will cause the dialog to appear whenever the parent's state changes, even if it had been closed
 */

// Example: <MsgBox msg="Hello World" onClick="[function when OK is clicked] show={this.showMb} onClose={()=>this.setState({showMb:false})}/>"
class MsgBox extends Component {
  render() {
    return (
      <Dialog
        onClose={this.props.onClose}
        show={this.props.show}
        onClick={[this.props.onClick]}
        btn1="OK"
        header="info-circle"
        msg={this.props.msg}
      />
    );
  }
}

// Example: <Error msg="Hello World" onClick="[function when Close is clicked] show={this.showErr} onClose={()=>this.setState({showErr:false})/>"
class Error extends Component {
  render() {
    return (
      <Dialog
        onClose={this.props.onClose}
        show={this.props.show}
        onClick={[this.props.onClick]}
        btn1="Close"
        header="exclamation-triangle"
        msg={this.props.msg}
      />
    );
  }
}

// Example: <YesNo msg="Do you want an answer?" yes="[function when yes is clicked]"  no="[function when no is clicked]" show={this.showYn} onClose={()=>this.setState({showYn:false})/>
class YesNo extends Component {
  render() {
    return (
      <Dialog
        onClose={this.props.onClose}
        show={this.props.show}
        onClick={[this.props.yes, this.props.no]}
        btn1="Yes"
        btn2="No"
        header="question-circle"
        msg={this.props.msg}
      />
    );
  }
}

// Example: <OkCancel msg="Do you want to proceed?" ok="[function when OK is clicked]"  cancel="[function when Cancel is clicked]" show={this.showOk} onClose={()=>this.setState({showOk:false})/>
class OkCancel extends Component {
  render() {
    return (
      <Dialog
        onClose={this.props.onClose}
        onClick={[this.props.ok, this.props.cancel]}
        btn1="OK"
        btn2="Cancel"
        header="question-circle"
        msg={this.props.msg}
      />
    );
  }
}

// Exports from ./ModalDialogs
export { MsgBox, Error, YesNo, OkCancel };
