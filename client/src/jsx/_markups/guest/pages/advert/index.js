import numeral from "numeral";
import React, { useEffect, useState } from "react";
import "./advert.style.css";
import { Modal, Image, Alert, Button, Form, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { notify } from "../../../../_helpers/notify";
import { deepObjectStringify, isBetween } from "../../../../_helpers";
import usdt_icon from "../../app-assets/images/icon/usdt.png";
import bank_icon from "../../app-assets/images/icon/bank-icon.png";
import money_icon from "../../app-assets/images/icon/money.png";
import chat_icon from "../../app-assets/images/icon/chat-icon.png";
import conversion from "../../app-assets/images/icon/conversion.png";

// COMPONENTS
import AdvertType from "../../../_shared/components/input/AdvertType.component";
import FiatCurrencySelector from "../../../_shared/components/input/FiatCurrencySelector.component";
import PaymentMethod from "../../../_shared/components/input/PaymentMethod.component";
import Loader from "../../../_shared/components/Loader.component";
import Feedback from "../../../_shared/components/Feedback.component";

// HELPERS
import { routeMap } from "../../routes";

// Multi language
import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import useToggler from "../../../../_hooks/toggler.hook";
import usePaginatorHook from "../../../../_hooks/paginator.hook.js";
import {
  AntSwitch,
  FieldGroup,
  MiscContainer,
} from "../../../_shared/components/styled.component";
import CopyToClipboard from "react-copy-to-clipboard";
import { NumbericInput } from "../../components/NumbericInput";
import { FormControlLabel } from "@mui/material";

import useQuery from "../../../../_hooks/query.hook";
import Moment from "react-moment";

// CONSTANTS
const trade_types = ["buy", "sell"];
// const crypto = ["btc", "eth", "eos", "xrp", "usdt"];

const payment_methods = {
  ALIPAY: {
    icon: money_icon,
  },
  WECHAT: {
    icon: chat_icon,
  },
  BANK_TRANSFER: {
    icon: bank_icon,
  },
  CASH_DEPOSIT: {
    icon: usdt_icon,
  },
};

export default function Adverts() {
  const { t } = useTranslation();
  const {
    session: { user },
    services: { advert, type },
  } = useServiceContextHook();
  const paginator = usePaginatorHook();
  const { count, page, setCount, limit, Skeleton } = paginator;

  const [cachedData, setCachedData] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCrypto, setActiveCrypto] = useState(null);
  const [activeTradeType, setActiveTradeType] = useState(trade_types[0]);
  const [data, setData] = useState(null);
  const [activeFiat, setActiveFiat] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [advertType, setAdvertType] = useState(null);
  const [errors, setErrors] = useState(null);
  const [query, setQuery] = useState(null);
  const [showPublished, setShowPublished] = useState(true);
  const [unPublishedCount, setUnpublishedCount] = useState(0);

  /**
   * @function buildCachedData
   * @description constructs the cached data
   * @param {String} currency Currency type
   * @param {String} type Trade type
   */
  function buildCacheData(result) {
    return {
      [`${activeTradeType}/${activeCrypto}`]: {
        trade: activeTradeType,
        fiat: activeFiat,
        limit,
        result,
        page,
        count,
        paymentMethod,
        advertType,
        published: showPublished,
      },
    };
  }

  /**
   * @function fetchData
   * @description Makes a network request
   * @returns
   */
  async function fetchData() {
    let response = await advert?.find(query);
    // Find all unpublished data
    let _rep = await advert?.find({ where: { published: false } });
    if (response.data) {
      const { result, count } = response.data;
      setCount(count);
      setUnpublishedCount(_rep?.data?.count || 0);
      // Store new data in cache
      setCachedData((old) => ({ ...old, ...buildCacheData(result) }));
    }
    return response;
  }

  /**
   * @description fetches cached data if any, else makes a network request
   * @returns
   */
  async function cacheOrFetch(refresh = false) {
    let item = cachedData[`${activeTradeType}/${activeCrypto}`];
    // if data is not cached, fetch from server
    if (!item || refresh) {
      return fetchData();
    }
    // compare cached data with current
    let { result, count, ...old } = item;
    old = deepObjectStringify(old);
    let changed = deepObjectStringify({
      trade: activeTradeType,
      fiat: activeFiat,
      limit,
      page,
      paymentMethod,
      advertType,
      published: showPublished,
    });

    // Check that all filters match
    return old === changed ? { data: item } : fetchData();
  }

  /**
   * @description handle fiat currency change
   * @param {String} currency
   */
  function onFiatChange(currency) {
    setActiveFiat(currency);
  }

  /**
   * @description handle crypto currency change
   * @param {String} currency
   */
  function onCryptoChange(currency) {
    setActiveCrypto(currency);
  }

  /**
   * @description handle trade type change
   * @param {String} currency
   */
  function onTradeTypeChange(type) {
    setActiveTradeType(type);
  }

  async function loadData(refresh = false) {
    try {
      setIsLoading(true);
      let { data } = await cacheOrFetch(refresh);

      if (!data) return;
      setData(data.result);
    } catch (err) {
      setErrors(err.message);
      console.error(err);
    } finally {
      setIsLoading(advert?.isFetching);
    }
  }
  /**
   * @description handle payment method change
   * @param {String} method
   */
  function onPaymentMethodChange(method) {
    setPaymentMethod(String(method)?.toUpperCase());
  }

  /**
   * @description handle advert type change
   * @param {String} method
   */
  function onAdvertTypeChange(method) {
    setAdvertType(method);
  }

  useEffect(() => {
    if (query) {
      loadData();
    }
  }, [query]);

  useEffect(() => {
    if (crypto) {
      const filter = {
        order: JSON.stringify([
          ["createdAt", "DESC"],
          ["updatedAt", "DESC"],
        ]),
        where: {
          ...(activeTradeType && {
            type:
              String(activeTradeType)?.toUpperCase() === "BUY" ? "SELL" : "BUY",
          }),
          ...(advertType && {
            user_id: advertType,
          }),
          ...(activeCrypto && {
            crypto: String(activeCrypto)?.toUpperCase(),
          }),
          ...(activeFiat && {
            fiat: String(activeFiat)?.toUpperCase(),
          }),
          ...(paymentMethod && {
            payment_methods: { $contains: String(paymentMethod).trim() },
          }),
          ...(showPublished
            ? {
              published: showPublished,
            }
            : {
              published: showPublished,
              ...(user && { user_id: user?.id }),
            }),
        },
        // fake: true,
        limit,
        offset: page * limit || 0,
      };

      if (query) {
        let old = deepObjectStringify(query),
          changed = deepObjectStringify(filter);
        if (old === changed) return;
      }
      setQuery(filter);
    }
  }, [
    page,
    limit,
    activeTradeType,
    activeFiat,
    paymentMethod,
    activeCrypto,
    advertType,
    crypto,
    showPublished,
  ]);

  useEffect(() => {
    (async () => {
      try {
        let {
          data,
          error,
          networkError,
          message = "Error fetching supported tokens",
        } = await type.findByName("supported_tokens");

        if (!data) throw new Error(error.message || message);
        if (networkError)
          notify(
            <>
              <header>
                <h3>Network Error!</h3>
              </header>
              <p>Kindly check your network connection</p>
            </>,
            "error"
          );
        setCrypto(Object.keys(data));
      } catch (err) {
        console.error({ err });
      }
    })();
    return type.abort;
  }, []);

  return (
    <div className="content">
      <section id="mainTop">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h3
                className="wow animate__animated fadeInDown"
                data-wow-delay="0.3s"
              >
                {t("P2P Trade")}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section id="lnb">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <ul className="buy_sell clear">
                {trade_types.map((type, key) => (
                  <li
                    key={key}
                    className={activeTradeType === type ? "on" : ""}
                  >
                    <a
                      style={{ userSelect: "none" }}
                      disabled={isLoading}
                      className="text-capitalize cursor-pointer"
                      to="#"
                      onClick={() => !isLoading && onTradeTypeChange(type)}
                    >
                      {type}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="coin_name clear">
                {crypto.map((currency, key) => (
                  <li
                    key={key}
                    style={
                      activeCrypto === currency
                        ? {
                          color: "#FE5194",
                          borderBottom: "2px solid #FE5194",
                        }
                        : {}
                    }
                  >
                    <span
                      className={`text-uppercase cursor-pointer`}
                      onClick={() => !isLoading && onCryptoChange(currency)}
                    >
                      {currency}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="setting">
        <div className="container">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ul
              className=""
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
            >
              {/* FILTER SELECTORS */}
              <li
                className=""
                style={{
                  width: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flexGrow: "1",
                }}
              >
                <p>{t("Currency")}</p>
                <FiatCurrencySelector onChange={onFiatChange} />
              </li>
              <li
                style={{
                  width: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flexGrow: "1",
                }}
              >
                <p>{t("Payment Method")}</p>
                <PaymentMethod onChange={onPaymentMethodChange} />
              </li>
              <li
                style={{
                  width: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flexGrow: "1",
                }}
              >
                <p>{t("Filter")}</p>
                <AdvertType onChange={onAdvertTypeChange} />
              </li>
            </ul>
            <div className="ml-auto mt-auto">
              {/* BUTTONS */}
              <div
                className="d-flex justify-content-end pb-2"
                style={{ alignItems: "baseline", gap: 10, flexWrap: "wrap" }}
              >
                <button
                  className="btn text-muted"
                  type="button"
                  onClick={() => loadData(true)}
                >
                  <small className="">
                    <i className="fa fa-refresh"></i>&nbsp; Refresh
                  </small>
                </button>
                <Link to={routeMap?.createAdvert} className="btn_creat">
                  <i className="fas fa-plus-square"></i>
                  {t("Post advert")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container p-0">
        {user && (
          <div
            className=""
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            {unPublishedCount ? (
              <FormControlLabel
                style={{ position: "relative" }}
                control={
                  <AntSwitch
                    color="default"
                    onChange={() => {
                      setShowPublished(!showPublished);
                    }}
                    /* onChange={({ target }) =>
                  setFormData({
                    type: "published",
                    value: target?.checked,
                  })
                } */
                    inputProps={{ "aria-label": "controlled" }}
                    checked={showPublished}
                  ></AntSwitch>
                }
                label={
                  <>
                    <Badge
                      style={{ position: "absolute", top: -8, right: 0 }}
                      variant="danger"
                    >
                      {unPublishedCount}
                    </Badge>
                    <small>Show Published</small>
                  </>
                }
              ></FormControlLabel>
            ) : null}
          </div>
        )}
        <div id="trade">
          <ul className="tab-content">
            {trade_types.map((type, key) => (
              <li
                key={key}
                className={`tab-pane ${activeTradeType === type ? "active" : ""
                  }`}
              ></li>
            ))}
          </ul>
          {isLoading ? (
            <div
              style={{
                minHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                margin: "0 auto",
              }}
            >
              <Feedback.Loading />
            </div>
          ) : errors ? (
            <div style={{ width: "100%", padding: 30, marginBottom: "auto" }}>
              {" "}
              <Feedback>
                <div
                  style={{
                    minHeight: "20vh",
                    padding: 30,
                    boxShadow: "0 0 0 1px #eee",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <section>
                    <h3 className="h4 text-danger">Network request error!</h3>
                    <p>{errors}</p>
                  </section>
                  <button
                    onClick={() => {
                      loadData(true);
                    }}
                    className="btn btn-primary"
                  >
                    <i className="fas fa-refresh"></i>&nbsp;
                    {t("Reload page")}
                  </button>
                </div>
              </Feedback>
            </div>
          ) : (
            <>
              <RenderData
                data={data}
                loadData={loadData}
                type={activeTradeType}
                crypto={activeCrypto}
                paginator={paginator}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function RenderData({
  data = [],
  loadData = () => null,
  type,
  crypto,
  paginator,
}) {
  // const {
  //   services: { kyc },
  // } = useServiceContextHook();

  // let response = kyc.find

  const { t } = useTranslation();
  const { isOpen, onClose, toggledPayload, onOpen } = useToggler();
  const {
    isOpen: isOpenPublishModal,
    onClose: onClosePublishModal,
    onOpen: onOpenPublishModal,
    toggledPayload: publishModalPayload,
  } = useToggler();
  const {
    count,
    page,
    limit,
    onRowsPerPageChange,
    onPageChange,
    StyledPagination,
  } = paginator;

  const {
    session: { user },
    history,
  } = useServiceContextHook();

  const redirectToEdit = (item) => {
    history.push(`${routeMap?.createAdvert}?id=${item?.id}`);
  };

  return data && data?.length ? (
    <div className="table_container">
      <div className="tab-content">
        <div
          className={"active"}
          role="tabpanel"
          aria-labelledby={`${type}-${crypto}-tab`}
        >
          <div className="">
            <div className=" wow fadeInUp" data-wow-delay="0.6s">
              <table>
                <thead>
                  <tr>
                    <th className="user text-center">{t("Publisher")}</th>
                    <th className="price text-center">{t("Price")}</th>
                    <th className="order_limit text-center">
                      {t("Available & Limited")}
                    </th>
                    <th className="payment text-center">{t("Payment")}</th>
                    <th className="action text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((advert, key) => (
                    <tr key={key}>
                      <td className="user">
                        <div className="user__card">
                          <span
                            className={`type-${String(
                              advert?.type
                            )?.toLowerCase()} user__initials`}
                          >
                            {advert?.user?.profile?.pname.charAt(0)}
                          </span>
                          <span className="username">
                            {advert?.user?.profile?.pname}
                            {advert?.user?.verified ? (
                              <i
                                className="fas fa-check-circle verify-badge"
                                aria-hidden="true"
                              ></i>
                            ) : null}
                          </span>
                        </div>
                        <ul className="divider_list" style={{ marginLeft: 35 }}>
                          {advert?.total_orders ? (
                            <li className="truncate list_item">
                              <Link
                                // target="_blank"
                                className="external-link"
                                to={`${routeMap?.order}?advert_id=${advert?.id}`}
                              >
                                <span className="">{advert?.total_orders}</span>{" "}
                                {advert?.total_orders > 1 ? "orders" : "order"}
                              </Link>
                            </li>
                          ) : null}
                          {advert?.total_orders ? (
                            <li className="truncate list_item">
                              <span
                                title={`${Number(
                                  advert?.total_completed_orders /
                                  advert?.total_orders
                                ).toPrecision(2) * 100
                                  } completion rate`}
                                className=""
                              >
                                {(
                                  Number(
                                    advert?.total_completed_orders /
                                    advert?.total_orders
                                  ).toPrecision(2) * 100
                                ).toFixed(2)}
                                %
                              </span>
                            </li>
                          ) : null}
                          <li className="list_item">
                            <span className="text-muted">
                              <Moment fromNow date={advert?.createdAt} />
                            </span>
                          </li>
                          {!advert.published && (
                            <li className="truncate list_item text-danger">
                              <i className="fas fa-exclamation-circle"></i>
                              &nbsp;Draft
                            </li>
                          )}
                        </ul>
                      </td>
                      <td className="price text-uppercase text-center">
                        {/*   {(item?.price)
                            .toFixed(2)
                            .replace(/(\d)(?=(\d{3})+\b)/g, "$1,")}{" "} */}
                        {numeral(advert?.price).format(`0,0[.]00`)}{" "}
                        <small className="text-uppercase">{advert?.fiat}</small>
                      </td>
                      {/* ORDER LIMITS */}
                      <td className="order_limit">
                        <ul className="limit__item" style={{ width: "100%" }}>
                          <li
                            style={{
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              justifyContent: "space-between",
                              width: "100%",
                              gap: 30,
                            }}
                          >
                            <span>{t("Available")}</span>
                            <div
                              className="text-uppercase text-right "
                              style={{ fontWeight: "500", flex: "1" }}
                            >
                              <span>{
                                parseInt(advert?.available_qty) > 0 ?
                                  (numeral(advert?.available_qty).format(
                                    "0,0[.]00"
                                  )) : (advert?.available_qty)}
                                {/* {numeral(advert?.total_qty).format(
                                  "0,0[.]00"
                                )} */}
                              </span>
                              &nbsp;
                              <small>{advert?.crypto}</small>
                            </div>
                          </li>
                          <li
                            style={{
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              justifyContent: "space-between",
                              width: "100%",
                              display: "inline-flex",
                              gap: 30,
                            }}
                          >
                            <span>{t("Limit")} </span>
                            <div>
                              <span
                                className="text-right"
                                style={{
                                  marginLeft: "35px",
                                  fontWeight: "500",
                                }}
                              >
                                <span>
                                  {/*  {(item?.min_order_qty)
                                      .toFixed(2)
                                      .replace(
                                        /(\d)(?=(\d{3})+\b)/g,
                                        "$1,"
                                      )}{" "}
                                    -{" "}
                                    {(item?.max_order_qty)
                                      .toFixed(2)
                                      .replace(
                                        /(\d)(?=(\d{3})+\b)/g,
                                        "$1,"
                                      )}{" "} */}
                                  {numeral(advert?.min_order_qty).format(
                                    "0,0[.]00"
                                  )}{" "}
                                  -{" "}
                                  {numeral(advert?.max_order_qty).format(
                                    "0,0[.]00"
                                  )}
                                </span>
                                &nbsp;
                                <small>{advert?.fiat}</small>
                              </span>
                            </div>
                          </li>
                        </ul>
                      </td>
                      {/* PAYMENT */}
                      <td className="payment text-center">
                        <ul className="payment__list">
                          {advert?.payment_methods.map((pm, key) =>
                            typeof pm == "string" ? (
                              <li key={key}>
                                {payment_methods[String(pm)?.toUpperCase()] &&
                                  payment_methods[String(pm)?.toUpperCase()]
                                    .icon ? (
                                  <Image
                                    className="icon"
                                    src={
                                      payment_methods[String(pm)?.toUpperCase()]
                                        .icon
                                    }
                                    alt={`${String(pm)?.toUpperCase()} icon`}
                                  />
                                ) : null}
                              </li>
                            ) : null
                          )}
                        </ul>
                      </td>
                      {/* ACTION */}
                      <td className="action">
                        {!advert.published ? (
                          <button
                            type="button"
                            className="btn__publish"
                            onClick={() => onOpenPublishModal(advert)}
                          >
                            Publish
                          </button>
                        ) : user && advert?.user?.id == user?.id ? (
                          <button
                            type="button"
                            className="btn__order"
                            onClick={() => {
                              redirectToEdit(advert);
                            }}
                          >
                            Edit
                          </button>
                        ) : (
                          <Button
                            type="button"
                            className="btn__order text-capitalize font-bold"
                            onClick={() => onOpen(advert)}
                          >
                            {String(advert?.type).toLowerCase() === "buy"
                              ? "Sell"
                              : "Buy"}{" "}
                            &nbsp;
                            <span className="text-uppercase">
                              {advert?.crypto}
                            </span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <StyledPagination
              style={{ alignItems: "center" }}
              component="div"
              count={count}
              page={page}
              onPageChange={onPageChange}
              rowsPerPage={limit || 10}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </div>
        </div>
      </div>
      {isOpenPublishModal ? (
        <PublishAdvert
          {...{
            loadData,
            data: publishModalPayload,
            isOpen: isOpenPublishModal,
            onClose: onClosePublishModal,
          }}
        />
      ) : null}
      {isOpen ? (
        <OfferDetail {...{ data: toggledPayload, isOpen, onClose }} />
      ) : null}
    </div>
  ) : (
    <div style={{ width: "100%", padding: 30, marginBottom: "auto" }}>
      <Feedback>
        <div
          style={{
            minHeight: "20vh",
            padding: 30,
            boxShadow: "0 0 0 1px #eee",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <section>
            <h3 className="h4">Oh Snap!</h3>
            <p>
              We could not find any advert for your selection. Kindly Check back
              later
            </p>
          </section>
          <Link to={routeMap?.createAdvert} className="btn btn-primary">
            <i className="fas fa-plus-square"></i>&nbsp;
            {t("Post advert")}
          </Link>
        </div>
      </Feedback>
    </div>
  );
}

function OfferDetail({ data = null, isOpen, onClose }) {
  const {
    services: { advert, order, coingecko },
    history,
    session: { user },
  } = useServiceContextHook();
  const { t } = useTranslation();

  const default_timer = 30; //Default timeout

  const cryptoID = {
    BTC: "bitcoin",
    ETH: "ethereum",
    BNB: "oec-binance-coin",
    XRP: "ripple",
  };

  // STATES
  const [timer, setTimer] = useState(default_timer);
  const [advertData, setAdvertData] = useState(data);
  const [isLoading, setIsLoading] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qty, setQty] = useState({ fiat: 0, crypto: 0 });
  const [errors, setErrors] = useState(null);
  const [cryptoCurrentPrice, setCryptoCurrentPrice] = useState(0);

  // FUNCTIONS
  /**
   * @description Form validation function
   * @returns
   */
  function validate() {
    const newErrors = {};
    const { min_order_qty, max_order_qty, user_id, fiat } = advertData;

    if (qty !== null) {
      if (!isBetween(qty.fiat, min_order_qty, max_order_qty)) {
        newErrors.fiat = `Amount of ${fiat} must be between ${min_order_qty} and ${max_order_qty} ${String(
          fiat
        )?.toUpperCase()}`;
      }
    }

    // console.log(user && user?.id, user_id);
    if (user && user?.id === user_id) {
      newErrors.permission = `You cannot place an order on your advert`;
    }

    setErrors(newErrors);
    return !Object.keys(newErrors)?.length;
  }

  function setRealDataPrice(data) {
    const curreObj = data;
    if (curreObj) {
      const fiatObj = Object.values(curreObj);
      const thValue = fiatObj[0];
      if (thValue) {
        const acCurrent = Object.values(thValue);
        setCryptoCurrentPrice(acCurrent ? acCurrent[0] : 1);
      }
    }
  }

  /**
   * @description refetches the advert data from the server
   */
  async function refreshAdvert() {
    try {
      setIsLoading(true);
      var currentCrypto = data?.crypto;
      let price_data = await coingecko?.cryptoVsFiatPrice(
        cryptoID[currentCrypto],
        data?.fiat
      );
      if (price_data?.data) {
        setRealDataPrice(price_data?.data);
      }
      let response = await advert.findByID(data?.id, {
        where: { type: String(data?.type)?.toUpperCase() },
      });
      if (response?.data) {
        setAdvertData(response?.data);
        setQty({
          fiat: response?.data?.min_order_qty,
          crypto: response?.data?.min_order_qty / response?.data?.price,
        });
        setTimer(default_timer);
      } else if (response.error) {
        throw new Error(
          response.message || "Request error! No data received. Reload page"
        );
      }
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   *@description Check if value is between min and max
   * @param {Number} value
   * @param {Number} min
   * @param {Number} max
   * @returns
   */

  /**
   * @description Handles form submission event
   * @param {Object} e Event object
   */
  async function onSubmit(e) {
    e.preventDefault();
    if (validate()) {
      // let query = objectToQuery({ id: data?.id });
      // history.push("/advert/ORD-1637538341856");
      try {
        setIsSubmitting(true);
        let response = await order.create({
          advert_id: advertData?.id,
          total_amount: qty.fiat,
          total_quantity: qty.crypto,
        });

        const { data, message, error } = response;

        if (!data) {
          throw new Error(error?.message || message || `Error placing order`);
        }

        notify("Order has been placed successfully!");
        history.push(routeMap?.order + `/${data?.id}`);
      } catch (err) {
        notify(err.message, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  /**
   * @description Handles fiat value change event
   * @param {Object} e Event object
   * @param {Object} e.target
   */
  function onFiatChange(value) {
    const { price } = advertData;
    setQty((state) => ({ ...state, fiat: value, crypto: value / +price }));
  }

  /**
   * @description handles crypto value change event
   * @param {Object} e Event object
   */
  function onCryptoChange(value) {
    const { price } = advertData;
    setQty((state) => ({ ...state, crypto: value, fiat: value * +price }));
  }

  // WATCHERS
  useEffect(() => validate(), [qty]);

  useEffect(() => {
    data && refreshAdvert();
    return advert.abort;
  }, []);

  // TIMER
  useEffect(() => {
    let timeout = null;
    if (timer && data && isOpen) {
      timeout = setTimeout(async () => {
        setTimer(timer - 1);
      }, 1000);
    } else refreshAdvert();
    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen, timer]);

  return (
    <div style={{ padding: 15 }}>
      <div style={{ position: "relative" }}>
        <Modal show={isOpen} onHide={onClose} centered size="xl">
          <Modal.Body
            style={{ padding: 15, borderRadius: 8, background: "white" }}
          >
            {advertData ? (
              <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
                {/* INFORMATION */}
                <div
                  style={{
                    flex: "1",
                    minWidth: 300,
                  }}
                >
                  {/* HEADER */}
                  <MiscContainer>
                    <div
                      className=""
                      style={{
                        // borderBottom: "1px groove #e3e3e3",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        marginBottom: 15,
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <Badge
                          variant={
                            String(advertData?.type)?.toLowerCase() == "buy"
                              ? "success"
                              : "danger"
                          }
                        >
                          {advertData?.type}ER
                        </Badge>
                        <div
                          style={{
                            gap: 10,
                            display: "flex",
                            flexWrap: "wrap",
                            marginTop: 8,
                            alignItems: "baseline",
                          }}
                        >
                          <span className="h4" style={{ color: "#FE5194" }}>
                            {advertData?.user?.profile?.pname}
                          </span>
                          <span>
                            {advertData?.user?.verified ? (
                              <i
                                className="fas fa-check-circle"
                                style={{ color: "#85c4f9" }}
                                aria-hidden="true"
                              ></i>
                            ) : null}
                          </span>
                        </div>

                        <ul className="divider_list">
                          <li className="list_item">
                            {(
                              advertData?.total_orders &&
                              Number(
                                advertData?.total_completed_orders /
                                advertData?.total_orders
                              ).toPrecision(2) * 100
                            ).toFixed(2)}
                            %{" "}
                            <spam className="text-muted">
                              {t("completion rate")}
                            </spam>
                          </li>
                          <li className="list_item">
                            Posted{" "}
                            <Moment fromNow>{advertData?.createdAt}</Moment>
                          </li>
                        </ul>
                      </div>

                      <ul>
                        <li className="d-flex align-items-center">
                          <small
                            className="truncate text-muted"
                            title={`Advert ID: ${advertData?.id} `}
                            style={{ maxWidth: 150 }}
                          >
                            {advertData?.id}
                          </small>{" "}
                          <CopyToClipboard
                            text={advertData?.id}
                            onCopy={() => notify("Copied")}
                          >
                            <button
                              type="button"
                              className="btn"
                              style={{ fontSize: 12 }}
                            >
                              <>{t("Copy")}</>
                            </button>
                          </CopyToClipboard>
                        </li>
                      </ul>
                    </div>
                  </MiscContainer>

                  {/* DESCRIPTION */}
                  <div className="description" style={{ padding: 15 }}>
                    <ul
                      style={{
                        display: "flex",
                        rowGap: 10,
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* TOTAL ORDERS */}
                      <li
                        className=""
                        style={{
                          flex: "1",
                          minWidth: "50%",
                          maxWidth: "45%",
                        }}
                      >
                        <small className="descr-title">
                          {t("Total orders")}
                        </small>
                        <span className="d-block">
                          {advertData?.total_orders}
                        </span>
                      </li>
                      {/* TOTAL COMPLETED */}
                      <li
                        className=""
                        style={{
                          flex: "1",
                          minWidth: "50%",
                          maxWidth: "45%",
                        }}
                      >
                        <small className="descr-title">
                          {t("Completed orders")}
                        </small>
                        <span className="d-block">
                          {advertData?.total_completed_orders}
                        </span>
                      </li>
                      {/* PRICE */}
                      <li
                        className=""
                        style={{
                          flex: "1",
                          minWidth: "50%",
                          maxWidth: "45%",
                        }}
                      >
                        <small className="descr-title">{t("Price")}</small>
                        <span className="d-block">
                          {advertData?.price} {/* {cryptoCurrentPrice}{" "} */}
                          <small className="text-muted text-uppercase">
                            {advertData?.fiat}/{advertData?.crypto}
                          </small>
                        </span>
                      </li>
                      {/* AVAILABLE */}
                      <li
                        className=""
                        style={{
                          flex: "1",
                          minWidth: "50%",
                          maxWidth: "45%",
                        }}
                      >
                        <small className="descr-title">{t("Available")}</small>
                        <span className="d-block">
                          {advertData?.total_qty}{" "}
                          <small className="text-muted text-uppercase">
                            {advertData?.crypto}
                          </small>
                        </span>
                      </li>
                      {/* TIME LIMIT */}
                      <li
                        className=""
                        style={{
                          flex: "1",
                          minWidth: "50%",
                          maxWidth: "45%",
                        }}
                      >
                        <small className="descr-title">{t("Time limit")}</small>
                        <span className="d-block">
                          {+advertData?.payment_ttl_mins == -1
                            ? 90
                            : +advertData?.payment_ttl_mins}{" "}
                          <small className="text-muted">minute(s)</small>
                        </span>
                      </li>
                      {/* ORDER LIMIT */}
                      <li
                        className=""
                        style={{
                          flex: "1",
                          minWidth: "50%",
                          maxWidth: "45%",
                        }}
                      >
                        <small className="descr-title">
                          {t("Order limit")}
                        </small>
                        <span className="d-block">
                          {advertData?.min_order_qty} -{" "}
                          {advertData?.max_order_qty}{" "}
                          {/* <small className="text-muted">{advertData?.fiat}</sma> */}
                        </span>
                      </li>
                      {/* PAYMENT METHODS */}
                      <li
                        className=""
                        style={{
                          flex: "1",
                          minWidth: "50%",
                          maxWidth: "45%",
                        }}
                      >
                        <small className="descr-title">
                          {t("Payment methods")}
                        </small>
                        <ul className="d-flex" style={{ gap: 10 }}>
                          {advertData?.payment_methods &&
                            Object.entries(advertData?.payment_methods)?.map(
                              ([key, value]) => {
                                return (
                                  <li className="text-capitalize" key={key}>
                                    <span>
                                      {String(value).replace(/_/g, " ")}
                                    </span>
                                  </li>
                                );
                              }
                            )}
                        </ul>
                      </li>
                      {/* REFRESH TIME */}
                      <li
                        className=""
                        style={{
                          flex: "1",
                          minWidth: "50%",
                          maxWidth: "45%",
                        }}
                      >
                        <small className="descr-title">
                          {t("Remaining time")}
                        </small>
                        <span className="d-block">
                          {timer}
                          <small className="text-muted">s</small>
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* MISCELLENEOUS */}
                  <div
                    style={{ paddingLeft: 15, fontSize: 12, paddingRight: 15 }}
                  >
                    <Alert variant="warning">
                      <strong className="font-bold">TIPS &amp; GUIDES</strong>
                      <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Blanditiis fuga adipisci delectus fugit quam enim,
                        praesentium consequatur provident dolore ullam totam
                        officia architecto obcaecati deleniti quas ea atque unde
                        quae.
                      </p>
                    </Alert>
                  </div>
                </div>

                {/* FORM */}
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 300,
                  }}
                >
                  <Form
                    onSubmit={onSubmit}
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        // padding: 15,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {/* CRYPTO QTY */}
                      <div
                        style={{
                          order:
                            String(advertData?.type)?.toLowerCase() === "sell"
                              ? 3
                              : 1,
                          display: "flex",
                          gap: 8,
                          flexDirection: "column",
                        }}
                      >
                        <label>
                          {advertData?.type == "BUY"
                            ? "I will send"
                            : "I will receive"}
                        </label>
                        <FieldGroup>
                          <NumbericInput
                            attributes={{
                              required: true,
                              className: "field__input",
                              placeholder: `Amount of ${String(
                                advertData?.crypto
                              )?.toUpperCase()}`,
                            }}
                            onChange={onCryptoChange}
                            defaultValue={qty.crypto}
                          />

                          <span className="field__addon">
                            {String(advertData?.crypto)?.toUpperCase()}
                          </span>
                        </FieldGroup>
                      </div>
                      {/* IMAGE */}
                      <div
                        style={{ order: 2 }}
                        className="d-flex justify-content-center"
                      >
                        <Image
                          src={conversion}
                          style={{ width: 25 }}
                          alt="conversion"
                        />
                      </div>
                      {/* FIAT QTY */}
                      <div
                        style={{
                          order:
                            String(advertData?.type)?.toLowerCase() === "sell"
                              ? 1
                              : 3,
                          display: "flex",
                          gap: 8,
                          flexDirection: "column",
                        }}
                      >
                        <label>
                          {String(advertData?.type).toLowerCase() == "buy"
                            ? "I will receive"
                            : "I will pay"}
                        </label>
                        <FieldGroup>
                          <NumbericInput
                            attributes={{
                              required: true,
                              className: "field__input",
                              placeholder: `Amount in ${advertData?.fiat}`,
                            }}
                            onChange={onFiatChange}
                            // min={advertData?.min_order_qty}
                            // max={advertData?.max_order_qty}
                            defaultValue={qty.fiat}
                          />
                          <span className="field__addon">
                            {String(advertData?.fiat)?.toUpperCase()}
                          </span>
                        </FieldGroup>
                        <small className="text-danger">
                          {errors && errors?.qty}
                        </small>
                      </div>
                    </div>
                    <ul className="" style={{ padding: 15 }}>
                      {errors &&
                        Object.values(errors)?.map((error, idx) => (
                          <li key={idx}>
                            <small className="text-danger">{error}</small>
                          </li>
                        ))}
                    </ul>
                    <MiscContainer>
                      {/* TRADE CONDITION */}
                      {advertData?.trade_conditions && (
                        <div className="misc">
                          <header className="header">
                            <h4 className="title">Trade conditions</h4>
                          </header>
                          <div className="description">
                            {advertData?.trade_conditions}
                          </div>
                        </div>
                      )}
                      {/* REMARK */}
                      {advertData?.remarks && (
                        <div className="misc">
                          <header className="header">
                            <h4 className="title">Remarks</h4>
                          </header>
                          <div className="description">
                            {advertData?.remarks}
                          </div>
                        </div>
                      )}
                    </MiscContainer>
                    <div
                      className="d-flex"
                      style={{
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 20,
                        padding: "15px 0 0",
                      }}
                    >
                      {user ? (
                        <button
                          type="submit"
                          disabled={
                            !errors ||
                            Object.keys(errors)?.length ||
                            isSubmitting
                          }
                          className="btn btn-primary pinkbtn"
                          style={{
                            flex: "auto",
                            fontWeight: "500",
                            padding: "12px 25px",
                          }}
                        >
                          {isSubmitting ? t("Placing Order") : t(`Place order`)}{" "}
                          (
                          {String(advertData?.type).toLowerCase() === "sell"
                            ? "Buy"
                            : "Sell"}
                          )
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary pinkbtn"
                          style={{ padding: "12px 25px" }}
                          onClick={() =>
                            history.push({
                              pathname: routeMap?.login,
                              state: {
                                pathname: routeMap?.advert,
                                state: { id: advertData?.id },
                              },
                            })
                          }
                        >
                          Login to place order
                        </button>
                      )}
                      <button
                        className="btn advert_cancel_btn"
                        onClick={onClose}
                        style={{ opacity: 0.5 }}
                      >
                        {t("Cancel")}
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            ) : null}
            {isLoading ? (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(250, 250,250,.75)",
                  zIndex: "2",
                  margin: "0 auto",
                }}
              >
                <Feedback.Loading />
              </div>
            ) : null}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

function PublishAdvert({ data, loadData, isOpen, onClose }) {
  const {
    services: { advert },
  } = useServiceContextHook();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * @function publishDate
   */
  async function publishData() {
    try {
      setIsLoading(true);
      let {
        data: dt,
        error,
        message = "Encountered error while updating advert",
      } = await advert.updateByID(data?.id, { published: true });
      if (!dt) throw new Error(error?.message || message);
      notify(
        <>
          Advert <code>{data?.id}</code> is now published!
        </>
      );
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsLoading(false);
      loadData(true);
    }
  }
  return (
    <>
      <Modal show={isOpen} onHide={onClose} centered>
        <Modal.Body style={{ padding: "30px 15px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 15 }}>
            <i
              style={{ fontSize: 45, color: "rgb(255, 186, 96)" }}
              className="fas fa-exclamation-circle"
            ></i>
            <div>
              <h4 className="h5 mb-2 font-bold">
                Are you sure you want to continue?
              </h4>
              <p className="font-normal">
                Publishing this advert <code>{data?.id}</code> will make it
                visible to the public
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={publishData}
            disabled={isLoading}
            className="btn btn-primary mr-2"
            style={{ minWidth: 70, padding: "8px 25px" }}
          >
            {isLoading ? <Loader /> : "Yes, Publish"}
          </button>
          <button disabled={isLoading} onClick={onClose}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
