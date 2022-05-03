import { Row, Col, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import useToggler from "../../../_hooks/toggler.hook";
import { useEffect } from "react";
import TableGenerator from "../components/tableGenerator.component";
import { toast } from "react-toastify";
import Moment from "react-moment";
import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";
function OrdersManagement() {
  const {
    services: { order },
    useService,
  } = useServiceContextHook();

  const { t } = useTranslation();

  let service = useService({
    [SERVICE?.RETRIEVE]: order.findByID,
    [SERVICE?.UPDATE]: order.updateByID,
    [SERVICE?.DROP]: order.removeByID,
    [SERVICE?.BULK_RETRIEVE]: order.find,
  });

  const { dispatchRequest } = service;

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
    toggledPayload: modalPayload,
  } = useToggler();

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
      <PageTitle activeMenu="" motherMenu="Advert management" />
      <header className="mb-4">
        <h3>{t("Orders")}</h3>
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
            "id",
            "username",
            "payment_channels",
            "time_limit (mins)",
            "type",
            "status",
            // "total",
            "date",
          ]}
          transformers={{
            id: ({ row }) => row?.id,
            username: ({ row }) => (row?.user ? row?.user?.profile?.pname : ""),
            type: ({ row }) =>
              row?.advert?.type === "buy" ? (
                <Badge variant="success" className="text-white px-4">
                  {row?.advert?.type}
                </Badge>
              ) : (
                <Badge variant="danger" className="px-4">
                  {row?.advert?.type}
                </Badge>
              ),
            payment_channels: ({ row }) =>
              row?.advert?.payment_methods &&
              row?.advert?.payment_methods?.join(", "),
            "time_limit (mins)": ({ row }) =>
              row?.advert.payment_ttl_mins || "",
            status: ({ row }) => {
              const status = String(row?.status)?.toLowerCase();
              switch (status) {
                case "completed": {
                  return (
                    <Badge variant="success" className="text-white">
                      {status}
                    </Badge>
                  );
                }
                case "disputed":
                case "cancelled": {
                  return <Badge variant="danger">{status}</Badge>;
                }
                default: {
                  return <Badge variant="default">{status}</Badge>;
                }
              }
            },
            date: ({ row }) => (
              <Moment format="MMM Do, Y" date={row?.archivedAt} />
            ),
          }}
        />
      </div>
    </>
  );
}

export default OrdersManagement;

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
