import { Row, Col, Badge } from "react-bootstrap";
import PageTitle from "../layouts/PageTitle";
import Moment from "react-moment";
import { useEffect, useState } from "react";
// CONSTANTS
import { SERVICE } from "../../../_constants";

import useToggler from "../../../_hooks/toggler.hook";
import TableGenerator from "../components/tableGenerator.component";
import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";

import { ModalForm } from "../components/modalForm.component";
import { notify } from "../../../_helpers/notify";

import { CopyToClipboard } from "react-copy-to-clipboard";

function Withdrawals() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle activeMenu="History" motherMenu="Transaction management / Main Wallet" />
      <header className="mb-4">
        <h3>{t("Withdrawals details")}</h3>
      </header>
      {/* <Row style={{ marginBottom: 20, width: "100%" }}>
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
      </Row> */}

      <div style={{ marginBottom: 60 }}>
        <WithdrawalHistoryTable />
      </div>
    </>
  );
}

/**
 *
 * @param {Object} props
 * @returns
 */
function WithdrawalHistoryTable() {
  const {
    services: { mainwallettransaction },
    useService,
  } = useServiceContextHook();
  const { t } = useTranslation();

  let trxService = useService({
    [SERVICE?.FIND]: mainwallettransaction.find,
  });

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
    toggledPayload: modalPayload,
  } = useToggler();

  let { dispatchRequest, retryDispatch } = trxService;

  function useFormRenderer(formData = { type: null, payload: null }) {
    const [title, form] = (() => {
      try {
        switch (formData?.type) {
          case SERVICE?.UPDATE:
            return [
              t("Approve"),
              
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

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {      
        order: JSON.stringify([
          ["created_at", "DESC"],
          ["updated_at", "DESC"],
        ]),
        // fake: true,
        sudo: true,
      },
    });
  }, []);

  return (
    <>
      <ModalForm
        useFormRenderer={useFormRenderer}
        formData={modalPayload}
        isOpen={isModalOpen}
        onClose={onModalClose}
      ></ModalForm>
      <div style={{ marginBottom: 60 }}>
        <TableGenerator
          {...{ service: trxService }}
          omit="*"
          extras={[
            "id",
            "crypto",
            "quantity",
            "address",
            "txid",           
            "type",
            "status",
            "created_at"                       
          ]}
          transformers={{
            id: ({ row }) => row?.id && (
              <>
              <div className="d-inline-flex">
                <span className="truncate">{row?.id}</span>
                <CopyToClipboard
                  text={row?.id}
                  onCopy={() => notify("Copied")}
                >
                  <span className="cursor-pointer fas fa-copy"></span>
                </CopyToClipboard>
              </div>
              </>
            ) || '-',                    
            quantity: ({ row }) => String(row?.quantity),
            crypto: ({ row }) => String(row?.crypto), 
            address: ({ row }) => row?.address && (
              <>
              <div className="d-inline-flex">
                <span className="truncate">{row?.address.substring(0, 7)}...{row?.address.substring(row?.address.length - 7, row?.address.length)}</span>
                <CopyToClipboard
                  text={row?.address}
                  onCopy={() => notify("Copied")}
                >
                  <span className="cursor-pointer fas fa-copy"></span>
                </CopyToClipboard>
              </div>
              </>
            ),
            txid: ({ row }) => row?.metadata && (              
              <>             
              <div className="d-inline-flex">
                <span className="truncate">{row?.metadata.txId.substring(0, 7)}...{row?.metadata.txId.substring(row?.metadata.txId.length - 7, row?.metadata.txId.length)}</span>
                <CopyToClipboard
                  text={row?.metadata.txId}
                  onCopy={() => notify("Copied")}
                >
                  <span className="cursor-pointer fas fa-copy"></span>
                </CopyToClipboard>
              </div>
              </>
            ),
            type: ({ row }) => String(row?.type),
            status: ({ row }) => {
              switch (String(row?.status)?.toLowerCase()) {
                case "active": {
                  return (
                    <Badge variant="success" pill className="text-white">
                      approved
                    </Badge>
                  );
                }
                case "declined":
                  return (
                    <Badge variant="danger" pill className="text-white">
                      declined
                    </Badge>
                  );
                default:
                  return (
                    <Badge variant="info" pill className="text-white">
                      pending
                    </Badge>
                  );
              }
            },
            created_at: ({ row }) => (
              <Moment format="MMM Do, Y, hh:mm A" date={row?.created_at} />
            ),
          }}
        />
      </div>
    </>
  );
}

export default Withdrawals;
