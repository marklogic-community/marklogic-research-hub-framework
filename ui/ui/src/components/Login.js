import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Button } from 'react-bootstrap';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loginStatus:''
    };
    this.handleLoginSubmission = this.handleLoginSubmission.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.setPassword = this.setPassword.bind(this);
  }

  handleLoginSubmission(e) {
    e.preventDefault();
    this.props.submitLogin(this.state.username, this.state.password).then(response => 
      {
        this.setState({ loginStatus: response });  
      });
  }

  setUsername(e) {
    this.setState({ username: e.target.value });
  }

  setPassword(e) {
    this.setState({ password: e.target.value });
  }
  
  render() {
    return (
      <div>
      <form onSubmit={this.handleLoginSubmission}>
        <FormGroup>
          <label className="modh5">Username</label>
          <FormControl
            type="text"
            name="username"
            onChange={this.setUsername}
            className="login-field"
          />
        </FormGroup>
        <FormGroup>
          <label className="modh5">Password</label>
          <FormControl
            type="password"
            name="password"
            onChange={this.setPassword}
            className="login-field"
          />
        </FormGroup>
        <Button type="submit" bsStyle="primary" className="btn-raised w-100">
          Sign in
        </Button>
      </form>
      <br></br>
      {this.state.loginStatus &&<div className={'text-center'} style={{backgroundColor: 'red'}} > {this.state.loginStatus}</div>}
      </div>
    );
  }
}

Login.propTypes = {
  submitLogin: PropTypes.func
};

export default Login;
