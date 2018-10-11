import React from "react";
import {
  FormGroup,
  Label,
  Input,
  Button,
  Container,
  FormFeedback
} from "reactstrap";
import { user_Create } from "../../services/user.service";
import swal from "sweetalert2";

class RegisterForm extends React.Component {
  state = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobilePhone: "",
    confirmPassword: "",
    emailInUse: false,
    validate: {
      firstNameState: false,
      lastNameState: false,
      emailState: false,
      phoneState: false,
      passwordState: false,
      confirmPasswordState: false
    }
  };

  //Lots of repetition here, but for the MVP we set up basic validation on all of the fields.
  //Would be expanded upon or cut down further down the road.

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  firstNameOnChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    const { validate } = this.state;
    if (e.target.value.length > 2) {
      validate.firstNameState = true;
    } else {
      validate.firstNameState = false;
    }
    this.setState({ validate });
  };

  lastNameOnChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    const { validate } = this.state;
    if (e.target.value.length > 2) {
      validate.lastNameState = true;
    } else {
      validate.lastNameState = false;
    }
    this.setState({ validate });
  };

  emailOnChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    const { validate } = this.state;
    if (e.target.value.length > 0) {
      validate.emailState = true;
    } else {
      validate.emailState = false;
    }
    this.setState({ validate });
  };

  phoneOnChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    const { validate } = this.state;
    if (e.target.value.length > 0) {
      validate.phoneState = true;
    } else {
      validate.phoneState = false;
    }
    this.setState({ validate });
  };

  passwordOnChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    const { validate } = this.state;
    if (e.target.value.length >= 10) {
      validate.passwordState = true;
    } else {
      validate.passwordState = false;
    }
    this.setState({ validate });
  };

  confirmPasswordOnChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    const { validate } = this.state;
    if (
      e.target.value.length >= 10 &&
      this.state.password.length == e.target.value.length &&
      e.target.value === this.state.password
    ) {
      validate.confirmPasswordState = true;
    } else {
      validate.confirmPasswordState = false;
    }
    this.setState({ validate });
  };

  toLogin = () => {
    this.props.history.push("/app/login");
  };

  onClick = () => {
    const payload = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      password: this.state.password,
      mobilePhone: this.state.mobilePhone
    };
    user_Create(payload)
      .then(() => {
        swal({
          type: "success",
          text:
            "Success! Please check your inbox for a confirmation email before logging in."
        });
      })
      .catch(error => {
        if (error.response.data.errors[0] == "Email already in use") {
          swal("Email already in use.  Please login or try another address.");
        }
      });
  };

  render() {
    const {
      firstName,
      lastName,
      email,
      password,
      mobilePhone,
      confirmPassword
    } = this.state;

    const boxStyle = {
      boxShadow: "10px 10px 5px black"
    };

    return (
      <Container className="d-flex justify-content-center h-100">
        <div className="jr-card col-md-5 my-auto" style={boxStyle}>
          <div className="jr-card-header">
            <span>
              <h1 className="text-center">Create Account</h1>
            </span>
          </div>
          <br />
          <div className="form-row">
            <FormGroup className="col">
              <Label>First Name</Label>
              <Input
                type="text"
                name="firstName"
                value={firstName}
                onChange={e => this.firstNameOnChange(e)}
                valid={this.state.validate.firstNameState === true}
                invalid={
                  this.state.validate.firstNameState === false &&
                  this.state.firstName.length > 0
                }
                required
              />
              <FormFeedback valid />
              <FormFeedback>
                Your name must be between 2 and 20 characters
              </FormFeedback>
            </FormGroup>
            <FormGroup className="col">
              <Label>Last Name</Label>
              <Input
                type="text"
                name="lastName"
                value={lastName}
                onChange={e => this.lastNameOnChange(e)}
                valid={this.state.validate.lastNameState === true}
                invalid={
                  this.state.validate.lastNameState === false &&
                  this.state.lastName.length > 0
                }
              />
              <FormFeedback valid />
              <FormFeedback>
                Your last name must be between 2 and 20 characters
              </FormFeedback>
            </FormGroup>
          </div>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={e => this.emailOnChange(e)}
              valid={this.state.validate.emailState === true}
              invalid={
                this.state.validate.emailState === false &&
                this.state.email.length > 0
              }
              required
            />
            <FormFeedback valid>
              We'll send you an email to confirm
            </FormFeedback>
            <FormFeedback>A valid email address is required</FormFeedback>
          </FormGroup>
          <div className="form-row">
            <FormGroup className="col">
              <Label>Mobile Phone</Label>
              <Input
                type="phone"
                name="mobilePhone"
                value={mobilePhone}
                onChange={e => this.phoneOnChange(e)}
                valid={this.state.validate.phoneState === true}
                invalid={
                  this.state.validate.phoneState === false &&
                  this.state.mobilePhone.length > 0
                }
                required
              />
              <FormFeedback valid>
                We'll only text when you ask us to
              </FormFeedback>
              <FormFeedback invalid>
                A primary contact number is required
              </FormFeedback>
            </FormGroup>
          </div>
          <div className="form-row">
            <FormGroup className="col">
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={e => this.passwordOnChange(e)}
                valid={this.state.validate.passwordState === true}
                invalid={
                  this.state.validate.passwordState === false &&
                  this.state.password.length > 0 &&
                  this.state.password.length < 10
                }
                required
              />
              <FormFeedback valid />
              <FormFeedback invalid>
                Your password must be at least 10 characters long
              </FormFeedback>
            </FormGroup>
            <FormGroup className="col">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={e => this.confirmPasswordOnChange(e)}
                valid={
                  this.state.validate.confirmPasswordState === true &&
                  this.state.password === this.state.confirmPassword
                }
                invalid={
                  this.state.validate.confirmPasswordState === false &&
                  this.state.confirmPassword.length > 0
                }
                required
              />
              <FormFeedback valid />
              <FormFeedback invalid>Passwords do not match</FormFeedback>
            </FormGroup>
          </div>
          <FormGroup>
            <Button
              color="primary"
              className="form-control"
              onClick={this.onClick}
              disabled={
                !this.state.validate.firstNameState ||
                !this.state.validate.lastNameState ||
                !this.state.validate.emailState ||
                !this.state.validate.phoneState ||
                !this.state.validate.passwordState ||
                !this.state.validate.confirmPasswordState
              }
            >
              Register
            </Button>
            <br />
            <span className="text-center">
              <small className="text-center">
                <p>
                  Already have an account? Click{" "}
                  <a onClick={this.toLogin}>here to sign in.</a>
                </p>
              </small>
            </span>
          </FormGroup>
        </div>
      </Container>
    );
  }
}

export default RegisterForm;
