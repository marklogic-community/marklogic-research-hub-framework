import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LoginJumbotron from '../components/LoginJumbotron';
import  {submitLogin}  from '../modified-grove-user-redux/actions'


const mapStateToProps = (state, ownProps) => ({
  from: (ownProps.location && ownProps.location.state) || { pathname: '/' }
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      submitLogin: submitLogin
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginJumbotron);
