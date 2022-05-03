import {  Badge, Row, Col, Button } from "react-bootstrap";
import PageTitle from "../layouts/PageTitle";
import Moment from "react-moment";
import useToggler from "../../../_hooks/toggler.hook";

import { useEffect } from "react";
// CONSTANTS
import { SERVICE } from "../../../_constants";

import TableGenerator from "../components/tableGenerator.component";
import { ModalForm } from "../components/modalForm.component.jsx";
import AirdropForm from "../forms/airdrop.form";

import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";
import numeral from "numeral";

function Airdrops({ services, useService }) {
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
      payload: {
        where: {
          type: {
            $or: ["DEPOSIT", "CREDIT"],
          },
        },
        // fake: true,
        sudo: true,
      },
    });
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
              t("Add airdrop"),
              <AirdropForm
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
              <AirdropForm.Update
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
              <AirdropForm.Remove
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
          <h2 className="font-w600 mb-2 mr-auto ">{t("Airdrop Management")}</h2>
        }
        activeMenu="Airdrop Management"
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
    </>
  );
}

export default Airdrops;
