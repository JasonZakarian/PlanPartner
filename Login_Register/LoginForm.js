import React from "react";
import {
  Container,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import {
  user_ResendConfirmation,
  login,
  loginCodes,
  user_CheckLogin
} from "../../services/user.service";
import swal from "sweetalert2";
import { connect } from "react-redux";
import { getAllIncludingInactive } from "../../services/activitytype.service";

class LoginForm extends React.Component {
  state = {
    email: "",
    password: "",
    loggedIn: null,
    name: null,
    lastName: null,
    userId: null,
    roles: null,
    avatar: null,
    validate: {
      emailState: false,
      passwordState: false
    }
  };

  user_ResendConfirmationClick = () => {
    user_ResendConfirmation(this.state.email);
    this.setState({ modal: false });
  };

  ChangeState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  emailChangeState = e => {
    this.ChangeState(e);
    const { validate } = this.state;
    if (e.target.value.length > 0) {
      validate.emailState = true;
    } else {
      validate.emailState = false;
    }
  };

  passwordChangeState = e => {
    this.ChangeState(e);
    const { validate } = this.state;
    if (e.target.value.length >= 10) {
      validate.passwordState = true;
    } else {
      validate.passwordState = false;
    }
  };

  toRegister = () => {
    this.props.history.push("/app/register");
  };

  toggle = () => {
    this.setState({ modal: false });
  };

  setStore = () => {
    this.props.setLoggedIn(this.state.loggedIn);
    this.props.setUserId(this.state.userId);
    this.props.setName(this.state.name);
    this.props.setRoles(this.state.roles);
    this.props.setLastName(this.state.lastName);
    this.props.setAvatar(this.state.avatar);
    this.props.setGoogly(this.state.googly);
    this.props.setMicrosofty(this.state.microsofty);
  };

  //Doing a lot of work here.  Checks if user is valid and if email has been confirmed before logging in.  Also
  //sets the redux store on passing login checks.
  loginCheck = () => {
    login(this.state.email, this.state.password)
      .then(response => {
        console.log(response);
        if (response.data.item == loginCodes.LOGIN_SUCCESS) {
          this.setState({ loggedIn: true });
          swal({
            type: "success",
            text: "Welcome",
            timer: 2000
          });
        } else if (response.data.item == loginCodes.LOGIN_NEEDSCONFIRMATION) {
          swal({
            title: "Almost there!",
            type: "warning",
            text:
              "Looks like we still need to confirm your email address. Please check your inbox for our message, or click the button below and we'll send you a new one.",
            showCancelButton: true,
            confirmButtonText: "Send it.",
            cancelButtonText: "Nevermind",
            cancelButtonColor: "#d33"
          }).then(result => {
            if (result.value) {
              this.user_ResendConfirmationClick();
            }
          });
        } else {
          swal({
            type: "error",
            title: "Invalid Username/Password Combo",
            text:
              "Sorry, but we can't find your account! Check your inputs and try again, or register a new account."
          });
        }
      })
      .then(() => {
        user_CheckLogin().then(response => {
          this.setState({ userId: response.data.item.userId });
          this.setState({ name: response.data.item.name });
          this.setState({ roles: response.data.item.roles });
          this.setState({ lastName: response.data.item.user.lastName });
          this.setState({ avatar: response.data.item.user.profilePicture });
          this.setState({ googly: response.data.item.user.isGoogly });
          this.setState({ microsofty: response.data.item.user.isMicrosofty });
          if (response.data.item === null) {
            this.setState({ loggedIn: false });
          } else {
            this.setState({ loggedIn: true });
          }
          this.setStore();
          getAllIncludingInactive().then(resp => {
            const allActivities = resp.data.items;
            const activityTypes = allActivities.filter(
              act => act.inactive !== true
            );
            this.props.setActivityTypes(activityTypes);
            this.props.setAllActivityTypes(allActivities);
          });
          this.props.history.push("dashboard");
        });
      });
  };

  render() {
    const { email, password } = this.state;
    const boxStyle = {
      boxShadow: "10px 10px 5px black"
    };
    return (
      <Container className="d-flex justify-content-center h-100 ">
        <div className="jr-card col-md-4 my-auto" style={boxStyle}>
          <div className="jr-card-header">
            <h1 className="text-center">Login</h1>
          </div>
          <br />
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={e => this.emailChangeState(e)}
              valid={this.state.validate.emailState === true}
              invalid={
                this.state.validate.emalState === false &&
                this.state.email.length > 0
              }
              required
            />
            <FormFeedback valid />
            <FormFeedback />
          </FormGroup>
          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={e => this.passwordChangeState(e)}
              valid={this.state.validate.passwordState === true}
              invalid={
                this.state.validate.passwordState === false &&
                this.state.password.length > 0
              }
            />
            <FormFeedback valid />
            <FormFeedback>
              Your password must be at least 10 characters long
            </FormFeedback>
          </FormGroup>
          <Button
            color="primary"
            className="form-control"
            size="sm"
            disabled={
              !this.state.validate.emailState ||
              !this.state.validate.passwordState
            }
            onClick={this.loginCheck}
          >
            Let's get started
          </Button>
          <br />
          <span className="text-center">
            <small className="text-center">
              <p>
                Need to register? Click{" "}
                <a href="javascript:void(0);" onClick={this.toRegister}>
                  here.
                </a>
              </p>
            </small>
          </span>
        </div>
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className={this.props.className}
        >
          <ModalHeader toggle={this.toggle}>You're almost there!</ModalHeader>
          <ModalBody>
            Looks like we still need to confirm your email address. Please check
            your inbox for our message, or click the link below and we'll send
            you a new one.
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.user_ResendConfirmationClick}>
              Send it!
            </Button>{" "}
            <Button color="secondary" onClick={this.toggle}>
              Nevermind
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setLoggedIn: loggedIn => dispatch({ type: "SET_LOGIN", loggedIn }),
    setUserId: userId => dispatch({ type: "SET_USERID", userId }),
    setName: name => dispatch({ type: "SET_NAME", name }),
    setRoles: roles => dispatch({ type: "SET_ROLES", roles }),
    setLastName: lastName => dispatch({ type: "SET_LASTNAME", lastName }),
    setAvatar: avatar => dispatch({ type: "SET_AVATAR", avatar }),
    setGoogly: status => dispatch({ type: "SET_GOOGLY", status }),
    setMicrosofty: status => dispatch({ type: "SET_MICROSOFTY", status }),
    setActivityTypes: setActivities =>
      dispatch({ type: "SET_ACTIVITIES", setActivities }),
    setAllActivityTypes: setActivities =>
      dispatch({ type: "SET_ALL_ACTIVITIES", setActivities })
  };
}

export default connect(
  null,
  mapDispatchToProps
)(LoginForm);
