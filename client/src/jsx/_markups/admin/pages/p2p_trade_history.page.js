import { Card, Row, Col, Button, Table, Toast, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import { toast } from "react-toastify";
import TableGenerator from "../components/tableGenerator.component";
import { useEffect } from "react";
import Moment from "react-moment";
import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";
function P2PTrades() {
  const {
    services: { order },
    useService,
  } = useServiceContextHook();

  const { t } = useTranslation();

  let service = useService({
    [SERVICE?.RETRIEVE]: order.findByID,
    [SERVICE?.UPDATE]: order.updateByID,
    [SERVICE?.DROP]: order.removveByID,
    [SERVICE?.BULK_RETRIEVE]: order.find,
  });

  const { dispatchRequest } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.BULK_RETRIEVE,
      payload: {
        // fake: true,
        sudo: true,
      },
      toast: { success: notifySuccess, error: notifyError },
    });
  }, []);

  return (
    <>
      <PageTitle activeMenu="Trade history" motherMenu="P2P Trade management" />
      <header className="mb-4">
        <h3>{t("Trade History")}</h3>
      </header>
      <Row style={{ marginBottom: 20, width: "100%" }}>
        <Col>
          <div className="input-group search-area right d-lg-inline-flex d-none">
            <input
              type="text"
              className="form-control"
              placeholder={t("Filter in record")}
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
        <TableGenerator
          {...{ service }}
          omit="*"
          extras={[
            "creation_date",
            "id",
            "email",
            "trade_type",
            "currency_pair",
          ]}
          transformers={{
            id: ({ row }) => row?.id,
            email: ({ row }) => row?.advert?.user?.email,
            trade_type: ({ row }) =>  row?.advert.type === "buy" ? (
                <Badge variant="success" className="text-white px-4">
                  {row?.advert.type}
                </Badge>
              ) : (
                <Badge variant="danger" className="px-4">
                  {row?.advert.type}
                </Badge>
              ),
            creation_date: ({ row }) => (
              <Moment format="MMM Do, Y" date={row?.advert?.createdAt} />
            ),
            currency_pair: ({ row }) =>
              `${row?.advert?.crypto}/${row?.advert?.fiat || ""}`,
          }}
        />
      </div>
    </>
  );
}

export default P2PTrades;

function notifySuccess() {
  toast.success("Success !", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}

function notifyError(error) {
  toast.error(error || "Request Error!", {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
