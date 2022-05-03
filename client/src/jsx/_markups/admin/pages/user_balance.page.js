import { Row, Col } from "react-bootstrap";
import { useEffect } from "react";
import Moment from "react-moment";
import { toast } from "react-toastify";
import { notify } from "../../../_helpers/notify";
import { financial } from "../../../_helpers/utils.helper";
import PageTitle from "../layouts/PageTitle";

// COMPONENTS
import TableGenerator from "../components/tableGenerator.component";
import useServiceContextHook from "../../../_hooks/service.context.hook";
import IdenticonAvatar from "../components/identiconAvatar.component";

// CONSTANTS
import { SERVICE } from "../../../_constants";
import { useTranslation } from "react-i18next";

function UserBalance() {
  const {
    services: { wallet },
    useService,
  } = useServiceContextHook();
  const { t } = useTranslation();
  let service = useService({
    [SERVICE?.FIND]: wallet.find,
  });

  const { dispatchRequest } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        order: JSON.stringify([
          ["createdAt", "DESC"],
          ["updatedAt", "DESC"],
        ]),
        // fake: true,
        sudo: true,
        paranoid: false,
      },
      toast: { success: notifySuccess, error: (mesg) => notify(mesg, "error") },
    });

    // return wallet?.abort;
  }, []);

  return (
    <>
      <PageTitle activeMenu="User Management" motherMenu="Balances" />
      <header className="mb-4">
        <h3>{t("Wallet balances")}</h3>
      </header>
      {
        <Row>
          <Col>
            <TableGenerator
              {...{ service }}
              omit="*"
              extras={[
                "user",
                "currency",
                "account_balance",
                "available_balance",
              ]}
              transformers={{
                user: ({ row }) => (
                  <>
                    <div className="media d-flex align-items-center">
                      <div className="avatar avatar-xl mr-4">
                        <div className="rounded-circle overflow-hidden img-fluid">
                          <IdenticonAvatar size={30} alt="" id={row.user?.id} />
                        </div>
                      </div>

                      <div className="media-body">
                        <div className="mb-0 fs--1">
                          <span>{row?.user?.email || "--"}</span>
                        </div>
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: 10, fontSize: 12 }}
                        >
                          Last updated:
                          <Moment withTitle format="MMM Do, Y hh:m A" trim>
                            {row?.updatedAt}
                          </Moment>
                        </div>
                      </div>
                    </div>
                  </>
                ),
                currency: ({ row }) => row?.currency || " Not specified",
                account_balance: ({ row }) => {
                  console.log(row);
                  return financial(row?.balance?.accountBalance || 0, 8);
                },
                available_balance: ({ row }) =>
                  financial(row?.balance?.availableBalance || 0, 8),
              }}
            />
          </Col>
        </Row>
      }
    </>
  );
}

export default UserBalance;
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
