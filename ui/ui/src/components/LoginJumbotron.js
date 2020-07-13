import React from 'react';
import { Row, Col, Jumbotron } from 'react-bootstrap';
import Login from './Login';

const LoginJumbotron = props => (
  <Row>
    <Col md={6} mdOffset={3} className="login-form">
      <div className="modh1 text-center login-h1">Login</div>
      <Jumbotron className="login-body">
        <Login {...props} />
      </Jumbotron>
    </Col>
  </Row>
);

export default LoginJumbotron;
