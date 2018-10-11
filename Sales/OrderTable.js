import React, { Component } from "react";
import { Col, Button } from "reactstrap";
import OrderTableCell from "./OrderTableCell";
import { transaction_GetAllByUser } from "../../services/transaction.service";

let counter = 0;

class OrderTable extends Component {
  state = {
    currentUser: this.props.currentUser,
    saleId: null,
    data: [],
    currentPage: 0,
    totalCount: 0
  };

  componentDidMount() {
    if (this.props.currentUser) {
      transaction_GetAllByUser(this.state.currentPage).then(response => {
        this.setState({ data: response.data.pagedItems });
        this.setState({ totalCount: response.data.totalCount });
      });
    }
  }

  onClick = id => {
    this.setState({ saleId: id });
  };

  nextPage = () => {
    if ((this.state.currentPage + 1) * 10 < this.state.totalCount) {
      let nextPage = ++this.state.currentPage;
      this.setState({ currentPage: nextPage });
      transaction_GetAllByUser(nextPage).then(response => {
        this.setState({ data: response.data.pagedItems });
      });
    }
  };

  prevPage = () => {
    if (this.state.currentPage > 0) {
      let prevPage = --this.state.currentPage;
      this.setState({ currentPage: prevPage });
      transaction_GetAllByUser(prevPage).then(response => {
        this.setState({ data: response.data.pagedItems });
      });
    }
  };

  render() {
    const { data } = this.state;
    const cellStyle = {
      border: "1px black smooth"
    };

    let pageCount = 0;
    let rowCount = this.state.totalCount;

    if (this.state.totalCount % 10 != 0) {
      pageCount = Math.floor(rowCount / 10) + 1;
    } else {
      pageCount = Math.floor(rowCount / 10);
    }

    return (
      <div className="table-responsive-material">
        <table
          className="default-table table-unbordered table table-sm table-hover"
          style={{ fontSize: "large" }}
        >
          <thead className="th-border-b">
            <tr>
              <th style={{ fontSize: "large" }}>Lead Source</th>
              <th style={{ fontSize: "large" }}>Type</th>
              <th className="text-center" style={{ fontSize: "large" }}>
                Address
              </th>
              <th className="text-center" style={{ fontSize: "large" }}>
                Purchase Price
              </th>
              <th className="text-center" style={{ fontSize: "large" }}>
                Total Commission
              </th>
              <th className="text-center" style={{ fontSize: "large" }}>
                Agent Commission
              </th>
              <th className="text-center" style={{ fontSize: "large" }}>
                Sale Date
              </th>
              <th className="text-center" style={{ fontSize: "large" }}>
                Close Date
              </th>
              <th
                className="status-cell text-center"
                style={{ fontSize: "large" }}
              >
                Status
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map(data => {
              counter += 1;
              data.counterId = counter;
              return (
                <OrderTableCell
                  key={data.counterId}
                  data={data}
                  style={cellStyle}
                />
              );
            })}
          </tbody>
        </table>
        <br />
        <Col md={{ offset: "5" }}>
          <Button type="button" color="primary" onClick={this.prevPage} outline>
            Prev
          </Button>
          <span className="text-center">
            {this.state.currentPage + 1}/{pageCount}
          </span>
          &nbsp; &nbsp;
          <Button type="button" color="primary" onClick={this.nextPage} outline>
            Next
          </Button>
        </Col>
      </div>
    );
  }
}

export default OrderTable;
