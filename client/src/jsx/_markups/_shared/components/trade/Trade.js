/**************************************************************************
  // TODO: attach onPaymentMethodChange handler to the payment select input
  // TODO: attach onFiatChange handler to the fiat currency select input
***************************************************************************/

import React, { useEffect, useState, useRef } from "react";
import "./Trade.css";
import {
  Modal,
  Image,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import usePaginatorHook from "../../../../_hooks/paginator.hook.js";

// Assets
import usdt_icon from "../../app-assets/images/icon/usdt.png";
import refresh_icon from "../../app-assets/images/page/creat-ad/refresh.png";
import bank_icon from "../../app-assets/images/icon/bank-icon.png";
import money_icon from "../../app-assets/images/icon/money.png";
import chat_icon from "../../app-assets/images/icon/chat-icon.png";

const TradeModel = function (props) {

  //   setTimeout(function(){
  //     window.location.reload(1);
  //  }, 5000);

  const button_text = props.data?.type + " " + props.data?.crypto.toUpperCase();
  const button_class = "btn_buy text-capitalize";
  const isPopup = true;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Link
        to="#"
        className={button_class}
        onClick={isPopup ? handleShow : undefined}
      >
        {button_text}
      </Link>

      <Modal show={show} onHide={handleClose} size={"xl"}>
        <Modal.Body>
          <div className="row" id="tradeModal">
            <div className="col-sm-12 col-md-6">
              <div className="scroll-area-sm">
                <div className="modal-header align-items-center">
                  <h3 className="modal-title">Bi7752</h3>
                  <p className="mb-0">2270 orders 99.65% completion</p>
                </div>

                <div className="col col-sm-12 col-md-8 mt-3">
                  <div className="trade-my-modal">
                    <div className="my-modal-top d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Trade Info</h5>
                      <a href="#" className="btn btn-ref-my-modal">
                        30s to Refresh
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col col-sm-12 col-md-10 mt-4">
                  <div className="trade-my-modal">
                    <div className="my-modal-center">
                      <table className="w-100">
                        <thead>
                          <th className="text-light-gray font-weight-light">
                            Price
                          </th>
                          <th className="text-light-gray font-weight-light">
                            Available
                          </th>
                        </thead>
                        <tbody>
                          <td className="text-black">47,757.8541 USD</td>
                          <td className="text-black">1.546410 BTC</td>
                        </tbody>
                        <thead>
                          <th className="text-light-gray font-weight-light pt-4">
                            Payment
                          </th>
                          <th className="text-light-gray font-weight-light pt-4">
                            Limit
                          </th>
                        </thead>
                        <tbody>
                          <td className="text-black">60 Minutes</td>
                          <td className="text-black">
                            $50,000.00 ~ $100,000.00
                          </td>
                        </tbody>
                        <thead>
                          <th className="text-light-gray font-weight-light pt-4">
                            Payment Method
                          </th>
                          <th className="text-light-gray font-weight-light pt-4"></th>
                        </thead>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-6">
              <div className="modal-body">
                <div className="modal-body-input">
                  <label>How much do you want to Sell?</label>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Amount.."
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                    />
                    <div className="input-group-append">
                      <span
                        className="input-group-text my-input"
                        id="basic-addon2"
                      >
                        BTC
                      </span>
                    </div>
                  </div>
                  <p className="d-flex justify-content-end text-black">
                    사용 가능 : 0.24810 BTC &nbsp;
                    <span className="text-light-blue"> 전체 </span>{" "}
                  </p>
                </div>
                <div className="modal-body-input">
                  <label>How much do you want to Sell?</label>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Amount.."
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                    />
                    <div className="input-group-append">
                      <span
                        className="input-group-text my-input"
                        id="basic-addon2"
                      >
                        BTC
                      </span>
                    </div>
                  </div>
                  <p className="d-flex justify-content-end text-black">
                    사용 가능 : 0.24810 BTC &nbsp;
                    <span className="text-light-blue"> 전체 </span>{" "}
                  </p>
                  <div className="row ">
                    <div className="col-12">
                      <div className="md-head">Guides</div>
                      <div className="md-dt-txt">
                        1. Please confirm the price and amount before place this
                        trade.
                      </div>
                      <div className="md-dt-txt">
                        2. Please pay the seller in the payment window. After
                        completed the payment, please click "I have paid". The
                        seller will release the crypto to you after received
                        payment. If you do not mark as paid in time, the trade
                        will be automatically cancelled after timeout.
                      </div>
                      <div className="md-dt-txt">
                        3.If you encounter trade dispute, you can open a
                        dispute, the customer service will intervene to deal
                        with it. For details, please see "Help
                      </div>
                    </div>
                  </div>
                  <div className="row justify-content-center mt-5 mb-5">
                    <div className="col-4">
                      {/* <Link to="/order" className="btn btn-primary ">
                        Sell BTC
                      </Link> */}
                    </div>
                    <div className="col-4">
                      <a href="#" className="btn btn-outline-limited btn-cans">
                        Cancel
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const trade_types = ["buy", "sell"];
const crypto = ["btc", "eth", "eos", "xrp", "usdt"];
const fiat = ["btc", "eth", "eos", "xrp", "usdt"];
// TODO: Use this to create dynamic icon for the payment methods
const payment_methods = {
  alipay: {
    icon: money_icon,
  },
  wechat: {
    icon: chat_icon,
  },
};

export const Trade = ({ services }) => {
  const { advert } = services;
  const paginator = usePaginatorHook();
  const { count, page, setCount, limit, Skeleton } = paginator;

  const [cachedData, setCachedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCrypto, setActiveCrypto] = useState(crypto[0]);
  const [activeTradeType, setActiveTradeType] = useState(trade_types[0]);
  const [data, setData] = useState(null);
  const [activeFiat, setActiveFiat] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

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
      },
    };
  }

  /**
   * @function fetchData
   * @description Makes a network request
   * @returns
   */
  async function fetchData() {
    let response = await advert?.find({
      [`where[type]`]: activeTradeType,
      [`where[crypto]`]: activeCrypto,
      ...(activeFiat && { [`where[fiat]`]: activeFiat }),
      ...(paymentMethod && {
        [`where[payment_methods]`]: paymentMethod,
        [`where[payment_methods][_condition]`]: "in",
      }),
      fake: true,
      limit,
      offset: page * limit || 0,
    });

    let {
      data: { result = [], count },
    } = response;
    setCount(count);
    // Store new data in cache
    setCachedData((old) => ({ ...old, ...buildCacheData(result) }));
    return response;
  }

  /**
   * @description fetches cached data if any, else makes a network request
   * @returns
   */
  async function cacheOrFetch() {
    let item = cachedData[`${activeTradeType}/${activeCrypto}`];
    // if data is not cached, fetch from server
    if (!item) {
      return fetchData();
    }

    let { result, count, ...old } = item;
    old = Object.values(old)?.join("");
    let changed = Object.values({
      trade: activeTradeType,
      fiat: activeFiat,
      limit,
      page,
      paymentMethod,
    }).join("");

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

  /**
   * @description handle payment method change
   * @param {String} method
   */
  function onPaymentMethodChange(method) {
    setPaymentMethod(method);
  }

  useEffect(async () => {
    try {
      setIsLoading(true);
      let {
        data: { result },
      } = await cacheOrFetch();

      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(advert?.isFetching);
    }
  }, [page, limit, activeTradeType, paymentMethod, activeCrypto]);




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
                P2P Trade
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
                      className="text-capitalize"
                      href="#"
                      onClick={() => onTradeTypeChange(type)}
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
                    className={activeCrypto === currency ? "on" : ""}
                  >
                    <a
                      className="text-uppercase"
                      href="#"
                      onClick={() => onCryptoChange(currency)}
                    >
                      {currency}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="setting">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <dl className="money">
                <dt>Currency</dt>
                <dd>
                  <select name="" id="">
                    {/* TODO: Reusable component - currencySelectInput */}
                    <option value="CNY">CNY</option>
                    <option value="AED">AED</option>
                    <option value="AMD">AMD</option>
                    <option value="ARS">ARS</option>
                    <option value="AUD">AUD</option>
                    <option value="BDT">BDT</option>
                    <option value="BHD">BHD</option>
                  </select>
                </dd>
              </dl>
              <dl className="method">
                <dt>Payment Method</dt>
                <dd>
                  {/* TODO: Reusable component - paymentTypesSelectInput */}
                  <select name="payment_method" id="payment_method" onChange={changePayment()}>
                    <option value="all_payment">All payments</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="wechat">WeChat</option>
                    <option value="alipay">Alipay</option>
                    <option value="cash_deposit">Cash Deposit to Bank</option>
                  </select>
                </dd>
              </dl>
              <a href="/offer/create" className="btn_creat">
                <i className="fas fa-plus-square"></i>Creat an AD
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="trade">
        <div className="container">
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
                padding: "10px 70px 70px",
                position: "relative",
                overflow: "hidden",
                top: 0,
                width: "100%",
                left: 0,
                height: "100%",
                background: "#ffffffed",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Skeleton style={{ width: "100%", paddingTop: "5%" }} />
              <Skeleton style={{ width: "100%" }} animation="wave" />
              <Skeleton style={{ width: "100%" }} animation={false} />
              <Skeleton style={{ width: "100%" }} animation={"wave"} />
              <Skeleton style={{ width: "100%" }} animation={false} />
              <Skeleton style={{ width: "100%", paddingTop: "5%" }} />
            </div>
          ) : (
            <RenderData
              data={data}
              type={activeTradeType}
              crypto={activeCrypto}
              paginator={paginator}
            />
          )}
        </div>
      </section>
    </div>
  );
};

function RenderData({ data, type, crypto, paginator }) {
  const {
    count,
    page,
    limit,
    onRowsPerPageChange,
    onPageChange,
    StyledPagination,
    Skeleton,
  } = paginator;
  return data && data?.length ? (
    <>
      <div className="tab-content">
        <div
          className={"active"}
          role="tabpanel"
          aria-labelledby={`${type}-${crypto}-tab`}
        >
          <div className="row">
            <div className="col-12">
              <div
                className="table_container wow fadeInUp"
                data-wow-delay="0.6s"
              >
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Available/Limited</th>
                      <th>Payment</th>
                      <th>Price</th>
                      <th>Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, key) => (
                      <tr key={key}>
                        <td className="user">
                          {/* Username */} {/* check-mark */}
                          {/* order count */} {/*98.1% completion */}
                          <p>
                            <span>{item?.user?.pname.charAt(0)}</span>
                            {item?.user?.pname}
                            {item?.user?.verified ? (
                              <i
                                className="fas fa-check-circle"
                                aria-hidden="true"
                              ></i>
                            ) : null}
                          </p>
                          <ul className="clear">
                            <li>
                              <span>{item?.total_orders}</span> order
                            </li>
                            <li>
                              <span>
                                {(
                                  Number(
                                    item?.total_completed_orders /
                                    item?.total_orders
                                  ).toPrecision(2) * 100
                                ).toFixed(2)}
                              </span>
                              % completion
                            </li>
                          </ul>
                        </td>
                        <td className="available_limit">
                          <dl className="available clear">
                            <dt>Available:</dt>
                            <dd>
                              {item?.available_qty}{" "}
                              <span className="text-uppercase">
                                {item?.crypto}
                              </span>
                            </dd>
                          </dl>
                          <dl className="limit clear">
                            <dt>Limit:</dt>
                            <dd>
                              {item?.min_order_price} - {item?.max_order_price}{" "}
                              {item?.fiat}
                            </dd>
                          </dl>
                        </td>
                        <td className="payment">
                          {item?.payment_methods.map((pm, key) =>
                            typeof pm == "string" ? (
                              <span key={key}>
                                {payment_methods[pm] &&
                                  payment_methods[pm].icon ? (
                                  <Image
                                    src={payment_methods[pm].icon}
                                    style={{ width: 25 }}
                                    alt={`${pm} icon`}
                                  />
                                ) : null}
                              </span>
                            ) : null
                          )}
                        </td>
                        <td className="price">
                          {item?.price} {item?.fiat}
                        </td>
                        <td className="transaction">
                          <TradeModel data={item}></TradeModel>
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
              {/* <div className="indicator">
                <button type="button" className="btn_prev" disabled>
                  <i className="fal fa-chevron-left"></i>
                </button>
                <span className="on">1</span>
                <span>2</span>
                <span>3</span>
                <span style={{ cursor: "default" }}>...</span>
                <span>40</span>
                <button type="button" className="btn_next">
                  <i className="fal fa-chevron-right"></i>
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null;
}