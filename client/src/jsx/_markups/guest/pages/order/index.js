import { useEffect, useState, useCallback } from "react";
import usePaginatorHook from "../../../../_hooks/paginator.hook.js";
import "./order.style.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { Badge, Image } from "react-bootstrap";

import usdt_icon from "../../app-assets/images/coin/usdt.png";
import eth_icon from "../../app-assets/images/coin/eth.png";

import bnb_image from "../../app-assets/images/coin/bnb.png";
import xrp_round_image from "../../app-assets/images/coin/xrp-round.png";
import btc_image from "../../app-assets/images/coin/btc.png";
import OrderType from "../../../_shared/components/input/OrderType.component.jsx";
import CryptoCurrencySelector from "../../../_shared/components/input/CryptoCurrencySelector.component";
import OrderStatus from "../../../_shared/components/input/OrderStatus.component.jsx";

import { useTranslation } from "react-i18next";

import { routeMap } from "../../routes.js";
import useServiceContextHook from "../../../../_hooks/service.context.hook.js";
import Feedback from "../../../_shared/components/Feedback.component.jsx";
import { deepObjectStringify } from "../../../../_helpers/index.js";
// import { notify } from "../../../../_helpers/notify.jsx";
import numeral from "numeral";
import Moment from "react-moment";
import useQuery from "../../../../_hooks/query.hook.js";
import { FieldGroup } from "../../../_shared/components/styled.component.jsx";
import { objectToQuery } from "../../../../_helpers/utils.helper.js";
import { notify } from "../../../../_helpers/notify";
export default function Orders() {
  const { t } = useTranslation();
  const {
    services: { order },
    history,
  } = useServiceContextHook();
  const paginator = usePaginatorHook();
  const { count, page, setCount, limit } = paginator;
  const session = useSelector((state) => state?.session);
  const query = useQuery();
  const orderTab = {
    all: {
      label: t("All orders"),
      value: "all",
    },
    // processing: {
    //   label: t("Processing"),
    //   value: "me",
    //   auth: true,
    // },
  };
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [cachedData, setCachedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCrypto, setActiveCrypto] = useState(null);
  const [activeOrderType, setActiveOrderType] = useState(null);
  const [activeTab, setActiveTab] = useState(Object.keys(orderTab)[0] || null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [activeScope, setActiveScope] = useState(null);

  /**
   * @function buildCachedData
   * @description constructs the cached data
   * @param {String} currency Currency type
   * @param {String} type Trade type
   */
  function buildCacheData(result) {
    return {
      [activeTab]: {
        crypto: activeCrypto,
        status: activeStatus,
        type: activeOrderType,
        scope: activeScope,
        limit,
        result,
        page,
        count,
      },
    };
  }

  function offerScope() {
    switch (activeScope) {
      case "received-orders":
      case "received-order": {
        return {
          user_id: { $not: session?.user?.id },
          "$advert.user_id$": session?.user?.id,
        };
      }

      default: {
        return {
          user_id: session?.user?.id,
        };
      }
    }
  }

  /**
   * @function fetchData
   * @description Makes a network request
   * @returns
   */
  async function fetchData() {
    const filter = await import("../../../../_helpers/index").then(
      ({ queryToObject }) => {
        let searchQuery = queryToObject(window.location.search.substring(1));

        return {
          order: JSON.stringify([
            ["createdAt", "DESC"],
            ["updatedAt", "DESC"],
          ]),
          where: {
            ...(activeStatus && { status: activeStatus }),
            ...(activeCrypto && {
              [`$"advert"."crypto"$`]: activeCrypto,
            }),
            ...(activeOrderType && {
              [`$"advert"."type"$`]: activeOrderType,
            }),
            ...(session && {
              ...(searchQuery &&
                searchQuery?.advert_id && {
                  advert_id: searchQuery?.advert_id,
                }),
              ...offerScope(),
            }),
          },
          // fake: true,
          limit,
          offset: page * limit || 0,
        };
      }
    );

    try {
      let response = await order?.find(filter);

      let {
        data,
        error,
        message = "Encountered error fetching orders",
      } = response;
      if (!data) throw new Error(error.message || message);
      setCount(data?.count);
      // Store new data in cache
      setCachedData((old) => ({ ...old, ...buildCacheData(data?.result) }));
      return response;
    } catch (err) {
      // notify(err.message, "error");
      return { data: { result: null, error: err?.message } };
    }
  }

  /**
   * @description fetches cached data if any, else makes a network request
   * @returns
   */
  async function cacheOrFetch(refresh = false) {
    let item = cachedData[activeTab];
    // if data is not cached, fetch from server
    if (!item || refresh) {
      return fetchData();
    }

    let { result, count, ...old } = item;
    old = deepObjectStringify(old);
    let changed = deepObjectStringify({
      crypto: activeCrypto,
      status: activeStatus,
      type: activeOrderType,
      scope: activeScope,
      limit,
      page,
    });

    // Check that all filters match
    return old === changed ? { data: item } : fetchData();
  }

  const onCryptoChange = (crypto) => {
    setActiveCrypto(crypto);
  };

  const onOrderTypeChange = (type) => {
    setActiveOrderType(type);
  };

  const onStatusChange = (status) => {
    setActiveStatus(status);
  };
  const onScopeChange = (scope) => {
    if (activeScope === scope) return setActiveScope(null);
    return setActiveScope(scope);
  };

  /**
   * @description fetch data on demand
   * @param {Boolean} refresh
   */
  const onDemand = useCallback(
    async (refresh = false) => {
      try {
        setIsLoading(true);
        let {
          data: { result, error },
        } = await cacheOrFetch(refresh);
        !error ? setData(result) : setError(error);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeOrderType,
      activeStatus,
      activeScope,
      page,
      limit,
      activeCrypto,
      activeTab,
    ]
  );

  useEffect(() => {
    onDemand();
  }, [
    page,
    limit,
    onDemand,
    activeStatus,
    activeOrderType,
    activeCrypto,
    activeTab,
    activeScope,
  ]);

  return (
    <>
      <div className="content">
        <section id="mainTop">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h3 className="wow fadeInDown">{t("Orders")}</h3>
              </div>
            </div>
          </div>
        </section>

        {/*    <section id="lnb">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <ul className="option clear">
                  {Object.keys(orderTab).map((name, key) => (
                    <li
                      key={key}
                      className={activeTab === name ? "on text-primary" : ""}
                    >
                      <span
                        className="text-capitalize cursor-pointer"
                        onClick={() => setActiveTab(name)}
                      >
                        {orderTab[name]?.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
 */}
        <section id="setting">
          <div className="container">
            <div className="">
              <div
                className="d-flex justify-content-between flex-wrap"
                style={{ gap: 15 }}
              >
                <div className="d-flex  flex-wrap" style={{ gap: 15 }}>
                  <div className="">
                    <span>{t("Coins")}</span>
                    <CryptoCurrencySelector onChange={onCryptoChange} />
                  </div>
                  <div className="">
                    <span>{t("Type")}</span>
                    <OrderType onChange={onOrderTypeChange} />
                  </div>
                  <div className="">
                    <span>{t("Status")}</span>
                    <OrderStatus onChange={onStatusChange} />
                  </div>
                </div>
                <div
                  className="d-flex justify-content-end pb-2 ml-auto"
                  style={{ flexWrap: "wrap", gap: 15, alignItems: "baseline" }}
                >
                  <button
                    className="px-3 text-muted"
                    onClick={() => onDemand(true)}
                    type="button"
                  >
                    <small>
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
        <div className="container p-0">
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              flexGrow: 0,
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            {query ? (
              <div
                className="mr-auto"
                style={{
                  display: "inline-flex",
                  gap: 4,
                  flexWrap: "wrap",
                  maxWidth: "50%",
                }}
              >
                {Object.entries(query).map(([key, value], idx) => (
                  <Badge
                    key={idx}
                    pill
                    variant="secondary"
                    onClick={() => {
                      let addr = new URL(window.location.origin);
                      let _q = { ...query };
                      delete _q[key];
                      addr.search = objectToQuery(_q);
                      history.push(`/order${addr.search}`);
                    }}
                  >
                    <span ttile="Click to remove">{value}</span>
                  </Badge>
                ))}
              </div>
            ) : null}
            <FieldGroup
              style={{
                background: "#f8f8f8",
                boxShadow:
                  "0 0 1px 1px #88888877, inset 0 0 10px -3px #33333355",
                gap: 10,
                padding: 4,
                border: "none",
              }}
            >
              <button
                onClick={() => onScopeChange(null)}
                className={[
                  "btn btn-sm field__addon px-4 font-normal",
                  activeScope === null && "btn-primary text-white font-bold",
                ].join(" ")}
              >
                My orders
              </button>
              <button
                onClick={() => onScopeChange("received-order")}
                className={[
                  "btn btn-sm field__addon  px-4 font-normal",
                  activeScope === "received-order" &&
                    "btn-primary text-white font-bold",
                ].join(" ")}
              >
                Received orders
              </button>
            </FieldGroup>
          </div>

          <section id="orders">
            <div className="tab-content" style={{ width: "100%" }}>
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
              ) : (
                <>
                  <RenderData
                    onDemand={onDemand}
                    data={data}
                    paginator={paginator}
                  />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function RenderData({ data, paginator, onDemand }) {
  const {
    services: { order },
    history,
    session: { user },
  } = useServiceContextHook();
  const query = useQuery();
  /**
   * @description Sends request ot cancel an order
   * @param {String} id Order ID
   */
  async function handleCancel(id) {
    try {
      let {
        data,
        error,
        message = `Encountered error when cancelling order ${id}`,
      } = await order.updateByID(id, {
        status: "CANCELLED",
      });
      if (!data) throw new Error(error?.message || message);
      onDemand(true);
    } catch (err) {
      notify(err?.message, "error");
    }
  }

  async function handleDelete(id) {
    try {
      let {
        data,
        error,
        message = `Encountered error when deleting order with ${id}`,
      } = await order.removeByID(id, {});

      if (!data) throw new Error(error?.message || message);

      onDemand(true);
    } catch (err) {
      notify(err?.message, "error");
    }
  }

  const { t } = useTranslation();
  const {
    count,
    page,
    limit,
    onRowsPerPageChange,
    onPageChange,
    StyledPagination,
  } = paginator;

  const crypto_methods = {
    USDT: {
      icon: usdt_icon,
    },
    ETH: {
      icon: eth_icon,
    },
    XRP: {
      icon: xrp_round_image,
    },
    BTC: {
      icon: btc_image,
    },
    BNB: {
      icon: bnb_image,
    },
  };

  return data && data?.length ? (
    <div className="wow fadeInUp" data-wow-delay="0.6s">
      <div className={`table_container `}>
        <table>
          <thead>
            <tr>
              <th>{t("Advert")}</th>
              <th className="text-center">{t("Asset")}</th>
              <th>{t("Price")}</th>
              <th>{t("Total")}</th>
              <th>{t("Status")}</th>
              <th>{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((order, key) => (
              <tr
                key={key}
                className={`type-${String(order.advert?.type)?.toLowerCase()}`}
              >
                {/* partner*/}
                <td className="user">
                  <div className="user__card">
                    <span
                      className={`type-${String(
                        order?.advert?.type
                      )?.toLowerCase()} user__initials`}
                    >
                      {order?.advert?.user?.profile?.pname.charAt(0)}
                    </span>
                    <span>
                      {order?.user_id === user?.id ||
                      order?.advert?.user_id === user?.id ? (
                        <Link
                          className="external-link"
                          // target="_blank"
                          to={{ pathname: `${routeMap?.order}/${order?.id}` }}
                        >
                          {order?.advert?.user?.profile?.pname}
                        </Link>
                      ) : (
                        order?.user?.profile?.pname
                      )}
                      {order?.user?.verified ? (
                        <i
                          className="fas fa-check-circle verify-badge"
                          aria-hidden="true"
                        ></i>
                      ) : null}
                    </span>
                  </div>

                  <div style={{ marginLeft: 35 }} title={order?.advert?.id}>
                    <small style={{ maxWidth: 150 }} className="truncate">
                      <code>{order?.advert?.id}</code>
                    </small>
                  </div>
                  <ul className="divider_list" style={{ marginLeft: 35 }}>
                    <li></li>
                    <li className="list_item">
                      <span className="text-muted">
                        <Moment
                          fromNow
                          // format="Do MMM YYYY HH:mm A"
                          date={order?.created_at}
                        />
                      </span>
                    </li>
                  </ul>
                </td>

                {/* asset/type */}
                <td>
                  <div
                    className=""
                    style={{
                      display: "flex",
                      gap: 8,
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div>
                      {crypto_methods[order?.advert?.crypto] &&
                      crypto_methods[order?.advert?.crypto].icon ? (
                        <Image
                          src={crypto_methods[order?.advert?.crypto].icon}
                          style={{ width: 30 }}
                          alt={`icon`}
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-uppercase">{order?.advert?.crypto}</p>
                    </div>
                  </div>
                </td>
                {/* price/quantity */}
                <td className="">
                  <strong>
                    <span>
                      {numeral(order?.advert?.price).format("0,0[.]00")}{" "}
                    </span>
                    <small>{order?.advert?.fiat}</small>
                  </strong>
                </td>
                {/* TOTAL AMOUNT*/}
                <td>
                  <span className="truncate">
                    <span>{order?.total_amount}</span>{" "}
                    <small>{order?.advert?.fiat}</small>
                  </span>
                </td>
                {/* STATUS */}
                <td className="text-uppercase">
                  <Badge variant={StatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </td>

                {/* ACTION */}
                <td>
                  {order?.user_id === user?.id ||
                  order?.advert?.user_id === user?.id ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      {order?.user_id === user?.id && (
                        <>
                          {!["COMPLETED", "DISPUTED", "CANCELLED"].includes(
                            order?.status
                          ) && (
                            <>
                              <button
                                className="px-3 btn btn-primary"
                                onClick={() => {
                                  history.push({
                                    pathname: `${routeMap?.order}/${order?.id}`,
                                  });
                                }}
                              >
                                <i className="fas fa-comment"></i>
                              </button>
                              <button
                                className="btn btn-warning px-3"
                                onClick={() => {
                                  handleCancel(order.id);
                                }}
                              >
                                <i className="fas fa-times-circle text-white"></i>
                              </button>
                            </>
                          )}
                          {!["DISPUTED"].includes(order?.status) && (
                            <button
                              className="btn btn-danger px-3"
                              onClick={() => handleDelete(order?.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
  ) : (
    <div
      style={{
        width: "100%",
        padding: 30,
        marginBottom: "auto",
        flex: "auto",
      }}
    >
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
              We could not find any orders for your selection. Check back later
            </p>
            {query && query?.advert_id ? (
              <small>
                You are searching for your orders made for advert:{" "}
                <code>{query?.advert_id}</code>&nbsp;
              </small>
            ) : null}
          </section>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: "100%",
              gap: 10,
            }}
          >
            <Link to={routeMap?.createAdvert} className="btn btn-primary">
              <i className="fas fa-plus-square"></i>&nbsp;
              {t("Post advert")}
            </Link>
            {query?.advert_id ? (
              <button
                onClick={() => history.push(routeMap.order)}
                className="btn btn-sm btn-danger"
              >
                &times;&nbsp;Clear all search queries
              </button>
            ) : null}
          </div>
        </div>
      </Feedback>
    </div>
  );
}

function StatusVariant(status) {
  status = String(status)?.toLowerCase();
  switch (status) {
    case "pending": {
      return "warning";
    }
    case "completed": {
      return "success";
    }
    case "canceled":
    case "cancelled": {
      return "danger";
    }
    default: {
      return "default";
    }
  }
}
