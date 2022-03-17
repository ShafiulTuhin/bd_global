import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
import Moment from "react-moment";
import { useEffect } from "react";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import useServiceContextHook from "../../_hooks/service.context.hook";

import useToggler from "../../../_hooks/toggler.hook";
import TableGenerator from "../components/tableGenerator.component";
import { useTranslation } from "react-i18next";

function Withdrawals() {
  const { services, useService } = useServiceContextHook();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle activeMenu="Withdrawals" motherMenu="Wallet management" />
      <header className="mb-4">
        <h3>{t("Withdrawals request history")}</h3>
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
        <Col sm="auto" style={{ padding: 0 }}></Col>
      </Row>

      <div style={{ marginBottom: 60 }}>
        <WithdrawalHistoryTable {...{ services, useService }} />
      </div>
    </>
  );
}
function WithdrawalHistoryTable() {
  const {
    useService,
    services: { wallet },
  } = useServiceContextHook();

  let service = useService({
    [SERVICE?.BULK_RETRIEVE]: wallet.find,
  });
  let { dispatchRequest } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.BULK_RETRIEVE,
      payload: {
        where: { type: "WITHDRAW" },
        fake: true,
        sudo: true,
      },
    });
  }, []);
  const action = (
    <div className="d-flex" style={{ gap: 20 }}>
      <a href="">
        <span className="themify-glyph-165"></span> Delete
      </a>
    </div>
  );
  return (
    <>
      <div style={{ marginBottom: 60 }}>
        <TableGenerator
          {...{ service }}
          omit="*"
          extras={[
            "email",
            "currency",
            "withdrawal_address",
            "fees",
            "status",
            "amount",
            "date" /* , "status", "action" */,
            "action",
          ]}
          transformers={{
            email: ({ row }) => row?.user?.email,
            currency: ({ row }) => row?.currency,
            fees: ({ row }) => row?.fees,
            amount: ({ row }) => row?.amount,
            status: ({ row }) => row?.status,
            date: ({ row }) => (
              <Moment format="YYYY/MM/DD" date={row?.createdAt} />
            ),
            action: ({ row }) => {
              return (
                <div className="d-flex" style={{ gap: 10 }}>
                  <button className="btn btn-xs btn-success text-white">
                    Approve
                  </button>
                  <button className="btn btn-danger btn-xs text-white">
                    Cancel
                  </button>
                </div>
              );
            },
          }}
        />
      </div>
    </>
  );
}

export default Withdrawals;
