import React from "react";
import {
  Container,
  FormGroup,
  Label,
  Input,
  Col,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle
} from "reactstrap";
import EditButton from "../Sales/EditButton";
import {
  stateArray,
  transaction_Delete
} from "../../services/transaction.service";
import swal from "sweetalert2";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

class TransactionCard extends React.Component {
  deleteTransaction = () => {
    let id = this.props.match.params.id;

    swal({
      title: "Are you sure?",
      text: "We can't revert any deletions made to your table.",
      type: "warning",
      cancelButtonColor: "red",
      showCancelButton: true,
      confirmButtonText: "Delete it."
    }).then(result => {
      if (result.value) {
        transaction_Delete(id).then(() => {
          swal({
            title: "File has been deleted",
            type: "success"
          }).then(() => {
            this.props.history.push("/app/sales");
          });
        });
      }
    });
  };

  leadView = () => {
    if (this.props.disabled === true) {
      return (
        <Input
          type="text"
          value={this.props.generatingLead}
          disabled={this.props.disabled}
        />
      );
    } else {
      return (
        <AsyncTypeahead
          isLoading={this.props.isLoading}
          value={this.props.generatingLead}
          disabled={this.props.editLocked}
          onChange={this.props.cardAutoComplete}
          name="generatingLead"
          labelKey="name"
          onSearch={this.props.cardSearch}
          options={this.props.options}
        />
      );
    }
  };

  setLeadType = () => {
    if (this.props.buyer === true) {
      return "Buyer";
    }
    if (this.props.seller === true) {
      return "Seller";
    }
    if (this.props.lease === true) {
      return "Lease";
    }
  };

  render() {
    return (
      <Container
        className="d-flex justify-content-center h-100"
        style={{ fontSize: "large" }}
      >
        <div
          className="jr-card col-md-10 my-auto"
          style={{ boxShadow: "5px 5px 2px black" }}
        >
          <div className="jr-card-header">
            <span>
              <div className="row">
                <Col>
                  <h1 className="text-left">{this.props.generatingLead}</h1>
                  <h3>{this.setLeadType()}</h3>
                </Col>
                <Col>
                  <UncontrolledDropdown className="float-right">
                    <DropdownToggle tag="span">
                      <span className="icon-btn text-grey pointer">
                        <i className="zmdi zmdi-more-vert zmdi-hc-lg" />
                      </span>
                    </DropdownToggle>

                    <DropdownMenu>
                      <DropdownItem onClick={this.props.toggleEdit}>
                        Edit Transaction
                      </DropdownItem>
                      <DropdownItem onClick={this.props.cancelEdit}>
                        Back
                      </DropdownItem>
                      <hr />
                      <DropdownItem onClick={this.deleteTransaction}>
                        Delete Transaction
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </Col>
              </div>
            </span>
          </div>
          <FormGroup row>
            <Col>
              <Label>Purchase Price</Label>
              <Input
                type="number"
                name="purchasePrice"
                onChange={this.props.onChange}
                value={this.props.purchasePrice}
                disabled={this.props.editLocked}
              />
            </Col>
            <Col>
              <Label>Total Commission</Label>
              <Input
                type="number"
                name="totalCommission"
                onChange={this.props.onChange}
                value={this.props.totalCommission}
                disabled={this.props.editLocked}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col>
              <Label>Fees</Label>
              <Input
                type="number"
                name="fees"
                value={this.props.fees}
                onChange={this.props.onChange}
                disabled={this.props.editLocked}
              />
            </Col>
            <Col>
              <Label>Agent Commission</Label>
              <Input
                type="number"
                name="agentCommission"
                onChange={this.props.onChange}
                value={this.props.agentCommission}
                disabled={this.props.editLocked}
              />
            </Col>
            <Col>
              <Label>Broker Commission</Label>
              <Input
                type="number"
                name="brokerCommission"
                onChange={this.props.onChange}
                value={this.props.brokerCommission}
                disabled={this.props.editLocked}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col>
              <Label>Sale Date</Label>
              <Input
                type="date"
                name="saleDate"
                onChange={this.props.onChange}
                value={this.props.saleDate}
                disabled={this.props.editLocked}
              />
            </Col>
            <Col>
              <Label>Close Date</Label>
              <Input
                type="date"
                name="closeDate"
                onChange={this.props.onChange}
                value={this.props.closeDate}
                disabled={this.props.editLocked}
              />
            </Col>
            <Col>
              <Label>Status</Label>
              <Input
                type="select"
                name="status"
                value={this.props.status}
                onChange={this.props.onChange}
                disabled={this.props.editLocked}
              >
                <option value="Closed">Closed</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Hold">Hold</option>
                <option value="W-drawn">W-drawn</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col>
              <Label>Lead Source</Label>
              {this.leadView()}
            </Col>
            <Col>
              <Label>Street Address</Label>
              <Input
                type="text"
                name="streetAddress"
                onChange={this.props.onChange}
                value={this.props.streetAddress}
                disabled={this.props.editLocked}
              />
            </Col>
            <Col className="col-md-3">
              <Label>City</Label>
              <Input
                type="text"
                name="city"
                onChange={this.props.onChange}
                value={this.props.city}
                disabled={this.props.editLocked}
              />
            </Col>
            <Col className="col-md-2">
              <Label>State</Label>
              <Input
                type="select"
                name="state"
                onChange={this.props.onChange}
                value={this.props.state}
                disabled={this.props.editLocked}
              >
                {stateArray.map((state, i) => this.props.mapStates(state, i))}
              </Input>
            </Col>
            <Col className="col-md-2">
              <Label>Postal Code</Label>
              <Input
                type="number"
                name="zipCode"
                onChange={this.props.onChange}
                value={this.props.zipCode}
                disabled={this.props.editLocked}
              />
            </Col>
          </FormGroup>

          <EditButton
            visibility={!this.props.editLocked}
            onClick={this.props.onClick}
          >
            Save Changes
          </EditButton>
          <div id="map" style={this.props.mapStyle} />
        </div>
      </Container>
    );
  }
}

export default TransactionCard;
