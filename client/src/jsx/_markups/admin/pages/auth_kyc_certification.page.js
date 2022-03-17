import { Card, Row, Col, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
// CONSTANTS
import { useTranslation } from "react-i18next";

function AuthKYCCertification() {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle
        activeMenu="KYC Certifications"
        motherMenu="Authentication Management"
      />
      <header className="mb-4">
        <h3>{t("KYC Certifications")}</h3>
      </header>
      <Row style={{ marginBottom: 20, width: "100%" }}>
        <Col>
          <div className="input-group search-area right d-lg-inline-flex d-none">
            <input
              type="text"
              className="form-control"
              placeholder="Filter in record"
            />
            <div className="input-group-append">
              <span className="input-group-text">
                <Link to={"#"}>
                  <i className="themify-glyph-162"></i>
                </Link>
              </span>
            </div>
          </div>
        </Col>
      </Row>

      <Row style={{ marginBottom: 60 }}>
        <Col>
          <Card></Card>
        </Col>
      </Row>
    </>
  );
}
function KYCCertificationListTable() {
  const status = (data) => {
    // onDelivery, create invoice, sign agreement, under review
    return <>status</>;
  };
  return (
    <>
      <Table responsive hover size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th className="sortable">Customer</th>
            <th className="">Country</th>
            <th className="sortable">Date</th>
            <th className="sortable">Approved/Invoiced</th>
            <th className="">Status</th>
          </tr>
        </thead>
        <tbody id="security_list">
          <tr className="btn-reveal-trigger">
            <td className="py-2">K4547</td>
            <td className="py-2">Ralph Edwards</td>
            <td className="py-3 ">KOREA</td>
            <td className="py-3 ">22 Mar,2020 02:34 pm</td>
            <td>$2300.00 $3455.00</td>
            <td>{status(false)}</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

export default AuthKYCCertification;
