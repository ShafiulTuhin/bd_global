import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
import { useEffect, useState } from "react";
import useToggler from "../../../_hooks/toggler.hook";
import { toast } from "react-toastify";
import { Switch } from "@mui/material";
// CONSTANTS
import { SERVICE } from "../../../_constants";

// COMPONENTS
import TableGenerator from "../components/tableGenerator.component";
import CurrencyForm from "../forms/currency.form";
import { ModalForm } from "../components/modalForm.component.jsx";

import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";
function CurrencyMgmt({ services, useService }) {
  const {
    services: { currency },
  } = useServiceContextHook();
  const { t } = useTranslation();

  let service = useService({
    [SERVICE?.CREATE]: currency.create,
    [SERVICE?.FINDBYID]: currency.findByID,
    [SERVICE?.UPDATEBYID]: currency.updateByID,
    [SERVICE?.REMOVEBYID]: currency.removeByID,
    [SERVICE?.RESTOREBYID]: currency.restoreByID,
    [SERVICE?.FIND]: currency.find,
  });
  const { dispatchRequest, retryDispatch, serviceMap } = service;

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
    toggledPayload: modalPayload,
  } = useToggler();

  useEffect(() => {
    dispatchRequest({
      type: SERVICE.FIND,
      payload: {
        order: JSON.stringify([
          ["createdAt", "DESC"],
          ["updatedAt", "DESC"],
        ]),
        sudo: true,
        // fake: true,
        paranoid: false,
      },
      toast: { success: notifySuccess, error: notifyError },
    });
  }, []);

  function useFormRenderer(formData = {}) {
    if (formData) {
      const { type = null, payload = null } = formData;

      const [title, form] = (() => {
        const action = serviceMap[type];
        try {
          switch (type) {
            case SERVICE?.CREATE:
              return [
                t("Create new Currency"),
                <CurrencyForm
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

            /* case SERVICE?.REMOVEBYID:
              return [
                "Confirm Delete",
                <CurrencyForm.Remove
                  action={action}
                  {...{ payload }}
                  callback={onModalClose}
                />,
              ]; */
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
      <PageTitle activeMenu="Currencies" motherMenu="Currency management" />
      <header className="mb-4">
        <h3>{t("Currency List")}</h3>
      </header>
      <div
        style={{
          marginBottom: 20,
          width: "100%",
          display: "flex",
          justifyContent: "flex-between",
        }}
      >
        {/*  <div className="input-group search-area mr-auto right d-lg-inline-flex d-none">
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
        </div> */}

        <div
          className="ml-auto"
          style={{ padding: 0, display: "flex", gap: 10 }}
        >
          <button className="btn" onClick={() => retryDispatch(SERVICE.FIND)}>
            {t("Refresh")}
          </button>
          <Button onClick={() => onOpenModal({ type: SERVICE?.CREATE })}>
            <i className="fa fa-plus"></i> {t("Add Currency")}
          </Button>
        </div>
      </div>

      <ModalForm
        useFormRenderer={useFormRenderer}
        formData={modalPayload}
        isOpen={isModalOpen}
        onClose={onModalClose}
      ></ModalForm>

      <div style={{ marginBottom: 60 }}>
        <TableGenerator
          {...{ service }}
          mapping={{
            id: "Currency ID",
            iso_code: "symbol",
          }}
          omit="*"
          extras={["symbol", "full_name", "type", "action"]}
          transformers={{
            symbol: ({ row }) => row?.iso_code || "unknown",
            full_name: ({ row }) => row?.name || "unknown",
            type: ({ row }) => row?.type || "unknown",
            action: function Action({ row }) {
              const [isInactive, setIsInactive] = useState(!!row?.archived_at);

              async function onChangeActive(inactive) {
                let status = null,
                  response;
                if (inactive) {
                  response = await currency.restoreByID(row?.id);
                } else {
                  response = await currency.removeByID(row?.id);
                }
                status = response?.data && response?.data?.status;
                if (status) {
                  notifySuccess("Done");
                  setIsInactive(!inactive);
                } else notifyError("Operation is incomplete");
              }
              return (
                <div className="d-flex" style={{ gap: 20 }}>
                  {isInactive ? (
                    <span className="badge light badge-danger">
                      <i className="fa fa-circle text-danger mr-1" />
                      Inactive
                    </span>
                  ) : (
                    <span className="badge light badge-success">
                      <i className="fa fa-circle text-success mr-1" />
                      Active
                    </span>
                  )}
                  <button
                    disabled={isInactive}
                    style={{
                      appearance: "none",
                      border: "none",
                      background: "none",
                    }}
                    onClick={() =>
                      onOpenModal({ type: SERVICE?.UPDATEBYID, payload: row })
                    }
                  >
                    <span className="themify-glyph-29"></span> Edit
                  </button>
                  <div className="" title="activate/deactivate">
                    <Switch
                      onChange={() => onChangeActive(isInactive)}
                      name="force"
                      id="activate-currency"
                      size="small"
                      checked={!isInactive}
                    />
                  </div>
                </div>
              );
            },
          }}
        />
      </div>
    </>
  );
}

export default CurrencyMgmt;

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
