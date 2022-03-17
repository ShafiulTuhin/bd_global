import PageTitle from "../layouts/PageTitle";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { notify } from "../../../_helpers/notify";

import { Form, Button } from "react-bootstrap";
import CryptoCurrencySelector from "../../_shared/components/input/CryptoCurrencySelector.component";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";
function WithdrawalFees() {
  const { t } = useTranslation();
  const { services, useService } = useServiceContextHook();

  return (
    <>
      <PageTitle activeMenu="Fees" motherMenu="Wallet management" />
      <header className="mb-4">
        <h3>{t("Fees management")}</h3>
      </header>

      <div style={{ marginBottom: 60 }}>
        <WithdrawalFeesSetting {...{ services, useService }} />
      </div>
    </>
  );
}
function WithdrawalFeesSetting({ services, useService }) {
  const { t } = useTranslation();
  const [withdrawalFee, setWithdrawalFee] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);
  const [affiliateFee, setAffiliateFee] = useState(0);
  const [crypto, setCrypto] = useState('BTC');

  const { fee } = services;

  let service = useService({
    [SERVICE?.CREATE]: fee.create,
    [SERVICE?.FINDBYID]: fee.findByID,
    [SERVICE?.UPDATEBYID]: fee.updateByID,
    [SERVICE?.REMOVEBYID]: fee.removeByID,
    [SERVICE?.FIND]: fee.find,
  });

   function onCryptoChange(value) {
    setCrypto(value);
  }
  
  async function onWithdrawalFeeChange(e) {
    // console.log(e.target.value);
    setWithdrawalFee(e.target.value);
  }

  function onTransactionFeeChange(e) {
    // console.log(e.target.value);
    setTransactionFee(e.target.value);
  }

  function onaffiliateFeeChange(e) {
    // console.log(e.target.value);
    setAffiliateFee(e.target.value);
  }

  function handleResponse(
    { data, error, message = "Error in response" },
    successMessage,
    errorMessage
  ) {
    try {
      if (!data) throw new Error(errorMessage || error?.message || message);
      notify(successMessage);
    } catch (err) {
      notify(err.message, "error");
    }
  }

  async function onWithdrawalClick(type) {
    
    let amt = 0;
    if (type == "WITHDRAWAL") {
      amt = withdrawalFee;
    } else if (type == "TRANSACTION") {
      amt = transactionFee;
    } else if (type == "COMMISSION") {
      amt = affiliateFee;
    }

    try {
      fee.find({ "where[type]": type, "where[crypto]": crypto}).then((res) => {
        // console.log(res?.data?.result[0]?.id);

        res?.data?.result[0]?.id
          ? fee
              .updateByID(res?.data?.result[0]?.id, {
                type: type,
                crypto: crypto,
                amount_in_percent: amt,
              })
              .then((data) => {
                // console.log("updateByID");
                // console.log(data);
                handleResponse(data, `${type} fee updated!`);
              })
          : fee
              .create({
                type: type,
                amount_in_percent: amt,
                fiat: "AED",
                crypto: crypto,
              })
              .then((data) => {
                // console.log(data);
                handleResponse(data, `${type} fee created!`);
              });
      });
    } catch (error) {
      notify(error?.message, "error");
    } finally {
      console.log("finally");
    }
  }

  useEffect(() => {
    fee.find({ "where[type]": "WITHDRAWAL", "where[crypto]": crypto }).then((res) => {
      // console.log(res?.data?.result[0]?.amount_in_percent);
      setWithdrawalFee(res?.data?.result[0]?.amount_in_percent ? res?.data?.result[0]?.amount_in_percent : 0);
    });

    fee.find({ "where[type]": "TRANSACTION", "where[crypto]": crypto }).then((res) => {
      // console.log(res?.data?.result[0]?.amount_in_percent);
      setTransactionFee(res?.data?.result[0]?.amount_in_percent ? res?.data?.result[0]?.amount_in_percent : 0);
    });

    fee.find({ "where[type]": "COMMISSION", "where[crypto]": crypto }).then((res) => {
      // console.log(res?.data?.result[0]?.amount_in_percent);
      setAffiliateFee(res?.data?.result[0]?.amount_in_percent ? res?.data?.result[0]?.amount_in_percent : 0);
    });
  }, [crypto]);

  return (
    <>
        <div className="row">
            <div className="col-md-6">
                <Form.Group className="mb-3" controlId="formCurrencyType">
                    <Form.Label>
                    <strong>Crypto</strong>
                    </Form.Label>
                    <CryptoCurrencySelector
                        all
                        onlySymbol
                        altTitle="Select currency"
                        attributes={{'className':"form-control"}}
                        onChange={(v) => onCryptoChange(v)}
                    />
                </Form.Group>
            </div>
        </div>
      <div
        style={{
          marginBottom: 60,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        <section className="d-flex justify-content-between" style={{ gap: 30 }}>
          <div className="">
            <h4 className="h5">{t("Withdrawal fee")}</h4>
            <small>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga
              modi consequuntur dolore eius fugiat velit. Odio voluptatem nobis
              eveniet dolorem deserunt odit corporis quibusdam doloremque
              quisquam, facilis beatae, suscipit neque.
            </small>
          </div>
          <div>
          <div className="input-group mb-3">
            <input
              type="number"
              placeholder="Amount"
              // defaultValue={withdrawalFee}
              value={withdrawalFee}
              pattern="\d+"
              className="form-control"
              onChange={onWithdrawalFeeChange}
            />
          </div>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => {
                onWithdrawalClick("WITHDRAWAL");
              }}
            >
              Save
            </button>
          </div>
        </section>
        <section className="d-flex justify-content-between" style={{ gap: 30 }}>
          <div className="">
            <h4 className="h5">{t("Transaction fee")}</h4>
            <small>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga
              modi consequuntur dolore eius fugiat velit. Odio voluptatem nobis
              eveniet dolorem deserunt odit corporis quibusdam doloremque
              quisquam, facilis beatae, suscipit neque.
            </small>
          </div>
          <div>
          <div className="input-group mb-3">
            <input
              type="number"
              placeholder="amount"
              // defaultValue={transactionFee}
              value={transactionFee}
              pattern="\d+"
              className="form-control "
              onChange={onTransactionFeeChange}
            />
            <div className="input-group-append">
              <span className="input-group-text">%</span>
            </div>
            </div>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => {
                onWithdrawalClick("TRANSACTION");
              }}
            >
              Save
            </button>
          </div>
        </section>
        <section className="d-flex justify-content-between" style={{ gap: 30 }}>
          <div className="">
            <h4 className="h5">{t("Affiliate commission fee")}</h4>
            <small>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga
              modi consequuntur dolore eius fugiat velit. Odio voluptatem nobis
              eveniet dolorem deserunt odit corporis quibusdam doloremque
              quisquam, facilis beatae, suscipit neque.
            </small>
          </div>{" "}
          <div>
          <div className="input-group mb-3">
            <input
              type="number"
              placeholder="amount"
              // defaultValue={affiliateFee}
              value={affiliateFee}
              pattern="\d+"
              className="form-control"
              onChange={onaffiliateFeeChange}
            />
            <div className="input-group-append">
              <span className="input-group-text">%</span>
            </div>
            </div>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => {
                onWithdrawalClick("COMMISSION");
              }}
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default WithdrawalFees;
