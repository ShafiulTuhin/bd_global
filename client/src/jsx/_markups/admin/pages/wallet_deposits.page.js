import {  Badge } from "react-bootstrap";
import PageTitle from "../layouts/PageTitle";
import Moment from "react-moment";

import { useEffect } from "react";
// CONSTANTS
import { SERVICE } from "../../../_constants";

import TableGenerator from "../components/tableGenerator.component";

import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";

import { CopyToClipboard } from "react-copy-to-clipboard";
import { notify } from "../../../_helpers/notify";

import numeral from "numeral";

function Deposits() {
  const { t } = useTranslation();
  const {
    services: { transaction },
    useService,
  } = useServiceContextHook();

  let service = useService({
    [SERVICE?.FIND]: transaction.find,
  });
  const { dispatchRequest } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        order: JSON.stringify([
          ["created_at", "DESC"],
          ["updated_at", "DESC"],
        ]),
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

  return (
    <>
      <PageTitle activeMenu="Deposits" motherMenu="Wallet management" />
      <header className="mb-4">
        <h3>{t("Deposits List")}</h3>
      </header>

      <div style={{ marginBottom: 60 }}>
        <DepositsHistoryTable {...{ service }} />
      </div>
    </>
  );
}
function DepositsHistoryTable({ service }) {
  return (
    <>
      <TableGenerator
        {...{ service }}
        mapping={{
          id: "USER ID",
          createdAt: "joined",
        }}
        omit="*"
        extras={["id", "email", "type", "currency", "amount", "destination", "txid", "status", "date", ]}
        transformers={{
          id: ({ row }) => row?.id,
          email: ({ row }) => row?.wallet?.user?.email,
          type: ({ row }) => (
            <div className="text-capitalize">
              {String(row?.type)?.toLowerCase()}
            </div>
          ),
          currency: ({ row }) => row?.wallet?.currency,
          amount: ({ row }) => String(row?.quantity),
          destination: ({ row }) => (
            <>
            <div className="d-inline-flex">
              <span className="truncate">{row?.wallet?.address.substring(0, 5)}...{row?.wallet?.address.substring(row?.wallet?.address.length - 5, row?.wallet?.address.length)}</span>
              <CopyToClipboard
                text={row?.wallet?.address}
                onCopy={() => notify("Copied")}
              >
                <span className="cursor-pointer fas fa-copy"></span>
              </CopyToClipboard>
            </div>
            </>
          ),
          txid: ({ row }) => 
          row?.metadata?.txId && (
            
            <>
            <div className="d-inline-flex">
              <span className="truncate">{row?.metadata?.txId.substring(0, 5)}...{row?.metadata?.txId.substring(row?.metadata?.txId.length - 5, row?.metadata?.txId.length)}</span>
              <CopyToClipboard
                text={row?.metadata?.txId}
                onCopy={() => notify("Copied")}
              >
                <span className="cursor-pointer fas fa-copy"></span>
              </CopyToClipboard>
            </div>
            </>
          ) || '-',
          
          status: ({ row }) => (
            <Badge
              pill
              variant={((status) => {
                switch (status) {
                  case "active":
                  case "completed": {
                    return "success";
                  }
                  case "declined": {
                    return "danger";
                  }
                  default: {
                    return "info";
                  }
                }
              })(String(row?.status)?.toLowerCase())}
              className="text-white"
            >
              {String(row?.status)?.toLowerCase()}
            </Badge>
          ),
          date: ({ row }) => {
            return <Moment format="MMM Do, Y, hh:mm A" date={row?.created_at} />;
          },
        }}
      />
    </>
  );
}

export default Deposits;
 