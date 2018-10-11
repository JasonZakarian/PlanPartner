import React from "react";
import {
  Container,
  FormGroup,
  Label,
  Input,
  Col,
  Button,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Collapse,
  ListGroupItem,
  UncontrolledTooltip
} from "reactstrap";
import OrderTable from "../Sales/OrderTable";
import {
  transaction_GetById,
  transaction_Update,
  transaction_Create,
  transaction_AddressToGeo,
  transaction_GetPlanPercentages,
  transaction_PdfCreate,
  stateArray
} from "../../services/transaction.service";
import swal from "sweetalert2";
import { connect } from "react-redux";
import TransactionCard from "../Sales/TransactionCard";
import TransactionRadar from "../Sales/TransactionRadar";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import lock from "../../assets/images/lock_grey_24x24.png";
import unlock from "../../assets/images/lock_open_grey_24x24.png";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import numeral from "numeral";

class Transactions extends React.Component {
  state = {
    purchasePrice: "",
    totalCommission: "",
    fees: "",
    brokerCommission: "",
    agentCommission: "",
    saleDate: "",
    closeDate: "",
    status: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    currentUser: this.props.currentUser,
    currentSale: "",
    editLocked: true,
    collapse: false,
    commissionPercentage: "",
    commissionSplit: "",
    stateArray: stateArray,
    value: "",
    currentPage: 0,
    isLoading: false,
    options: [],
    generatingLead: "",
    generatingLeadId: "",
    offTheTopPercentage: "",
    buyer: "",
    seller: "",
    lease: "",
    mapStyle: {
      height: "400px",
      width: "100%",
      marginTop: "3em"
    },
    transactionsStyle: {
      boxShadow: "10px 10px 5px black"
    },
    boxStyle: {
      boxShadow: "10px 10px 5px black"
    },
    marginShift: {
      marginLeft: "3em"
    },
    marginShiftReverse: {
      marginRight: "1px"
    },
    splitLock: true,
    ottLock: true,
    ottLockImage: lock,
    splitLockImage: lock
  };

  //Checks for a currently selected sale and goes into edit mode if one is present.
  //If not, goes to a table view instead.
  componentDidMount() {
    if (this.props.match.params.id != null) {
      transaction_GetById(this.props.match.params.id)
        .then(response => {
          this.setState({
            currentSale: response.data.item
          });
        })
        .then(() => {
          this.setState({
            purchasePrice: this.state.currentSale.purchasePrice,
            totalCommission: this.state.currentSale.totalCommission,
            agentCommission: this.state.currentSale.agentCommission,
            fees: this.state.currentSale.fees,
            brokerCommission: this.state.currentSale.brokerCommission,
            saleDate: this.state.currentSale.saleDate.substring(0, 10),
            closeDate: this.state.currentSale.closeDate.substring(0, 10),
            streetAddress: this.state.currentSale.streetAddress,
            status: this.state.currentSale.status,
            city: this.state.currentSale.city,
            state: this.state.currentSale.state,
            zipCode: this.state.currentSale.zipCode,
            generatingLead: this.state.currentSale.fullName,
            generatingLeadId: this.state.currentSale.lead_Id,
            buyer: this.state.currentSale.buyer,
            seller: this.state.currentSale.seller,
            lease: this.state.currentSale.lease
          });
        })
        .then(() => {
          if (this.state.currentSale.streetAddress) {
            this.addressToGeo();
          }
        });
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  cancelEdit = () => {
    this.props.history.push("/app/sales");
  };

  toggleEdit = () => {
    this.setState({ editLocked: false });
  };

  onClick = () => {
    const payload = {
      id: this.props.match.params.id,
      userId: this.state.currentUser,
      purchasePrice: this.state.purchasePrice,
      totalCommission: this.state.totalCommission,
      fees: this.state.fees,
      agentCommission: this.state.agentCommission,
      brokerCommission: this.state.brokerCommission,
      saleDate: this.state.saleDate,
      closeDate: this.state.closeDate,
      status: this.state.status,
      streetAddress: this.state.streetAddress,
      city: this.state.city,
      state: this.state.state,
      zipCode: this.state.zipCode,
      lead_id: this.state.generatingLeadId
    };

    transaction_Update(this.state.currentUser, payload).then(() => {
      swal("Transaction Updated");
      this.props.history.push("/app/sales");
    });
  };

  toggle = () => {
    transaction_GetPlanPercentages().then(response => {
      this.setState({ offTheTopPercentage: response.data.item.franchiseFee });
      this.setState({
        commissionSplit: response.data.item.commissionSplit
      });
      this.setState({ collapse: !this.state.collapse });
    });
  };

  submitTransaction = () => {
    const payload = {
      userId: this.state.currentUser,
      purchasePrice: parseFloat(this.state.purchasePrice),
      totalCommission: parseFloat(this.state.totalCommission),
      fees: parseFloat(this.state.fees),
      agentCommission: parseFloat(this.state.agentCommission),
      brokerCommission: parseFloat(this.state.brokerCommission),
      saleDate: this.state.saleDate,
      closeDate: this.state.closeDate,
      status: this.state.status,
      streetAddress: this.state.streetAddress,
      city: this.state.city,
      state: this.state.state,
      zipCode: this.state.zipCode,
      lead_id: this.state.generatingLeadId
    };

    transaction_Create(payload)
      .then(() => {
        swal("New sale submitted!");
        this.props.history.push("/app/sales");
      })
      .catch(error => {
        console.log(error);
      });
  };

  //Google Map API functions
  addressToGeo = () => {
    let address = this.state.currentSale.streetAddress;
    let city = this.state.currentSale.city;
    let state = this.state.currentSale.state;

    transaction_AddressToGeo(address, city, state)
      .then(response => {
        this.initMap(
          response.data.results[0].geometry.location.lat,
          response.data.results[0].geometry.location.lng
        );
      })
      .catch(error => {
        console.log(error);
      });
  };

  initMap = (lat, lng) => {
    var focus = { lat: lat, lng: lng };
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: focus
    });
    var marker = new google.maps.Marker({ position: focus, map: map });
  };

  mapStates(state, i) {
    return (
      <option key={i} value={state}>
        {state}
      </option>
    );
  }

  //Lots of conditional calculations here to autofill fields when creating a new sale.
  //Checks to make sure certain values are present before doing the math so we don't lose
  //our place.
  checkCalc = e => {
    let rate = "";
    let price = "";
    let totalCommission = "";

    if (
      (this.state.purchasePrice != null || e.target.name === "purchasePrice") &&
      (this.state.purchasePrice != "" || e.target.name === "purchasePrice") &&
      (this.state.commissionPercentage != "" ||
        e.target.name === "commissionPercentage") &&
      (this.state.commissionPercentage != null ||
        e.target.name === "commissionPercentage")
    ) {
      if (e.target.name === "commissionPercentage") {
        rate = e.target.value;
        price = this.state.purchasePrice;
      } else {
        rate = this.state.commissionPercentage;
        price = e.target.value;
      }

      price = parseFloat(price, 10).toFixed(2);
      rate = (parseFloat(rate, 10).toFixed(2) / 100).toFixed(4);
      totalCommission = parseFloat(price * rate).toFixed(2);

      this.setState({
        totalCommission: totalCommission
      });
    }
    if (
      (e.target.value === null || e.target.value === "") &&
      this.state.commissionSplitLock === false
    ) {
      this.setState({ brokerCommission: "" });
      this.setState({ agentCommission: "" });
      this.setState({ commissionSplit: "" });
      this.setState({ totalCommission: "" });
    }
    if (
      (e.target.value === null || e.target.value === "") &&
      this.state.commissionSplitLock === true
    ) {
      this.setState({ brokerCommission: "" });
      this.setState({ agentCommission: "" });
    }
    if (
      e.target.value != null &&
      e.target.value != "" &&
      this.state.commissionSplit != null &&
      this.state.commissionSplit != ""
    ) {
      this.commissionPopulator(totalCommission);
    }
  };

  totalCommissionAutoCalc = e => {
    this.setState({ [e.target.name]: e.target.value });
    this.checkCalc(e);
  };

  commissionSplitAutoCalc = e => {
    this.setState({ [e.target.name]: e.target.value });
    if (e.target.name === "fees" && e.target.value == "") {
      e.target.value = 0;
    }
    this.commissionPopulator(e);
  };

  commissionPopulator = e => {
    let split = "";
    let totalCommission = "";
    let fees = "";
    let ott = "";
    let agentCommission = "";
    let brokerCommission = "";

    if (e.target && e.target.name === "commissionSplit") {
      split = e.target.value;
      totalCommission = this.state.totalCommission;
      fees = this.state.fees;
      ott = this.state.offTheTopPercentage;
    } else if (e.target && e.target.name === "fees") {
      split = this.state.commissionSplit;
      totalCommission = this.state.totalCommission;
      fees = e.target.value;
      ott = this.state.offTheTopPercentage;
    } else if (e.target && e.target.name === "offTheTopPercentage") {
      split = this.state.commissionSplit;
      totalCommission = this.state.totalCommission;
      fees = this.state.fees;
      ott = e.target.value;
    } else {
      split = this.state.commissionSplit;
      totalCommission = e;
      fees = this.state.fees;
      ott = this.state.offTheTopPercentage;
    }

    if (
      totalCommission != null &&
      totalCommission != "" &&
      (fees != null && fees != "") &&
      (ott != null && ott != "") &&
      (split != null && split != "")
    ) {
      ott = parseFloat((parseFloat(ott, 10).toFixed(2) / 100).toFixed(4));
      fees = parseFloat(parseFloat(fees, 10).toFixed(2));
      totalCommission = parseFloat(parseFloat(totalCommission, 10).toFixed(2));

      totalCommission = parseFloat(
        (totalCommission - totalCommission * ott).toFixed(2)
      );

      agentCommission = parseFloat(
        (totalCommission * (parseFloat(split) / 100)).toFixed(2)
      );
      brokerCommission = parseFloat(
        (totalCommission - agentCommission).toFixed(2)
      ).toFixed(2);

      agentCommission = (agentCommission - fees).toFixed(2);

      this.setState({ agentCommission: agentCommission });
      this.setState({ brokerCommission: brokerCommission });
    }
  };

  populateConversions = () => {
    this.state.metrics.map(activity => {
      return (
        <ListGroupItem>
          <b>{activity.name}</b>:{" "}
          {((activity.salesCount / activity.leadsGenerated) * 100).toFixed(2)}%
        </ListGroupItem>
      );
    });
  };

  ottToggle = () => {
    this.setState({ ottTipOpen: !ottTipOpen });
  };

  cardAutoComplete = e => {
    if (e[0]) {
      this.setState({ generatingLead: e[0].name });
      this.setState({ generatingLeadId: e[0].id });
    }
  };

  cardSearch = query => {
    this.setState({ isLoading: true });
    fetch(`/api/transactions?Search=${query}`)
      .then(resp => resp.json())
      .then(json =>
        this.setState({
          isLoading: false,
          options: json.items
        })
      );
  };

  ottLockToggle = () => {
    if (this.state.ottLock === true) {
      this.setState({ ottLock: false });
      this.setState({ ottLockImage: unlock });
    } else {
      this.setState({ ottLock: true });
      this.setState({ ottLockImage: lock });
    }
  };

  splitLockToggle = () => {
    if (this.state.splitLock === true) {
      this.setState({ splitLock: false });
      this.setState({ splitLockImage: unlock });
    } else {
      this.setState({ splitLock: true });
      this.setState({ splitLockImage: lock });
    }
  };

  //Creates downloadable PDF of all of a user's sales.
  createPdf = () => {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    transaction_PdfCreate().then(response => {
      let results = response.data.items;
      console.log(results);

      pdfMake.tableLayouts = {
        transactionLayout: {
          vLineWidth: function(i) {
            return 1;
          },
          hLineWidth: function(i) {
            return 1;
          },
          paddingTop: function(i) {
            return 10;
          },
          paddingBottom: function(i) {
            return 10;
          }
        }
      };

      let body = [
        [
          { text: "Lead Source", bold: true },
          { text: "Address", bold: true },
          { text: "Purchase Price", bold: true },
          { text: "Total Commission", bold: true },
          { text: "Agent Commission", bold: true },
          { text: "Sale Date", bold: true },
          { text: "Close Date", bold: true }
        ]
      ];

      results.map(person => {
        let tempArray = [];
        tempArray.push(person.fullName);
        tempArray.push(person.streetAddress);
        tempArray.push(numeral(person.purchasePrice).format("$0,0.00"));
        tempArray.push(numeral(person.totalCommission).format("$0,0.00"));
        tempArray.push(numeral(person.agentCommission).format("$0,0.00"));
        tempArray.push(person.saleDate.slice(0, 10));
        tempArray.push(person.closeDate.slice(0, 10));
        body.push(tempArray);
      });

      let docDefinition = {
        pageOrientation: "landscape",
        info: {
          title: "sales"
        },
        content: [
          {
            text: `All Sales for ${this.props.name} ${this.props.lastName} `,
            style: "subheader",
            fontSize: 16,
            marginBottom: 2
          },
          {
            layout: "transactionLayout",
            table: {
              headerRows: 1,
              body
            }
          }
        ]
      };
      pdfMake.createPdf(docDefinition).download("sales");
    });
  };

  render() {
    const { mapStyle, boxStyle, transactionsStyle } = this.state;

    //Elminates the map window if no address information is present on selected transaction
    if (this.state.currentSale) {
      if (this.state.currentSale.streetAddress == null) {
        mapStyle.height = "0px";
      }
    }
    //Edit form
    if (this.props.match.params.id != null) {
      return (
        <div className="d-flex justify-content-center h-100">
          <TransactionCard
            {...this.props}
            boxStyle={boxStyle}
            saleId={this.props.match.params.id}
            toggleEdit={this.toggleEdit}
            onChange={this.onChange}
            cancelEdit={this.cancelEdit}
            disabled={this.state.editLocked}
            onClick={this.onClick}
            mapStyle={mapStyle}
            editLocked={this.state.editLocked}
            mapStates={this.mapStates}
            purchasePrice={this.state.purchasePrice}
            totalCommission={this.state.totalCommission}
            fees={this.state.fees}
            brokerCommission={this.state.brokerCommission}
            agentCommission={this.state.agentCommission}
            saleDate={this.state.saleDate}
            closeDate={this.state.closeDate}
            status={this.state.status}
            streetAddress={this.state.streetAddress}
            city={this.state.city}
            state={this.state.state}
            zipCode={this.state.zipCode}
            generatingLead={this.state.generatingLead}
            currentUser={this.props.currentUser}
            options={this.state.options}
            cardSearch={this.cardSearch}
            isLoading={this.state.isLoading}
            cardAutoComplete={this.cardAutoComplete}
            buyer={this.state.buyer}
            seller={this.state.seller}
            lease={this.state.lease}
          />
        </div>
      );
    } else {
      return (
        <div
          className="justify-content-center h-100"
          style={{ fontSize: "large" }}
        >
          <Collapse isOpen={this.state.collapse}>
            <Container className="d-flex justify-content-center h-100">
              <div
                className="jr-card col-md-12 my-auto justify-content-center"
                style={boxStyle}
              >
                <div className="jr-card-header">
                  <span>
                    <div className="row">
                      <Col>
                        <h1 className="text-left">Enter New Sale</h1>
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
                      onChange={this.totalCommissionAutoCalc}
                      value={this.state.purchasePrice}
                    />
                  </Col>
                  <Col>
                    <Label>Commission %</Label>
                    <Input
                      type="select"
                      name="commissionPercentage"
                      onChange={this.totalCommissionAutoCalc}
                      value={this.state.commissionPercentage}
                    >
                      <option value={null} />
                      <option value="4">4%</option>
                      <option value="3.75">3.75%</option>
                      <option value="3.5">3.5%</option>
                      <option value="3.25">3.25%</option>
                      <option value="3">3%</option>
                      <option value="2.75">2.75%</option>
                      <option value="2.5">2.5%</option>
                      <option value="2.25">2.25%</option>
                      <option value="2">2%</option>
                    </Input>
                  </Col>
                  <Col md={{ offset: ".5" }}>
                    <Label>Total Commission</Label>
                    <Input
                      type="number"
                      name="totalCommission"
                      onChange={this.onChange}
                      value={this.state.totalCommission}
                    />
                  </Col>
                  <Col>
                    <Label id="ottTip">
                      OTT %
                      <img
                        src={this.state.ottLockImage}
                        onClick={this.ottLockToggle}
                      />
                    </Label>
                    <UncontrolledTooltip placement="right" target="ottTip">
                      This is the percentage you used in your business plan, but
                      you can change it by unlocking.
                    </UncontrolledTooltip>
                    <Input
                      type="select"
                      name="offTheTopPercentage"
                      onChange={this.commissionSplitAutoCalc}
                      value={this.state.offTheTopPercentage}
                      disabled={this.state.ottLock}
                    >
                      <option value={null} />
                      <option value="10">10%</option>
                      <option value="9">9%</option>
                      <option value="8">8%</option>
                      <option value="7">7%</option>
                      <option value="6">6%</option>
                      <option value="5">5%</option>
                    </Input>
                  </Col>
                  <Col>
                    <Label>Additional Fees</Label>
                    <Input
                      type="number"
                      name="fees"
                      value={this.state.fees}
                      onChange={this.commissionSplitAutoCalc}
                    />
                  </Col>

                  <Col>
                    <Label id="splitTip">
                      Split %{" "}
                      <img
                        src={this.state.splitLockImage}
                        onClick={this.splitLockToggle}
                      />
                    </Label>
                    <UncontrolledTooltip placement="right" target="splitTip">
                      This is the percentage you used in your business plan, but
                      you can change it by unlocking.
                    </UncontrolledTooltip>
                    <Input
                      type="select"
                      name="commissionSplit"
                      onChange={this.commissionSplitAutoCalc}
                      value={this.state.commissionSplit}
                      disabled={this.state.splitLock}
                    >
                      <option value={null} />
                      <option value="100">100/0%</option>
                      <option value="85">85/15%</option>
                      <option value="80">80/20%</option>
                      <option value="75">75/25%</option>
                      <option value="70">70/30%</option>
                      <option value="65">65/35%</option>
                      <option value="60">60/40%</option>
                    </Input>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col>
                    <Label>Agent Commission</Label>
                    <Input
                      type="number"
                      name="agentCommission"
                      onChange={this.onChange}
                      value={this.state.agentCommission}
                    />
                  </Col>
                  <Col>
                    <Label>Broker Commission</Label>
                    <Input
                      type="number"
                      name="brokerCommission"
                      onChange={this.onChange}
                      value={this.state.brokerCommission}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col>
                    <Label>Sale Date</Label>
                    <Input
                      type="date"
                      name="saleDate"
                      onChange={this.onChange}
                      value={this.state.saleDate}
                    />
                  </Col>
                  <Col>
                    <Label>Close Date</Label>
                    <Input
                      type="date"
                      name="closeDate"
                      onChange={this.onChange}
                      value={this.state.closeDate}
                    />
                  </Col>
                  <Col>
                    <Label>Lead Source</Label>
                    <AsyncTypeahead
                      isLoading={this.state.isLoading}
                      value={this.state.generatingLead}
                      onChange={e => {
                        if (e[0]) {
                          this.setState({ generatingLead: e[0].name });
                          this.setState({ generatingLeadId: e[0].id });
                        }
                      }}
                      name="generatingLead"
                      labelKey="name"
                      onSearch={query => {
                        this.setState({ isLoading: true });
                        fetch(`/api/transactions?Search=${query}`)
                          .then(resp => resp.json())
                          .then(json =>
                            this.setState({
                              isLoading: false,
                              options: json.items
                            })
                          );
                      }}
                      options={this.state.options}
                    />
                  </Col>
                  <Col>
                    <Label>Status</Label>
                    <Input
                      type="select"
                      name="status"
                      value={this.state.status}
                      onChange={this.onChange}
                    >
                      <option value="---">---</option>
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
                    <Label>Street Address</Label>
                    <Input
                      type="text"
                      name="streetAddress"
                      onChange={this.onChange}
                      value={this.state.streetAddress}
                    />
                  </Col>
                  <Col>
                    <Label>City</Label>
                    <Input
                      type="text"
                      name="city"
                      onChange={this.onChange}
                      value={this.state.city}
                    />
                  </Col>
                  <Col>
                    <Label>State</Label>
                    <Input
                      type="select"
                      name="state"
                      onChange={this.onChange}
                      value={this.state.state}
                    >
                      {this.state.stateArray.map((state, i) =>
                        this.mapStates(state, i)
                      )}
                    </Input>
                  </Col>
                  <Col>
                    <Label>Postal Code</Label>
                    <Input
                      type="number"
                      name="zipCode"
                      onChange={this.onChange}
                      value={this.state.zipCode}
                    />
                  </Col>
                </FormGroup>
                <Button
                  type="button"
                  color="secondary"
                  className="btn-sm float-right"
                  onClick={this.toggle}
                  outline
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  color="primary"
                  className="btn-sm float-right"
                  onClick={this.submitTransaction}
                  outline
                >
                  Submit
                </Button>
              </div>
            </Container>
          </Collapse>
          <Container
            fluid={true}
            className="d-flex justify-content-center h-100"
          >
            <div className="animated slideInUpTiny animation-duration-3 col-md-12 justify-content-center  my-auto">
              <div className="row justify-content-center">
                <div className="jr-card" style={transactionsStyle}>
                  <div>
                    <div className="row">
                      <Col>
                        <h1 className="text-left">Sales</h1>
                      </Col>

                      <Col className="col-md-1">
                        <UncontrolledDropdown className="float-right">
                          <DropdownToggle tag="span">
                            <span className="icon-btn text-grey pointer">
                              <i className="zmdi zmdi-more-vert zmdi-hc-lg" />
                            </span>
                          </DropdownToggle>

                          <DropdownMenu>
                            <DropdownItem onClick={this.toggle}>
                              Enter New Sale
                            </DropdownItem>
                            <hr />
                            <DropdownItem onClick={this.createPdf}>
                              Download as PDF
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </Col>
                    </div>
                    <OrderTable
                      className="d-flex align-items-center"
                      currentUser={this.props.currentUser}
                      id="tablePdf"
                    />
                  </div>
                </div>
              </div>
              <TransactionRadar />
            </div>
          </Container>
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser.userId,
    name: state.currentUser.name,
    lastName: state.currentUser.lastName
  };
}

export default connect(
  mapStateToProps,
  null
)(Transactions);
