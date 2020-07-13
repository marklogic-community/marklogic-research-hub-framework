import React from 'react';
// import { Nav, NavItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import { LinkContainer } from 'react-router-bootstrap';
import MLNavbar from './MLNavbar.js';

const brandLink = props => <Link to="/" {...props} />;
const title = process.env.REACT_APP_SERVER_TITLE;

const Navbar = props => (
  <MLNavbar
    {...props}
    brandLink={brandLink}
    logo={'/MarkLogicLogo.jpg'}
    logoStyle={{ maxHeight: '50px' }}
    title= {title}
  />
);

export default Navbar;
