import { Button, Col, Row, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import TableGenerator from "../components/tableGenerator.component";
import { Switch } from "@mui/material";
import Moment from "react-moment";
import { useTranslation } from "react-i18next";
import { Badge } from "react-bootstrap";
import { notify } from "../../../_helpers/notify";
// COMPONENTS
import PageTitle from "../layouts/PageTitle";

// CONSTANTS
import { SERVICE } from "../../../_constants";

// HOOKS
import useServiceContextHook from "../../../_hooks/service.context.hook";
import useToggler from "../../../_hooks/toggler.hook";

import CurrencyForm from "../forms/currency.form";
import { ModalForm } from "../components/modalForm.component.jsx";

import { Formik } from "formik";
import { Link } from "react-router-dom";
import { routeMap } from "../../guest/routes";

function ToggleStatus({ row }) {
  const { t } = useTranslation();
  const {
    services: { kyc: kycService },
  } = useServiceContextHook();
  const [status, setStatus] = useState(row?.status);

  const KYCStatus = () =>
    String(status)?.toLowerCase() === "accepted" ? true : false;

  /**
   *
   * @param {Object} event
   * @param {Object} event.target
   */
  async function handleChange({ target }) {
    try {
      const newStatus = target?.checked ? "ACCEPTED" : "PENDING";

      let { data, error, message } = await kycService?.updateByUserAndType(
        row?.user_id,
        row?.type,
        {
          status: newStatus,
        }
      );
      if (!data)
        throw new Error(error?.message || message || `Error updating KYC Type`);

      notify("Changes saved");
      setStatus(newStatus);
    } catch (err) {
      console.log(err);
      notify(err.message, "error");
    }
  }

  return (
    <>
      <small className="d-flex" style={{ gap: 10, alignItems: "center" }}>
        <Switch
          color={"default"}
          name={row?.id}
          onChange={handleChange}
          inputProps={{ "aria-label": "controlled" }}
          checked={KYCStatus()}
          size="small"
        />
        {KYCStatus() ? (
          <small className="badge badge-success text-white">
            <i className="fa fa-check-circle text-white mr-2" />
            {t("completed")}
          </small>
        ) : (
          <small className="badge badge-warning text-white">
            <i className="fa fa-circle text-white mr-2" />
            {t("pending")}
          </small>
        )}
      </small>
      {/* {row?.kyc && row?.kyc[key]?.status === "ACCEPTED" ? "Done" : "Pending"} */}
    </>
  );
}

function UserKYCMgmt() {
  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
    toggledPayload: modalPayload,
  } = useToggler();

  const {
    services: { kyc },
    useService,
  } = useServiceContextHook();
  const { t } = useTranslation();

  let service = useService({
    [SERVICE?.FINDBYID]: kyc.findByID,
    [SERVICE?.UPDATEBYID]: kyc.updateByID,
    [SERVICE?.REMOVEBYID]: kyc.removeByID,
    [SERVICE?.FIND]: kyc.find,
  });

  const { dispatchRequest, retryDispatch, serviceMap } = service;
  // const { dispatchRequest, retryDispatch, serviceMap } = service;
  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        sudo: true,
        // fake: true,
        order: JSON.stringify([
          ["createdAt", "DESC"],
          ["updatedAt", "DESC"],
        ]),
      },
      toast: { success: notify, error: (err) => notify(err, "error") },
    });
  }, []);

  <ModalForm
    useFormRenderer={useFormRenderer}
    formData={modalPayload}
    isOpen={isModalOpen}
    onClose={onModalClose}
  ></ModalForm>;

  function useFormRenderer(formData = {}) {
    if (formData) {
      const { type = null, payload = null } = formData;

      const [title, form] = (() => {
        const action = serviceMap[type];
        try {
          switch (type) {
            case "view::uploads":
              return [
                t("KYC Details"),
                <KycDetails
                  action={action}
                  {...{ payload }}
                  callback={(data) => {
                    retryDispatch(SERVICE.FIND);
                    onModalClose();
                  }}
                />,
              ];

            case SERVICE?.UPDATEBYID:
              return [
                "Update Currency",
                <CurrencyForm.Edit
                  action={action}
                  {...{ payload }}
                  callback={(data) => {
                    retryDispatch(SERVICE.FIND);
                    onModalClose();
                  }}
                />,
              ];

            case SERVICE?.REMOVEBYID:
              return [
                "Confirm Delete",
                <CurrencyForm.Remove
                  action={action}
                  {...{ payload }}
                  callback={onModalClose}
                />,
              ];
            default:
              return [null, null];
          }
        } catch (error) {
          console.error(
            "Must pass in method and payload key to the formData argument"
          );
        }
      })();
      return [
        title,
        <Row>
          <Col>{form}</Col>
        </Row>,
      ];
    }
    return [null, null];
  }

  return (
    <>
      <ModalForm
        useFormRenderer={useFormRenderer}
        formData={modalPayload}
        isOpen={isModalOpen}
        onClose={onModalClose}
        modalProps={{ size: "lg" }}
      ></ModalForm>

      <PageTitle activeMenu="KYC" motherMenu="User management" />
      <header
        className="mb-4 d-flex justify-content-between"
        style={{ flexWrap: "wrap" }}
      >
        <h3>{t("KYC List")}</h3>
        <button className="btn" onClick={() => retryDispatch(SERVICE.FIND)}>
          {/* <i className="fa fa-arrow mr-2" /> */}
          {t("Refresh")}
        </button>
      </header>

      <>
        <TableGenerator
          {...{ service }}
          mapping={{
            id: "USER ID",
            createdAt: "joined",
          }}
          omit="*"
          extras={[
            "email",
            "security_password",
            "email_verification",
            "sms_verification",
            "google_auth",
            "id_verification",
            "security_level",
            "media",
          ]}
          transformers={{
            email: ({ row }) => row?.user?.email,
            security_level: ({ row }) => {
              let totalSecurityPoint = row?.kyc?.reduce((prev, curr) => {
                if (String(curr?.status)?.toLowerCase() === "accepted") {
                  return prev + curr?.security_level;
                }
                return prev;
              }, 0);

              return totalSecurityPoint > 1 ? (
                <small className="badge badge-success text-white">
                  {totalSecurityPoint}
                </small>
              ) : (
                <small className="badge badge-danger text-white">
                  {totalSecurityPoint}
                </small>
              );
            },
            security_password: ({ row }) =>
              row?.user.active ? (
                <small className="badge badge-success text-white">
                  <i className="fa fa-check-circle text-white mr-2" />
                  {t("completed")}
                </small>
              ) : (
                <small className="badge badge-warning text-white">
                  <i className="fa fa-circle text-white mr-2" />
                  {t("pending")}
                </small>
              ),
            email_verification: ({ row }) => {
              let filtered = row?.kyc?.filter((kyc) => kyc.type === "EMAIL");

              return filtered?.length ? (
                <ToggleStatus row={filtered[0]} />
              ) : (
                "--"
              );
            },
            sms_verification: ({ row }) => {
              let filtered = row?.kyc?.filter((kyc) => kyc.type === "SMS");

              return filtered?.length ? (
                <ToggleStatus row={filtered[0]} />
              ) : (
                "--"
              );
            },
            google_auth: ({ row }) => {
              let filtered = row?.kyc?.filter(
                (kyc) => kyc.type === "GOOGLE_AUTH"
              );

              return filtered?.length ? (
                <ToggleStatus row={filtered[0]} />
              ) : (
                "--"
              );
            },
            id_verification: ({ row }) => {
              let filtered = row?.kyc?.filter((kyc) => kyc.type === "ID");

              return filtered?.length ? (
                <ToggleStatus row={filtered[0]} />
              ) : (
                "--"
              );
            },
            date: ({ row }) => {
              return <Moment format="YYYY/MM/DD" date={row?.createdAt} />;
            },
            media: ({ row }) => {
              let filtered = row?.kyc?.filter((kyc) => kyc.type === "ID");

              return filtered?.length ? (
                filtered[0]?.uploads?.length ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      onOpenModal({ type: "view::uploads", payload: row })
                    }
                  >
                    <i className="fa fa-eye"></i>
                  </Button>
                ) : (
                  "--"
                )
              ) : (
                "--"
              );
            },
          }}
        />
      </>
    </>
  );
}

function KycDetails(props) {
  const { /* action, callback, */ payload = {} } = props;
  // const { t } = useTranslation();
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    if (Array.isArray(payload.kyc)) {
      let IDKyc = payload?.kyc?.filter((kyc) => kyc?.type === "ID");
      if (IDKyc?.length) setUploads(IDKyc[0]?.uploads || []);
    }
  }, [payload.kyc]);

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="row">
            <div className="col-3">
              <h6 className="mb-0">Full Name :</h6>
            </div>
            <div className="col-9 ">
              {payload?.user?.profile?.lname} {payload?.user?.profile?.name}
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-3">
              <h6 className="mb-0">Birth Date :</h6>
            </div>
            <div className="col-9">{payload?.user?.profile?.date_of_birth}</div>
          </div>
          <hr />
          <div className="row">
            <div className="col-3">
              <h6 className="mb-0">Address :</h6>
            </div>
            <div className="col-9">
              {payload?.user?.address?.address_line},{" "}
              {payload?.user?.address?.zipcode},{" "}
              {payload?.user?.address?.country}
            </div>
          </div>
          <hr />

          <div>
            <h6 className="mb-0">Image uploads :</h6>

            <div style={{ gap: 10, display: "flex", flexWrap: "wrap" }}>
              {uploads.map((upload, idx) => (
                <figure
                  key={idx}
                  style={{
                    margin: 4,
                    border: "1px solid #acacac",
                    padding: 10,
                  }}
                >
                  <img
                    style={{
                      maxHeight: "300px",
                      objectFit: "contain",
                    }}
                    src={upload?.original?.url}
                    alt="preview image"
                  />
                  <figcaption>
                    <a
                      target="_blank"
                      href={`${routeMap.upload}?path=${upload?.original?.url}`}
                    >
                      Preview 
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserKYCMgmt;
