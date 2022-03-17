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
      <PageTitle activeMenu="Withdrawals" motherMenu="Wallet management" />
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
    services: { transaction },
    useService,
  } = useServiceContextHook();
  const { t } = useTranslation();

  let trxService = useService({
    [SERVICE?.FIND]: transaction.find,
    [SERVICE?.UPDATE]: transaction.approveByID,
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
              <ApproveWithdrawalModel
                // {...{ services }}
                payload={formData?.payload}
                callback={() => {
                  retryDispatch(SERVICE?.FIND);
                  onModalClose();
                }}
                close={onModalClose}
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

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        where: {
          type: "WITHDRAW",
        }, 
        order: JSON.stringify([
          ["created_at", "DESC"],
          ["updated_at", "DESC"],
        ]),
        // fake: true,
        sudo: true,
      },
    });
  }, []);

  function WithdrawalAction({ row }) {
    const [data, setData] = useState(row);

    return row.status === "PENDING" ? (
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
          onClick={() => {
            onOpenModal({
              type: SERVICE?.UPDATE,
              payload: { data, setData },
            });
          }}
        >
          <span className="themify-glyph-29"></span> {t("Action")}
        </button>
      </div>
    ) : null;
  }

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
            "email",
            "currency",
            "amount",
            "destination",
            "txid",
            "status",
            "date",
            "action",
          ]}
          transformers={{
            email: ({ row }) => row?.wallet?.user?.email,
            currency: ({ row }) => row?.wallet?.currency,
            amount: ({ row }) => String(row?.quantity), 
            destination: ({ row }) => row?.address && (
              <>
              <div className="d-inline-flex">
                <span className="truncate">{row?.address.substring(0, 5)}...{row?.address.substring(row?.address.length - 5, row?.address.length)}</span>
                <CopyToClipboard
                  text={row?.address}
                  onCopy={() => notify("Copied")}
                >
                  <span className="cursor-pointer fas fa-copy"></span>
                </CopyToClipboard>
              </div>
              </>
            ),
            txid: ({ row }) => row?.trx_id && (
              <>
              <div className="d-inline-flex">
                <span className="truncate">{row?.trx_id.substring(0, 5)}...{row?.trx_id.substring(row?.trx_id.length - 5, row?.trx_id.length)}</span>
                <CopyToClipboard
                  text={row?.trx_id}
                  onCopy={() => notify("Copied")}
                >
                  <span className="cursor-pointer fas fa-copy"></span>
                </CopyToClipboard>
              </div>
              </>
            ) || '-',
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
            date: ({ row }) => (
              <Moment format="MMM Do, Y, hh:mm A" date={row?.created_at} />
            ),
            action: WithdrawalAction,
          }}
        />
      </div>
    </>
  );
}

export default Withdrawals;

/**
 *
 * @param {Object} props
 * @param {Object} props.payload
 * @param {Object} props.payload.row
 * @param {Object} props.payload.row.id
 * @param {Object} props.payload.callback
 * @param {Object} props.payload.close
 * @returns
 */
function ApproveWithdrawalModel(props) {
  const {
    services: { transaction },
  } = useServiceContextHook();
  const { callback, payload = {}, close } = props;
  const { t } = useTranslation();
  const [isWorking, setIsWorking] = useState(false);
  async function onDisapprove() {
    try {
      setIsWorking(true);
      let {
        data,
        error,
        message = "Encountered error while attempting to disapprove withdrawal",
      } = await transaction.disapproveByID(payload?.data?.id);
      if (!data) throw new Error(error?.message || message);
      notify("Transaction has been disapproved");
      typeof payload?.setData === "function" &&
        payload.setData((state) => ({ ...state, status: "DECLINED" }));
      callback && callback();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsWorking(false);
    }
  }

  /**
   * @function onApprove
   * @description Approve transaction
   */
  async function onApprove() {
    try {
      setIsWorking(true);
      let {
        data,
        error,
        message = "Encountered error while attempting to approve withdrawal",
      } = await transaction.approveByID(payload?.data?.id);
      if (!data) throw new Error(error?.message || message);
      callback && callback();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsWorking(false);
    }
  }

  return !payload?.data ? (
    <>No Data</>
  ) : (
    <>
      <div className="">
        <h4 className="modal-title w-100">{t("What do you wish to do?")}</h4>
        <div>
          <p>
            Do you wish to approve the transaction with id{" "}
            <code>{payload?.data?.id}</code>
          </p>
        </div>
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-default btn-sm"
            data-dismiss="modal"
            onClick={close}
            disabled={isWorking}
          >
            No, close
          </button>
          <div style={{ display: "inline-flex", gap: 5 }}>
            <button
              type="button"
              disabled={isWorking}
              className="btn btn-success text-white btn-sm"
              onClick={() => {
                onApprove();
              }}
            >
              Yes, approve
            </button>
            <button
              type="button"
              disabled={isWorking}
              className="btn btn-danger text-white btn-sm"
              onClick={() => {
                onDisapprove();
              }}
            >
              no, disapprove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
