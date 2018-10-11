import React from "react";
import { withRouter } from "react-router";
import moment from "moment";
import numeral from "numeral";

class OrderTableCell extends React.Component {
  onClick = () => {
    this.props.history.push(`sales/${this.props.data.id}`);
  };

  checkStatus = (buyer, seller, lease) => {
    if (buyer === true) {
      return "Buyer";
    }
    if (seller === true) {
      return "Seller";
    }
    if (lease === true) {
      return "Lease";
    }
  };

  render() {
    const {
      counterId,
      id,
      purchasePrice,
      totalCommission,
      agentCommission,
      saleDate,
      closeDate,
      status,
      fullName,
      streetAddress,
      buyer,
      seller,
      lease
    } = this.props.data;
    const statusStyle = status.includes("Closed")
      ? "text-white bg-success"
      : status.includes("Pending")
        ? "text-white bg-primary"
        : status.includes("Active")
          ? "text-white bg-info"
          : status.includes("Hold")
            ? "text-white bg-orange"
            : status.includes("W-drawn")
              ? "text-white bg-amber"
              : status.includes("Expired")
                ? "text-white bg-danger"
                : "text-white bg-grey";

    return (
      <tr tabIndex={-1} key={counterId} onClick={this.onClick}>
        <td style={{ width: "11em" }}>{fullName}</td>
        <td>{this.checkStatus(buyer, seller, lease)}</td>
        <td className="text-center" style={{ width: "20%" }}>
          {streetAddress}
        </td>
        <td className="text-center" style={{ width: "10em" }}>
          {numeral(purchasePrice).format("$0,0.00")}
        </td>
        <td className="text-center" style={{ width: "10em" }}>
          {numeral(totalCommission).format("$0,0.00")}
        </td>
        <td className="text-center" style={{ width: "10em" }}>
          <b>{numeral(agentCommission).format("$0,0.00")}</b>
        </td>
        <td className="text-center" style={{ width: "8em" }}>
          {moment(saleDate.substring(0, 10)).format("MM-DD-YYYY")}
        </td>
        <td className="text-center" style={{ width: "8em" }}>
          {moment(closeDate.substring(0, 10)).format("MM-DD-YYYY")}
        </td>
        <td className="status-cell text-right" style={{ paddingTop: "15px" }}>
          <div className={`badge text-uppercase ${statusStyle}`}>{status}</div>
          <br />
          <br />
        </td>
      </tr>
    );
  }
}

export default withRouter(OrderTableCell);
