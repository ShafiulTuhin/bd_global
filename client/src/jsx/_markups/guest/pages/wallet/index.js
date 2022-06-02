import React, { useEffect, useState } from "react";
import Feedback from "../../../_shared/components/Feedback.component";
import QRCode from "react-qr-code";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { routeMap } from "../../routes";
import { useLocation } from "react-router-dom";

import { notify } from "../../../../_helpers/notify";
import { financial } from "../../../../_helpers/utils.helper";
// HOOKS
import usePaginator from "../../../../_hooks/paginator.hook.js";
import useServiceContextHook from "../../../../_hooks/service.context.hook";

// ASSETS
import bnb_icon from "../../app-assets/images/coin/bnb.png";
import btc_icon from "../../app-assets/images/coin/btc.png";
import eos_icon from "../../app-assets/images/coin/eos.png";
import eth_icon from "../../app-assets/images/coin/eth.png";
import usdt_icon from "../../app-assets/images/coin/usdt.png";
import xrp_icon from "../../app-assets/images/coin/xrp.png";
import {
  StyledCard,
  StyledIcon,
  StyledSection,
  StyledTable,
  StyledTabButton,
  Cage,
} from "../../../_shared/components/styled.component";
import { Alert, Badge, Button, FormControl } from "react-bootstrap";
import { ModalForm } from "../../../_shared/components/modalForm.component";
import useToggler from "../../../../_hooks/toggler.hook";
import Moment from "react-moment";
import { FormGroup } from "@mui/material";
import { Formik } from "formik";
import numeral from "numeral";

const currencyImages = {
  BTC: btc_icon,
  ETH: eth_icon,
  USDT: usdt_icon,
  XRP: xrp_icon,
  EOS: eos_icon,
  BNB: bnb_icon,
};

// Create our number formatter.
// var formatter = new Intl.NumberFormat("en-US", {
//   style: "currency",
//   currency: "USD",

//   // These options are needed to round to whole numbers if that's what you want.
//   //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
//   //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
// });
const pageTabs = [
  {
    label: "Assets",
    async callback(cb) {
      cb && cb();
    },
  },
  {
    label: "History",
    callback: async (cb) => {
      cb && cb();
    },
  },
];

export default function Wallet() {
  const { t } = useTranslation();
  const {
    session: { user },
    services: { wallet: walletService, coingecko, type, logger, transaction },
  } = useServiceContextHook();

  const [currencies, setCurrencies] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [activePageTab, setActivePageTab] = useState(0);
  const [assets, setAssets] = useState([]);
  const [assetHistory, setAssetsHistory] = useState();
  const [assetAggregate, setAssetAggregate] = useState({
    total: 0,
    totalAvailable: 0,
    totalInProcess: 0,
  });
  const [exchangePrices, setExchangePrices] = useState();
  const location = useLocation()


  const {
    count,
    page,
    limit,
    setCount,
    onRowsPerPageChange,
    onPageChange,
    StyledPagination,
    Skeleton,
  } = usePaginator();

  const tabs = [
    <Assets
      {...{
        data: assets,
        currencies,
        onRowsPerPageChange,
        onPageChange,
        count,
        page,
        limit,
        StyledPagination,
        exchangePrices,
      }}
    />,
    <AssetHistory
      {...{
        data: assetHistory,
        currencies,
        onRowsPerPageChange,
        onPageChange,
        count,
        page,
        limit,
        StyledPagination,
        exchangePrices,
      }}
    />,
  ];

  useEffect(()=>{
    if(location?.state?.tabname==="History"){
      setActivePageTab(1)
      return window.history.replaceState({}, "")
    }   
  },[])

  useEffect(() => {
    async function fetchAssetHistories() {
      try {
        let theHistory = await transaction.find({
          // sudo: true,
          // where: {
          //   user_id: user?.id,
          //   // type: "TRANSACTION",
          // },
          // fake: true,
          // limit,
          // offset: page * limit,
          order: JSON.stringify([
          ["created_at", "DESC"],
          ["updated_at", "DESC"],
        ]),
        });
        const {
          error,
          data,
          message = "Error fetching assets history",
        } = theHistory;
        if (!data) throw new Error(error.message || message);
        setCount(data?.count);
        setAssetsHistory(data?.result);
      } catch (err) {
        err.message && notify(err.message, "error");
        // console.error("fetchAssetHistories errors", err);
      }
    }

    async function fetchAssets() {
      try {
        let wallets = await walletService.find({
          limit,
          offset: page * limit,
          // fake: true,
        });
        const {
          error,
          data,
          message = "Error fetching wallet assets",
        } = wallets;
        if (error) {
          throw new Error(error?.message || message);
        }

        setCount(data?.count);
        setAssets(data?.result);
      } catch (err) {
        // console.error("Fetch assets error", { err });
        err.message && notify(err.message, "error");
      }
    }

    async function refetchData() {
      try {
        switch (activePageTab) {
          case 1: {
            await fetchAssetHistories();
            break;
          }
          default:
          case 0: {
            await fetchAssets();
            break;
          }
        }
      } catch (err) {
        notify(err.message, "error");
      }
    }

    async function fetchCurrencies() {
      let response = await type.findByName("supported_tokens");

      let { error, data } = response;
      if (!data) {
        console.error(error.message);
        return;
      }
      setCurrencies(data);
    }

    (async () => {
      try {
        setIsLoading(true);
        if (currencies) {
          if (!exchangePrices) {
            let joinCurrencies = Object.values(currencies).join(",");
            let xchanges = async (assets, fiat) =>
              await coingecko.cryptoVsFiatPrice(assets, fiat);
            let response = await xchanges(joinCurrencies, "USD");
            let {
              data,
              error,
              message = "Error fetching exchange prices",
            } = response;
            if (!data) throw new Error(error.message || message);
            setExchangePrices(data);
          }
          await refetchData();
        } else {
          await fetchCurrencies();
        }
      } catch (err) {
        notify(err.message, "error");
      } finally {
        setIsLoading(false);
      }
    })();
    console.log({ activePageTab, currencies, page, limit });
    return () => {
      walletService?.abort();
      logger?.abort();
    };
  }, [activePageTab, currencies, page, limit]);

  useEffect(() => {
    function aggregateAsset() {
      if (assets) {
        let total = assets.reduce((prev, current, idx) => {
          let assetInUSD = exchangePrices[currencies[current.currency]].usd;
          let BTCInUSD = exchangePrices["bitcoin"].usd;

          // get the value of asset in BTC
          let assetInBTC = assetInUSD / BTCInUSD || 0;

          let sum =
            prev + Number(current?.balance?.accountBalance) * assetInBTC;

          // Sum
          return sum;
        }, 0),
          totalAvailable = assets.reduce((prev, current) => {
            // get the value of BTC to
            let assetInUSD = exchangePrices[currencies[current.currency]].usd;
            let BTCInUSD = exchangePrices["bitcoin"].usd;

            // get the value of asset in BTC
            let assetInBTC = assetInUSD / BTCInUSD || 0;
            return prev + +current?.balance?.availableBalance * assetInBTC;
          }, 0),
          totalInProcess = Math.abs(total - totalAvailable);

        return {
          total,
          totalAvailable,
          totalInProcess,
        };
      }
    }
    if (assets && exchangePrices) {
      let agg = aggregateAsset();
      // console.log(agg);
      setAssetAggregate(agg);
    }
  }, [assets, exchangePrices, currencies]);

  return (
    user && (
      <div className="">
        <section id="mainTop">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h3
                  className="wow animate__animated fadeInDown"
                  data-wow-delay="0.3s"
                >
                  {t("Wallet")}
                </h3>
              </div>
            </div>
          </div>
        </section>
        <div className="container p-0">
          {/* AGGREGATE BOARD */}
          {exchangePrices && (
            <div style={{ marginTop: 30, padding: 10 }}>
              <div
                className="wow fadeInUp"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 10,
                }}
                data-wow-delay="0.5s"
              >
                {/* TODO: Convert to BTC */}
                <StyledCard
                  className="rounded-lg d-block"
                  style={{ flex: "auto" }}
                >
                  <StyledSection plain>
                    {" "}
                    <small className=" mb-2">{t("Total assets")}</small>
                    {!isLoading ? (
                      <>
                        <div className="h5 font-bold">
                          {financial(assetAggregate?.total, 10)} BTC
                        </div>
                        <div className="text-muted">
                          ≈ $
                          {numeral(
                            assetAggregate?.total *
                            exchangePrices["bitcoin"].usd
                          ).format("0,0[.]00")}
                        </div>
                      </>
                    ) : (
                      <Skeleton style={{ width: "100%" }} animation={"wave"} />
                    )}
                  </StyledSection>
                </StyledCard>
                <StyledCard
                  className="rounded-lg d-block"
                  style={{ flex: "auto" }}
                >
                  <StyledSection plain>
                    {" "}
                    <small className=" mb-2">{t("Total available")}</small>
                    {!isLoading ? (
                      <>
                        {" "}
                        <div className="h5 font-bold">
                          {financial(assetAggregate?.totalAvailable, 10)} BTC
                        </div>
                        <div className="text-muted">
                          ≈ $
                          {numeral(
                            assetAggregate?.totalAvailable *
                            exchangePrices["bitcoin"].usd
                          ).format("0,0[.]00")}
                        </div>
                      </>
                    ) : (
                      <Skeleton style={{ width: "100%" }} animation={"wave"} />
                    )}
                  </StyledSection>
                </StyledCard>
                <StyledCard
                  className="rounded-lg d-block"
                  style={{ flex: "auto" }}
                >
                  <StyledSection plain>
                    <small className=" mb-2">{t("Balance in process")}</small>
                    {!isLoading ? (
                      <>
                        {" "}
                        <div className="h5 font-bold">
                          {financial(assetAggregate?.totalInProcess, 10)} BTC
                        </div>
                        <div className="text-muted">
                          ≈ $
                          {numeral(
                            assetAggregate?.totalInProcess *
                            exchangePrices["bitcoin"].usd,
                            2
                          ).format("0,0[.]00")}
                        </div>
                      </>
                    ) : (
                      <Skeleton style={{ width: "100%" }} animation={"wave"} />
                    )}
                  </StyledSection>
                </StyledCard>
              </div>
            </div>
          )}

          {/* DATA TABLES */}
          <div style={{ padding: 0, marginTop: 60 }}>
            <StyledSection plain>
              <div
                className="d-flex"
                style={{ display: "flex", gap: 10, alignItems: "center" }}
              >
                <h4 className="h4">{t(pageTabs[activePageTab].label)}</h4>
                <ul
                  className="ml-auto my-auto"
                  style={{ display: "flex", gap: 10 }}
                >
                  {pageTabs.map(({ label }, id) => (
                    <li key={id}>
                      <StyledTabButton
                        disabled={isLoading}
                        onClick={() => setActivePageTab(id)}
                        className={`${id == activePageTab && "on"}`}
                        type="button"
                      >
                        {t(label)}
                      </StyledTabButton>
                    </li>
                  ))}
                </ul>
              </div>
            </StyledSection>
            <div
              className="table_container wow fadeInUp"
              data-wow-delay="0.7s"
              style={{ background: "white" }}
            >
              {isLoading ? (
                <Feedback.Loading />
              ) : (
                tabs.map((tab, idx) => (
                  <div key={idx} hidden={activePageTab !== idx}>
                    {tab}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PRELIMINARY */}
          <StyledSection plain style={{ margin: "60px 0", background: "#fff" }}>
            <div className="">
              <div className="row wow fadeInUp" data-wow-delay="0.9s">
                <div className="col-12">
                  <p>
                    Transaction history can be checked in the Assets menu.
                    <br />
                    Detailed instructions on signup, verification and trading
                    can be found in the guide below..
                  </p>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-12 my-4">
                  <Button to="#" style={{ width: "100%" }}>
                    Exchange Guide&nbsp;
                    <i className="far fa-arrow-to-bottom"></i>
                  </Button>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-12 my-4">
                  <Button to="#" style={{ width: "100%" }}>
                    pro chart guide&nbsp;
                    <i className="far fa-arrow-to-bottom"></i>
                  </Button>
                </div>
                <div className="col-lg-4 col-md-12 col-sm-12 my-4">
                  <Button to="#" style={{ width: "100%" }}>
                    Verification guide&nbsp;
                  </Button>
                </div>
                <div className="col-12">
                  <p>
                    For more information <span>FAQ</span>&nbsp;can be found at.
                  </p>
                </div>
              </div>
            </div>
          </StyledSection>
        </div>
      </div>
    )
  );
}

/**
 *@description List assets
 * @param {Object} props
 * @param {Function} props.onRowsPerPageChange
 * @param {Function} props.onPageChange
 * @param {Number} props.count
 * @param {Number} props.page
 * @param {Number} props.limit
 * @param {Number} props.offset
 * @param {import("prop-types").ReactComponentLike} props.StyledPagination
 * @param {Array} props.data
 * @param {Array} props.currencies
 * @returns
 */
function Assets({
  data,
  currencies,
  onRowsPerPageChange,
  onPageChange,
  count,
  page,
  limit,
  StyledPagination,
}) {
  const { t } = useTranslation();
  const { isOpen, onOpen, toggledPayload, onClose } = useToggler();
  const { history } = useServiceContextHook();
  /**
   * @description Dynamically renders data on modal
   * @param {Object} props
   * @param {String} props.type
   * @param {Object} props.data Asset data
   * @returns
   */
  function RenderAction({ type, data }) {
    switch (type) {
      case "deposit": {
        if (data)
          return [
            <header>
              <h5 className="h5">Deposit {data?.currency || ""}</h5>
            </header>,
            <DepositFund data={data} currencies={currencies} />,
          ];
        break;
      }
      case "withdraw": {
        if (data)
          return [
            <header>
              <h5 className="h5">Withdraw {data?.currency || ""}</h5>
            </header>,
            <WithdrawFund
              data={data}
              currencies={currencies}
              callback={() => onClose()}
            />,
          ];
        break;
      }
      case "transfer": {
        if (data)
          return [
            <header>
              <h5 className="h5">Transfer {data?.currency || ""}</h5>
            </header>,
            <TransferFund data={data} currencies={currencies} />,
          ];
        break;
      }
      default: {
        return ["Nothing Found", <Feedback />];
      }
    }
  }

  const item_order = ["BTC", "ETH", "BNB", "XRP", "USDT"];
  function mapOrder(array, order, key) {
    array.sort(function (a, b) {
      var A = a[key],
        B = b[key];

      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
    });
    return array;
  }
  mapOrder(data, item_order, "currency");

  return (
    <>
      {data && data.length ? (
        <>
          {/* START MODAL */}
          <ModalForm
            {...{
              useFormRenderer: RenderAction,
              formData: toggledPayload,
              onClose,
              isOpen,
            }}
          />
          {/* END MODAL */}
          <div className="table-responsive p-3">
            <StyledTable className="">
              <thead>
                <tr>
                  <th>{t("Coin")}</th>
                  <th>{t("Available")}</th>
                  <th>{t("In Order")}</th>
                  {/* <th>{t("USD Value")}</th> */}
                  <th>{t("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((data, idx) => (
                  <tr
                    key={idx}
                    className={String(currencies[data.currency])?.toLowerCase()}
                  >
                    <td
                      className=""
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        border: 'none'
                      }}
                    >
                      <StyledIcon>
                        <img
                          src={currencyImages[data.currency] || btc_icon}
                          alt={data.currency}
                        />
                      </StyledIcon>
                      <dl>
                        <dt>{data.currency}</dt>
                        <dd className="text-uppercase">
                          {String(currencies[data.currency]).replace(/-/g, " ")}
                        </dd>
                      </dl>
                    </td>
                    <td className="available">
                      {financial(
                        data.balance && +data.balance.accountBalance,
                        10
                      )}
                    </td>
                    <td className="order">
                      {financial(
                        data.balance &&
                        +data.balance.accountBalance -
                        +data.balance.availableBalance,
                        10
                      )}
                    </td>

                    <td
                      className=""
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "baseline",
                      }}
                    >
                      <Button
                        variant="default"
                        type="button"
                        onClick={() => onOpen({ type: "deposit", data })}
                      // {`?address=${data.address}&action=deposit`}
                      >
                        Deposit
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => onOpen({ type: "withdraw", data })}
                        type="button"
                      // to={`?address=${data.address}&action=withdraw`}
                      >
                        Withdraw
                      </Button>
                      <Button
                        onClick={() =>
                          history.push({ pathname: routeMap.advert })
                        }
                        variant="default"
                        type="button"
                      >
                        Trade
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {data?.length && count >= limit ? (
                <tfoot>
                  <tr>
                    <StyledPagination
                      count={count}
                      page={page}
                      rowsPerPage={limit || 10}
                      onRowsPerPageChange={onRowsPerPageChange}
                      onPageChange={onPageChange}
                    />
                  </tr>
                </tfoot>
              ) : null}
            </StyledTable>
          </div>
        </>
      ) : (
        <>
          <Feedback />
        </>
      )}
    </>
  );
}

/**
 *
 * @param {Object} props
 * @param {Function} props.onRowsPerPageChange
 * @param {Function} props.onPageChange
 * @param {Number} props.count
 * @param {Number} props.page
 * @param {Number} props.limit
 * @param {Number} props.offset
 * @param {import("prop-types").ReactComponentLike} props.StyledPagination
 * @param {Array} props.data
 * @param {Array} props.currencies
 * @returns
 */
function AssetHistory({
  data,
  currencies,
  onRowsPerPageChange,
  onPageChange,
  count,
  page,
  limit,
  exchangePrices,
  StyledPagination,
}) {
  const { t } = useTranslation();
  function toUSD(amt, currency) {
    if ((amt != undefined || null) && currency) {
      let assetInUSD = exchangePrices[currencies[currency]].usd;

      return Number(amt) * assetInUSD;
    }
    return NaN;
  }
  /* 
  TRANSFER: "TRANSFER",
    WITHDRAWAL: "WITHDRAW",
    DEPOSIT: "DEPOSIT",
    CREDIT: "CREDIT",
    DEBIT: "DEBIT", */
  const symbols = {
    transfer: <span>&#8594;</span>,
    withdraw: <span>&#8593;</span>,
    deposit: <span>&#8595;</span>,
    credit: <span>&#8601;</span>,
    debit: <span>&#x2197;</span>,
  };
  return data && data.length ? (
    <>
      <ul style={{ display: "flex", flexDirection: "column" }}>
        {data?.map((trx, idx) => {
          return (
            <li
              className={[
                "transaction_block",
                String(trx?.type)?.toLowerCase(),
              ].join(" ")}
              key={idx}
            >
              <div className={`trx_symbol `}>
                {symbols[String(trx?.type)?.toLowerCase()]}
              </div>
              <div>
                <strong className="trx_qty">
                  {trx?.quantity} {trx?.wallet?.currency || ""}
                </strong>
                <p className="trx_in_usd">
                  {String(trx?.type)?.toLowerCase() === "credit" ? "+" : "-"}$
                  {numeral(toUSD(trx?.quantity, trx?.wallet?.currency)).format(
                    "0,0[.]00"
                  )}
                </p>
              </div>
              <div className="ml-auto text-right d-flex flex-column">
                <ul className="trx_meta">
                  <li>
                    <Badge className="text-capitalize" pill variant="info">
                      {String(trx?.type)?.toLowerCase()}
                    </Badge>
                  </li>
                  <li title={trx?.wallet?.address}>
                    {String(trx?.type)?.toLowerCase() === "credit"
                      ? "From"
                      : "To"}
                    : <code className="textOver">{trx?.wallet?.address.substring(0, 5)}...{trx?.wallet?.address.substring(trx?.wallet?.address.length - 5, trx?.wallet?.address.length)}</code>
                    <button type="button" className="p-2 ml-2"> 
                    <CopyToClipboard
                        text={trx?.wallet?.address}
                        onCopy={() => notify("Copied wallet address to clipboard")}
                      >
                        <i className="fal fa-copy" />
                      </CopyToClipboard>
                      </button>
                  </li>
                  <li>
                    <Moment format="YYYY-MM-DD HH:mm">{trx?.created_at}</Moment>
                  </li>
                </ul>
              </div>
            </li>
          );
        })}
      </ul>

      <table style={{ borderTop: "1px solid #c4c3c355", width: "100%" }}>
        <tfoot>
          <StyledPagination
            count={count}
            page={page}
            rowsPerPage={limit || 10}
            onRowsPerPageChange={onRowsPerPageChange}
            onPageChange={onPageChange}
          />
        </tfoot>
      </table>
    </>
  ) : (
    <Feedback />
  );
}

/**
 * @description Deposit funds form
 * @param {Object} props
 * @param {Array} props.data
 * @param {Array} props.currencies
 * @returns
 */
function DepositFund({ data, currencies }) {
  console.log("data::",data)
  return (
    data && (
      <Formik initialValues={{}} onSubmit={(values, { setIsSubmitting }) => { }}>
        {({
          isSubmitting,
          values,
          errors,
          handleChange,
          handleBlur,
          touched,
          setFieldValue,
        }) => (
          <Cage>
            <div
              className="mx-auto"
              style={{ maxWidth: 200, textAlign: "center" }}
            >
              <figure>
                {data?.address && <QRCode value={data?.address} size={100} />}
              </figure>
              <small className="d-block">
                Send only {data?.currency} to this address
              </small>
            </div>
            {/* WALLET ADDRESS */}
            <StyledSection>
              <div className="font-bold">Wallet Address</div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 10,
                  justifyContent: "space-between",
                }}
              >
              
                <span className="truncate">{data?.address}</span>
                <CopyToClipboard
                  text={data?.address}
                  onCopy={() => notify("Copied")}
                >
                  <span className="cursor-pointer fas fa-copy"></span>
                </CopyToClipboard>
              </div>
            </StyledSection>
            {/* NETWORK */}
            <StyledSection>
              <div className="font-bold">Network</div>
              {/*  <NetworkSelector
                where={data?.currency}
                attributes={{
                  name: "network",
                  onBlur: handleBlur,
                  defaultValue: values?.network,
                }}
                onChange={(v) => setFieldValue("network", v)}
              /> */}
              {data?.network && <p>{data?.network}</p>}
              <Alert variant="warning">
                <small>Ensure you select the same network as above</small>
              </Alert>
            </StyledSection>
            {/* DESTINATION TAG */}
            {data?.destination_tag && (
              <StyledSection>
                <div className="">
                  <div className="">Destination Tag</div>
                  <div className="font-bold">{data?.destination_tag}</div>
                </div>
              </StyledSection>
            )}
            {/* PRELIMINARY */}
            {data?.memo && (
              <StyledSection>
                <div className="">
                  <div className="font-bold">Memo</div>
                  <div className="">{data?.memo}</div>
                </div>
              </StyledSection>
            )}

            <StyledSection className="wd-info col-12">
              <p>
                <i className="fa fa-info-circle mr-2"></i>Additional information
              </p>
              <ul className="mt-3">
                <li className="d-flex justify-content-between">
                  <p>Minimum deposit</p>
                  <span className="font-bold">
                    {data?.currency === "BTC"
                      ? 0.001
                      : data?.currency === "ETH"
                        ? 0.02
                        : data?.currency === "XRP"
                          ? 5
                          : data?.currency === "BNB"
                            ? 0.1
                            : 50}
                  </span>
                </li>
                <li className="d-flex justify-content-between">
                  <p>Expected arrival</p>
                  <span className="font-bold">12 connections</span>
                </li>
                <li className="d-flex justify-content-between">
                  <p>Expected Unlock</p>
                  <span className="font-bold">12 connections</span>
                </li>
              </ul>
            </StyledSection>
            {/* <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Button type="button">Share</Button>
            </div> */}
          </Cage>
        )}
      </Formik>
    )
  );
}

/**
 *
 * @param {Object} props
 * @param {Array} props.data - table data
 * @returns
 */
function TransferFund({ data }) {
  return <></>;
}

/**
 * @description Withdrawal form
 * @param {Object} props
 * @param {Array} props.data
 * @param {Array} props.currencies - List of all supported currencies
 * @returns
 */
function WithdrawFund({ data, callback = () => null }) {


  const MIN_BTC = 0.01;
  const MIN_ETH = 0.002;
  const MIN_XRP = 5;
  const MIN_BNB = 0.02;
  const MIN_USDT = 50;

  const {
    services: { type, wallet },
  } = useServiceContextHook();

  return (
    data && (
      <Formik
        initialValues={{
          from: data.address,
          to: "",
          amount: 0,
          destinationTag:0,
          currency:data.currency
        }}
        validate={(values) => {
          const errors = {};
          if (values.amount < 0) {
            errors.amount = "Invalid amount!";
          } else if (
            values?.amount > (data.balance && data?.balance?.availableBalance)
          ) {
            errors.amount = "Insufficient wallet balance";
          }

          if (data?.currency === "BTC" && values?.amount < MIN_BTC) {
            errors.amount = `Minimum Amount should be minimum ${MIN_BTC}`;
          }

          if (data?.currency === "ETH" && values?.amount < MIN_ETH) {
            errors.amount = `Minimum Amount should be minimum ${MIN_ETH}`;
          }

          if (data?.currency === "XRP" && values?.amount < MIN_XRP) {
            errors.amount = `Minimum Amount should be minimum ${MIN_XRP}`;
          }

          if (data?.currency === "BNB" && values?.amount < MIN_BNB) {
            errors.amount = `Minimum Amount should be minimum ${MIN_BNB}`;
          }

          if (data?.currency === "" && values?.amount < MIN_USDT) {
            errors.amount = `Minimum Amount should be minimum ${MIN_USDT}`;
          }

          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setSubmitting(true);
            let {
              data,
              error,
              message = "Error in withdrawal",
            } = await wallet.withdraw({
              ...values,
              amount: String(values.amount),
            });

            if (!data) throw new Error(error.message || message);
            notify(
              <div>
                <p>
                  Successfully completed withdrawal request. Check your
                  dashboard for status
                </p>
              </div>,
              "success"
            );
            typeof callback === "function" && callback(data);
          } catch (err) {
            notify(err.message, "error");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          setFieldValue,
          handleBlur,
          handleChange,
          handleSubmit,
          touched,
          errors,
          isSubmitting,
          values,
        }) => (
          <form onSubmit={handleSubmit}>
            <Cage>
              <StyledSection
                style={{ display: "flex", gap: 10, flexDirection: "column" }}
              >
                {/* ADDRESS */}
                <FormGroup>
                  <label htmlFor="withdraw-to-address">Address</label>
                  <FormControl
                    required
                    type="text"
                    name="to"
                    onChange={handleChange}
                    defaultValue={values?.address}
                    onBlur={handleBlur}
                    id="withdraw-to-address"
                    placeholder="Wallet address"
                  />
                </FormGroup>

                {/* DESTINATION TAG */}
                {/* {data?.destination_tag && (
                  <FormGroup>
                    <label htmlFor="withdraw-dest-tag">Destination tag</label>
                    <FormControl
                      required
                      type="text"
                      defaultValue={values?.destination_tag}
                      name="destination_tag"
                      id="withdraw-dest-tag"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Destination tag"
                    />
                  </FormGroup>
                )} */}
                {/* AMOUNT */}

                {data.balance && (
                  <FormGroup>
                    <label htmlFor="withdraw-amount">Amount</label>
                    <FormControl
                      required
                      defaultValue={values?.amount}
                      placeholder="Amount"
                      step="0.000000001"
                      name="amount"
                      onBlur={handleBlur}
                      min={0}
                      onChange={({ target }) => {
                        if (target.value > 0) {
                          setFieldValue("amount", target.value);
                        }
                      }}
                      type="number"
                      id="withdraw-amount"
                    />
                    {errors && errors.amount && touched && (
                      <small className="text-danger py-1">
                        {errors.amount}
                      </small>
                    )}
                  </FormGroup>
                )}

                {data?.currency == "XRP"?(<FormGroup>
                  <label htmlFor="withdraw-amount">Destination Tag</label>
                  <FormControl
              
                    defaultValue={values?.destinationTag}
                    placeholder="Destination Tag"
                    step="0.000000001"
                    name="destinationTag"
                    onBlur={handleBlur}
                    min={0}
                    onChange={({ target }) => {
                      if (target.value > 0) {
                        setFieldValue("destinationTag", target.value);
                      }
                    }}
                    type="number"
                    id="destinationTag"
                  />
                  {/* {errors && errors.amount && touched && (
                    <small className="text-danger py-1">
                      {errors.amount}
                    </small>
                  )} */}
                </FormGroup>):("")}
                
                {/* AVAILABLE */}
                <FormGroup>
                  <div className="d-flex justify-content-between px-1">
                    <small>Available balance</small>
                    <span className="font-bold">
                      {financial(
                        data?.balance && data?.balance?.availableBalance,
                        8
                      )}
                      {data?.currency}
                    </span>
                  </div>
                </FormGroup>
                {/* NETWORK */}
                <FormGroup>
                  <div className="d-flex justify-content-between px-1">
                    <small>Network</small>
                    {/*     <NetworkSelector
                    where={data?.currency}
                    attributes={{
                      name: "network",
                      onBlur: handleBlur,
                      defaultValue: values?.network,
                    }}
                    onChange={(v) => setFieldValue("network", v)}
                  /> */}
                    {data?.network && <p>{data?.network}</p>}
                  </div>
                </FormGroup>

                {/*TODO: NETWORK FEES */}
                {/* <FormGroup className="px-1">
                  <div className="d-flex justify-content-between">
                    <span>Network Fee</span>
                    <span className="font-bold">
                      {financial(
                        data?.balance && data?.balance?.availableBalance,
                        8
                      )}
                      {data?.currency}
                    </span>
                  </div>
                </FormGroup> */}

                <Button
                  type="submit"
                  disabled={
                    isSubmitting || !errors || Object.keys(errors).length
                  }
                >
                  {isSubmitting ? "Submitting..." : "Confirm withdrawal"}
                </Button>
              </StyledSection>
            </Cage>
          </form>
        )}
      </Formik>
    )
  );
}
