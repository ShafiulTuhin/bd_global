import { Row, Col, Button } from "react-bootstrap";
import useToggler from "../../../_hooks/toggler.hook";
import PageTitle from "../layouts/PageTitle";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// CONSTANTS
import { SERVICE } from "../../../_constants";
// COMPONENTS
import TableGenerator from "../components/tableGenerator.component";
import { ModalForm } from "../components/modalForm.component.jsx";
import BankDetailForm from "../forms/bankdetail.form";

import { useTranslation } from "react-i18next";
function AdminBankDetails({ services, useService }) {
  const { t } = useTranslation();

  const { bank_detail } = services;

  let service = useService({
    [SERVICE?.CREATE]: bank_detail.create,
    [SERVICE?.FINDBYID]: bank_detail.findByID,
    [SERVICE?.UPDATEBYID]: bank_detail.updateByID,
    [SERVICE?.REMOVEBYID]: bank_detail.removeByID,
    [SERVICE?.FIND]: bank_detail.find,
    [SERVICE?.REMOVE]: bank_detail.remove,
  });

  const { dispatchRequest, retryDispatch, serviceMap } = service;
  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      toast: { success: notifySuccess, error: notifyError },
      payload: {
        order: JSON.stringify([
          ["created_at", "DESC"],
          ["updated_at", "DESC"],
        ]),
        sudo: true,
        // fake: true,
      },
    });
    return bank_detail.abort;
  }, []);

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
    toggledPayload: modalPayload,
  } = useToggler();

  function useFormRenderer(formData = { type: null, payload: null }) {
    const [title, form] = (() => {
      const action = serviceMap[formData?.type];
      try {
        switch (formData?.type) {
          case SERVICE?.CREATE:
            return [
              t("Add new bank detail"),
              <BankDetailForm
                {...{ services }}
                action={action}
                payload={formData?.payload}
                callback={() => {
                  retryDispatch(SERVICE?.FIND);
                  onModalClose();
                }}
              />,
            ];
          case SERVICE?.UPDATEBYID:
            return [
              t("Update bank detail"),
              <BankDetailForm.Update
                {...{ services }}
                action={action}
                payload={formData?.payload}
                callback={() => {
                  retryDispatch(SERVICE?.FIND);
                  onModalClose();
                }}
                u
              />,
            ];
          case SERVICE?.REMOVEBYID:
            return [
              t("Delete Bank details"),
              <BankDetailForm.Remove
                {...{ services }}
                action={action}
                payload={formData?.payload}
                callback={() => {
                  retryDispatch(SERVICE?.FIND);
                  onModalClose();
                }}
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

  return (
    <>
      <PageTitle
        pageContent={
          <h2 className="font-w600 mb-2 mr-auto ">{t("Admin Bank Details")}</h2>
        }
        activeMenu="Admin bank details"
        motherMenu="Dashboard"
      >
        <div
          style={{ marginBottom: 20, display: "flex", gap: 10, width: "100%" }}
        >
          <div></div>
          <div
            sm="auto"
            style={{ padding: 0, marginLeft: "auto", display: "flex", gap: 10 }}
          >
            <button className="btn" onClick={() => retryDispatch(SERVICE.FIND)}>
              {t("Refresh")}
            </button>
            <Button onClick={() => onOpenModal({ type: SERVICE?.CREATE })}>
              <i className="fa fa-plus"></i> {t("Add New")}
            </Button>
          </div>
        </div>
      </PageTitle>

      <ModalForm
        useFormRenderer={useFormRenderer}
        formData={modalPayload}
        isOpen={isModalOpen}
        onClose={onModalClose}
      ></ModalForm>

      <Row>
        <Col>
          <TableGenerator
            {...{ service }}
            mapping={{
              iso_code: "Symbol",
            }}
            omit="*"
            extras={[
              // "account_no",
              "bank_name",
              // "currency",
              "swift_code",
              "action",
            ]}
            transformers={{
              // account_no: ({ row }) => {
              //   return <>{row?.account_no}</>;
              // },
              bank_name: ({ row }) => {
                return <>{row?.bank_name}</>;
              },
              // currency: ({ row }) => {
              //   return <>{row?.currency}</>;
              // },
              swift_code: ({ row }) => {
                return <>{row?.swift_code}</>;
              },
              action: ({ row }) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <button
                      style={{
                        appearance: "none",
                        border: "none",
                        background: "none",
                      }}
                      onClick={() =>
                        onOpenModal({ type: SERVICE?.UPDATEBYID, payload: row })
                      }
                    >
                      <span className="themify-glyph-29"></span> {t("Edit")}
                    </button>
                    <button
                      style={{
                        appearance: "none",
                        border: "none",
                        background: "none",
                      }}
                      onClick={() =>
                        onOpenModal({
                          type: SERVICE?.REMOVEBYID,
                          payload: row,
                        })
                      }
                    >
                      <span className="themify-glyph-165"></span> {t("Delete")}
                    </button>
                  </div>
                );
              },
            }}
          />
        </Col>
      </Row>
    </>
  );
}

export default AdminBankDetails;

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
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
