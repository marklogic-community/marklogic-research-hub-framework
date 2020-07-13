import React from 'react';
import './WaitSpinner.css';

class WaitSpinner extends React.Component {
  render() {
    let retval = this.props.show ? (
      <div className="wait-spinner">
        <div>Searching...
        <i className="fa fa-circle-notch fa-spin" />

        </div>
      </div>

    ) : (
      ''
    );
    return retval;
  }
}
export default WaitSpinner;
