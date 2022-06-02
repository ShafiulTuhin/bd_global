import React, { useState, useEffect, useReducer, useRef } from "react";
import "./advert.style.css";
import { Multiselect } from "multiselect-react-dropdown";
import { isBetween } from "../../../../_helpers";
import { useLocation } from "react-router-dom";
// COMPONENTS
import FiatCurrencySelector from "../../../_shared/components/input/FiatCurrencySelector.component";
import CryptoCurrencySelector from "../../../_shared/components/input/CryptoCurrencySelector.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { notify } from "../../../../_helpers/notify";
import { routeMap } from "../../routes";
import { Alert } from "react-bootstrap";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import useQuery from "../../../../_hooks/query.hook";
import {
  StyledSwitch,
  StyledPriceInput,
  WizardForm,
  Cage,
  StyledTabParent,
  StyledSelector,
  AntSwitch,
  FieldGroup,
} from "../../../_shared/components/styled.component";
import numeral from "numeral";
import { NumbericInput } from "../../components/NumbericInput";
// import BTCPrice from "../../components/input/BTCPrice.component";

// APP CONSTANTS
const ADVERT_TYPE = { SELL: "sell", BUY: "buy" };
const PRICE_TYPE = { FLOAT: "floating", FIXED: "fixed" };
const QTY_CONSTRAINTS = {
  KRW: {
    min: 5000,
    max: 10000000,
  },
  JPY: {
    min: 15,
    max: 750000,
  },
  USD: {
    min: 2,
    max: 7500,
  },
  EUR: {
    min: 5,
    max: 8000,
  },
  CNY: {
    min: 10,
    max: 50000,
  },
};
// Wizard configurations
const wizards = [
  {
    label: "Set Type and price",
    index: 1,
    content: SetPriceAndType,
  },
  {
    label: "Set up trading amount and Payment Method",
    index: 2,
    content: SetQuantityAndPayment,
  },
  {
    label: "Set remarks and Automatic response",
    index: 3,
    content: SetRemarksAndResponse,
  },
];

/* const con_ids = {
    BTC: "bitcoin",
    ETH: "ethereum",
    BNB: "binancecoin",
    XRP: "ripple",
    USDT: "tether",
  }; */

const stepTrack = [false, false, false];

function formReducer(state, { type, value }) {
  // console.log({ type, value });
  switch (type) {
    case "type": {
      return { ...state, type: value, fiat: "", crypto: "" };
    }
    case "fiat": {
      return { ...state, fiat: value };
    }
    case "crypto": {
      return { ...state, crypto: value };
    }
    case "price": {
      return { ...state, price: value };
    }
    case "market_price": {
      return { ...state, market_price: value };
    }
    case "published": {
      return { ...state, published: value };
    }
    case "total_qty": {
      return { ...state, total_qty: value };
    }
    case "available_qty": {
      return { ...state, available_qty: value };
    }
    case "available_qty": {
      return { ...state, available_qty: value };
    }
    case "min_order_qty": {
      return { ...state, min_order_qty: value };
    }
    case "max_order_qty": {
      return { ...state, max_order_qty: value };
    }
    case "payment_methods": {
      return { ...state, payment_methods: value };
    }
    case "floating_price_margin": {
      return { ...state, floating_price_margin: value };
    }
    case "auto_reply_message": {
      return { ...state, auto_reply_message: value };
    }
    case "counter_party_conditions": {
      return {
        ...state,
        counter_party_conditions: value,
      };
    }
    case "remarks": {
      return { ...state, remarks: value };
    }

    default: {
      return state;
    }
  }
}

const initialData = {
  payment_ttl_mins: 90,
  total_qty: 1,
  available_qty: 1,
  type: "buy",
  fiat: "",
  crypto: "",
  price: 1,
  market_price: null,
  floating_price_margin: 100,
  auto_reply_message: "",
  payment_methods: [],
  min_order_qty: 0,
  max_order_qty: 0,
  published: true,
  counter_party_conditions: {
    requires_kyc_id: false,
  },
  auto_reply_message: "",
  remarks: "",
};

/**
 *
 * @param {Object} props
 * @param {Object} props.attributes
 * @param {Boolean} props.disabled
 * @param {Function} props.onChange
 * @returns
 */
function PriceInput({
  attributes = {},
  disabled = false,
  onChange = () => null,
  newPrice = 0,
  actualPrice = 0,
  isFloat = false,
}) {
  const [floatVal, setfloatVal] = useState(100);

  function onValueChange({ target }) {
    let update = numeral(target?.value).value();

    if (Number.isNaN(update)) {
      update = 0;
      target.value = 0;
      return;
    }

    if (isFloat) {
      setfloatVal(Number(update));
      const updateVal = (update / 100) * actualPrice;
      onChange(updateVal, update);
    } else {
      onChange(update, update);
    }
  }

  function increment() {
    const step = isFloat ? 1 : 1;
    const new_val = floatVal + step;

    if (isFloat) {
      setfloatVal(new_val);
      if (!disabled) {
        let update = (new_val / 100) * actualPrice;
        onChange(new_val, new_val);
      }
    } else {
      if (!disabled) {
        let update = (+newPrice + step).toFixed(2);
        // let update = ( + step).toFixed(2);
        onChange(update, floatVal);
      }
    }
  }

  function decrement() {
    const step = isFloat ? 1 : 1;
    const new_val = floatVal - step;

    if (isFloat) {
      setfloatVal(new_val);
      if (!disabled && floatVal > 0) {
        let update = (floatVal / 100) * actualPrice;
        onChange(update, new_val);
      }
    } else {
      if (!disabled) {
        let update = (+newPrice - step).toFixed(2);
        onChange(update, floatVal);
      }
    }
  }

  return (
    <StyledPriceInput>
      <button type="button" onClick={decrement}>
        -
      </button>
      <input
        {...attributes}
        disabled={disabled}
        type="text"
        // value={newprice}
        value={
          isFloat
            ? numeral(floatVal).format("0,0[.]00")
            : numeral(newPrice).format("0,0.00")
        }
        onChange={onValueChange}
      />
      {isFloat ? <div type="button"> %</div> : null}
      <button type="button" onClick={increment}>
        +
      </button>
    </StyledPriceInput>
  );
}

/**
 * @description Renders the create advert page
 * @function CreateAdvertPage
 * @returns
 */
export default function CreateAdvertPage() {
  const {
    services: { advert },
    history,
  } = useServiceContextHook();

  const { id, next } = useQuery();

  const [formData, setFormData] = useReducer(formReducer, initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(async () => {
    try {
      if (id) {
        let { data, error, message } = await advert.findByID(id);

        if (data) {
          const { result } = data;

          // data.forEach((item) => {
          setFormData({ type: "type", value: data.type.toLowerCase() });
          setFormData({ type: "fiat", value: data.fiat });
          setFormData({ type: "crypto", value: data.crypto });
          setFormData({ type: "price", value: data.price });
          setFormData({
            type: "auto_reply_message",
            value: data.auto_reply_message,
          });
          setFormData({ type: "market_price", value: data.market_price });
          setFormData({ type: "min_order_qty", value: data.min_order_qty });
          setFormData({ type: "max_order_qty", value: data.max_order_qty });
          setFormData({ type: "published", value: data.published });
          setFormData({ type: "available_qty", value: data.available_qty });
          setFormData({
            type: "payment_methods",
            value: data.payment_methods,
          });
          setFormData({
            type: "floating_price_margin",
            value: data.floating_price_margin,
          });
          setFormData({
            type: "counter_party_conditions",
            value: data.counter_party_conditions,
          });
          setFormData({ type: "remarks", value: data.remarks });
          setFormData({ type: "total_qty", value: data?.total_qty });
          // });

          // forEach

          // setFormData()
        }

        if (error) throw new Error(message);
      }
    } catch (e) {
      console.log(e);
    }
  }, [id]);

  async function onCreateAdvert() {
    try {
      setIsLoading(true);

      if (id) {
        const params = {
          published: formData?.published,
          min_order_qty: formData?.min_order_qty,
          max_order_qty: formData?.max_order_qty,
          payment_methods: formData?.payment_methods,
          price: formData?.price,
          total_qty: formData?.total_qty,
          available_qty: formData?.available_qty,
          crypto: formData?.crypto,
          fiat: formData?.fiat,
          payment_ttl_mins: formData?.payment_ttl_mins,
          floating_price_margin: formData?.floating_price_margin,
          remarks: formData?.remarks,
          auto_reply_message: formData?.auto_reply_message,
          counter_party_conditions: formData?.counter_party_conditions,
        };

        let { message, data, error } = await advert.updateByID(id, params);

        if (!data)
          throw new Error(
            error?.message || message || "Cannot update advert! Unknown error"
          );
        notify("Advert updated successfully!");
        history.push({
          pathname: routeMap?.advert,
        });
      } else {
        let { data, error, message } = await advert?.create(formData);
        if (!data)
          throw new Error(
            error?.message || message || "Cannot create advert! Unknown error"
          );

        stepTrack[0] = false;
        stepTrack[1] = false;
        stepTrack[2] = false;
        notify("Advert created successfully!");
        history.push({
          pathname: routeMap?.advert,
        });
      }
    } catch (err) {
      notify(err?.message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  const [progressCount, setProgressCount] = useState(1);

  function nextProgress() {
    if (progressCount < wizards.length) setProgressCount(progressCount + 1);
    if (progressCount >= wizards.length) {
      onCreateAdvert();
    }
  }

  function prevProgress() {
    if (progressCount > 1) setProgressCount(progressCount - 1);
  }

  return (
    <div className="content">
      {/* Top */}
      <section id="mainTop">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h3
                className="wow animate__animated fadeInDown"
                data-wow-delay="0.3s"
              >
                Post advertisement
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Create ad wizard*/}
      <div style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="container" style={{ maxWidth: 650 }}>
          <div
            className="d-flex justify-content-center"
            style={{ width: "100%", padding: 30 }}
          >
            <div className="mx-auto p-0">
              <div className="timeline-title">
                <h3 className="h3 text-center">Post Trade advertisement</h3>
              </div>
            </div>
          </div>
          {/* Wizard Forms */}
          <div>
            {/* TIMELINE */}
            <div className="d-flex justify-content-center mt-5">
              <ul className="timeline my-timeline">
                {Object.values(wizards).map((wizard, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      // console.log(stepTrack)
                      // console.log(wizard?.index)
                      if (
                        wizard?.index == 2 &&
                        stepTrack[wizard?.index - 2] == true
                      ) {
                        setProgressCount(wizard?.index);
                      } else if (
                        wizard?.index == 3 &&
                        stepTrack[wizard?.index - 2] == true &&
                        stepTrack[wizard?.index - 3] == true
                      ) {
                        setProgressCount(wizard?.index);
                      } else if (
                        wizard?.index == 1 &&
                        stepTrack[wizard?.index - 1] == true
                      ) {
                        setProgressCount(wizard?.index);
                      }
                    }}
                    className={`${progressCount == wizard?.index ? "active" : ""
                      } text-capitalize`}
                  >
                    <small>{wizard?.label}</small>
                  </li>
                ))}
              </ul>
            </div>

            {/* FORM CONTENTS */}
            <div
              className=""
              style={{
                margin: "60px auto",
                width: "100%",
                background: "white",
                padding: 30,
                borderRadius: 8,
              }}
            >
              <StyledTabParent>
                {Object.values(wizards).map((wizard) => (
                  <section
                    hidden={wizard.index !== progressCount}
                    key={wizard?.index}
                  >
                    <wizard.content
                      {...{
                        next: nextProgress,
                        setFormData,
                        formData,
                        prev: prevProgress,
                      }}
                    />
                  </section>
                ))}
              </StyledTabParent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @function SetPriceAndType
 * @param {Object} props
 * @returns
 */
function SetPriceAndType({ next, prev, setFormData, formData }) {
  const {
    services: { type, market },
  } = useServiceContextHook();

  const [priceType, setPriceType] = useState(PRICE_TYPE?.FIXED);
  const [allCrypto, setAllCrypto] = useState({});
  const [allFiat, setAllFiat] = useState({});
  const [floatPercent, setFloatPercent] = useState(100);
  const [errors, setErrors] = useState();
  const [fixedFloat, setFixedFlot] = useState(100);
  const [isLatestPrice, setIsLatestPrice] = useState(false);
  const location = useLocation()


  useEffect(() => {
    async function supportedFiat() {
      try {
        let { data } = await type.findByName("supported_fiat");
        if (!data) throw new Error(`Cannot fetch supported fiat`);
        return setAllFiat(data);
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    async function supportedCrypto() {
      try {
        let { data } = await type.findByName("supported_tokens");
        if (!data) throw new Error(`Cannot fetch supported tokens`);
        setAllCrypto(data);
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    supportedCrypto();
    supportedFiat();
  }, []);

  const intervalId = useRef();

  // WATCH - Crypto or fiat input changes
  useEffect(async () => {
    try {
      if (formData?.crypto && formData.fiat) {
        const { data, error, message } = await market?.coinmarketcap({
          symbol: formData?.crypto,
          convert: formData?.fiat,
        });

        if (!data)
          throw new Error(error.message || message || "Network error!");

        setRealDataPrice(data.data, true);
        // clearInterval(intervalId.current);
        /*  intervalId.current = setInterval(async () => {
          const { data, error, message } = await market?.coinmarketcap({
            "symbol" : formData?.crypto,
            "convert" : formData?.fiat
          });
          
          if (!data){
            throw new Error(error.message || message || "Network error!");
          }

          setRealDataPrice(data.data)
        }, 3000); */
        // return () => clearInterval(intervalId.current);
      }
    } catch (err) {
      console.error(err);
      setErrors((state) => ({ ...state, network: err.message }));
    }

    return () => {
      market.abort();
    };
  }, [formData?.crypto, formData?.fiat]);

  useEffect(() => {
    if (location?.state?.type === "sell") {
      setFormData({ type: "type", value: "sell" })
      return window.history.replaceState({}, "")
    }
  }, [])


  useEffect(async () => {
    if (formData?.market_price);
    updatePrice(formData?.market_price);
  }, [
    formData?.crypto,
    formData?.fiat,
    priceType,
    formData?.floating_price_margin,
    formData?.market_price,
  ]);

  function setRealDataPrice(data, isUpdate) {
    const curreObj = data;
    if (curreObj) {
      const fiatObj = Object.values(curreObj);
      const thValue = fiatObj[0];
      if (thValue) {
        const quote = Object.values(thValue.quote)[0];
        const acCurrent = quote.price;

        if (isUpdate) {
          setIsLatestPrice(true);
        }
        setFormData({
          type: "market_price",
          value: acCurrent ? acCurrent : 1,
        });
      }
    }
  }

  function updatePrice(price) {
    if (priceType == "floating") {
      price = (price * formData?.floating_price_margin) / 100;
      setFormData({ type: "price", value: price });
    } else {
      if (formData?.crypto && formData.fiat && isLatestPrice) {
        setIsLatestPrice(false);
        setFormData({
          type: "price",
          value: price,
        });
      }
    }
  }
  function isValid() {
    const errors = {};

    if (!formData?.crypto) {
      errors.crypto = "Crypto cannot be empty";
    }
    if (!formData?.fiat) {
      errors.fiat = "Fiat cannot be empty";
    }
    if (formData?.price <= 0) {
      errors.price = "Price cannot be zero";
    }
    if (priceType == "floating") {
      if (floatPercent < 80 || floatPercent > 120) {
        errors.floating_price_margin =
          "Price is not zeroFloating price margin should be between 80% to 120%";
      }
    }
    if (formData?.market_price === null)
      errors.market_price = `Missing market price data`;

    setErrors(errors);
    return Boolean(!Object?.keys(errors)?.length);
  }
  useEffect(() => {
    if (isValid()) {
      stepTrack[0] = true;
    } else {
      stepTrack[0] = false;
    }
  }, [formData?.crypto, formData?.fiat, formData?.price, priceType]);

  function onPriceChange({ currentTarget }) {
    setPriceType(currentTarget?.value);
  }

  function onPriceInputChange(e, f) {
    setFormData({ type: "price", value: e });
    setFormData({ type: "floating_price_margin", value: f });
    setFloatPercent(f);
    if (e <= 0) {
      setErrors("Price is not zero");
    }
  }

  function validateAndContinue() {
    if (isValid()) {
      stepTrack[0] = true;
    }
    isValid() && next();
  }
  useEffect(() => {
    isValid();
  }, [formData]);

  return (
    <>
      <WizardForm>
        {errors?.network && (
          <Alert
            style={{
              background: "#fe6666",
              color: "white",
              display: "flex",
              gap: 5,
              alignItems: "flex-start",
            }}
          >
            <i className="fas fa-exclamation-circle"></i>&nbsp;
            <div>
              <header>
                <h3 className="h6 font-bold">Encountered error</h3>
              </header>
              <p>Check your network connection!. </p>
              <p>
                <i className="">{errors?.network}</i>
              </p>
            </div>
          </Alert>
        )}
        <Cage>
          {/* SELECT ADVERT TYPE */}
          <StyledSwitch title="Select advert type">
            {Object.entries(ADVERT_TYPE)?.map(([key, value], index) => (
              <label
                className="switch-part"
                htmlFor={key}
                key={`${key}-${index}`}
              >
                <input
                  type="radio"
                  value={value}
                  checked={formData?.type === value}
                  onChange={() => setFormData({ type: "type", value })}
                  id={key}
                  name="type"
                />
                <span className="text-capitalize">{value}</span>
              </label>
            ))}
          </StyledSwitch>
          <div className="row">
            <div className="col-md-6">
              <Cage>
                <dl>Asset</dl>
                <StyledSelector>
                  <CryptoCurrencySelector
                    attributes={{ value: formData?.crypto }}
                    onChange={(value) => {
                      setFormData({ type: "crypto", value });
                    }}
                  />
                </StyledSelector>
                <small className="text-danger">
                  {errors && errors?.crypto}
                </small>
              </Cage>
            </div>

            <div className="col-md-6">
              <Cage>
                <dl>With Fiat</dl>
                <StyledSelector>
                  <FiatCurrencySelector
                    attributes={{ value: formData?.fiat }}
                    onChange={(value) => {
                      setFormData({ type: "fiat", value });
                    }}
                  />
                </StyledSelector>
                <small className="text-danger">
                  {" "}
                  {errors && errors?.fiat}{" "}
                </small>
              </Cage>
            </div>
          </div>
        </Cage>

        {/* Price settings */}
        <Cage style={{ gap: 10, marginTop: 12 }}>
          <p className=" text-muted">Price Type</p>
          <StyledSwitch>
            {Object.entries(PRICE_TYPE)?.map(([key, value], index) => (
              <label
                className="switch-part"
                htmlFor={key}
                key={`${key}-${index}`}
              >
                <input
                  disabled={formData.market_price === null}
                  type="radio"
                  defaultValue={value}
                  checked={priceType === value}
                  onChange={onPriceChange}
                  id={key}
                  name="price-type"
                />
                <span className="text-capitalize">{value}</span>
              </label>
            ))}
          </StyledSwitch>
          {formData.market_price !== null && (
            <>
              <div className="row">
                {priceType == PRICE_TYPE.FLOAT ? (
                  <div className="col-md-6">
                    {/* Floating price */}
                    <Cage>
                      <p className=" text-muted">Floating Price Margin</p>
                      <PriceInput
                        disabled={priceType !== PRICE_TYPE.FLOAT}
                        onChange={(e, f) => {
                          onPriceInputChange(e, f);
                        }}
                        //onFloatChange={(e) => { setfloatVal(e) }}
                        newPrice={formData?.price}
                        floatPrice={fixedFloat}
                        actualPrice={formData?.market_price}
                        isFloat={true}
                      />
                      <small className="text-danger">
                        {errors && errors?.floating_price_margin}
                      </small>
                    </Cage>
                  </div>
                ) : (
                  <div className="col-md-6">
                    {/* Fixed price */}
                    <Cage>
                      <p className="text-muted">Fixed Price Margin</p>
                      <PriceInput
                        newPrice={formData?.price}
                        onChange={(e, f) => {
                          onPriceInputChange(e, f);
                        }}
                      />
                      <small className="text-danger">
                        {errors && errors?.price}
                      </small>
                    </Cage>
                  </div>
                )}
              </div>
              <div className="row">
                <div className="col-md-6">
                  <Cage>
                    <dl>Your Price</dl>
                    <dd>
                      {numeral(formData?.price).format("0,0[.]00")}{" "}
                      <small>{formData?.fiat}</small>
                      {/* {initialData.price} */}
                    </dd>
                  </Cage>
                </div>
                <div className="col-md-6">
                  <Cage className="text-right">{/* <BTCPrice /> */}</Cage>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  {formData?.fiat &&
                    formData?.crypto &&
                    formData?.market_price && (
                      <div className="text-xs text-green">
                        1 <small>{formData?.crypto}</small> ={" "}
                        {numeral(formData?.market_price).format("0,0[.]00")}{" "}
                        <small>{formData?.fiat}</small>
                      </div>
                    )}
                </div>
              </div>
            </>
          )}
        </Cage>
        <hr />
        <Cage>
          <div className="d-flex flex-row-reverse justify-content-between">
            <button
              type="button"
              disabled={errors && Object.values(errors).length}
              onClick={validateAndContinue}
              className="d-block next-bn"
            >
              Continue
            </button>
          </div>
        </Cage>
      </WizardForm>
    </>
  );
}

/**
 * @function SetTradingAmountAndPayment
 * @param {Object} props
 * @returns
 */
function SetQuantityAndPayment({ next, prev, setFormData, formData }) {
  const [errors, setErrors] = useState();

  const {
    session,
    services: { profile, user },
  } = useServiceContextHook();

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (session?.user)
      (async () => {
        try {
          // Set user data only if the data does not already exist. User will have to reload the page to get new data
          if (!userData) {
            let { data, error } = await fetchUserData();
            if (error) throw new Error(error);
            setUserData(data);
          }
        } catch (error) {
          console.error(error);
        }
      })();
    // abort request on unmount
    return user.abort;
  }, [session]);

  useEffect(() => {
    isValid();
  }, [formData]);

  async function fetchUserData(
    where = {
      user_id: user?.id, // include: ["profile"],
    }
  ) {
    return await profile.find(where);
  }

  const MIN_BTC = 0.001;
  const MIN_ETH = 0.02;
  const MIN_XRP = 5;
  const MIN_BNB = 0.1;
  const MIN_USDT = 10;

  function isValid() {
    const errors = {};

    if (formData?.crypto == "BTC" && formData?.total_qty < MIN_BTC) {
      errors.total_qty = `Total Amount should minimum ${MIN_BTC}`;
    }
    if (formData?.crypto == "ETH" && formData?.total_qty < MIN_ETH) {
      errors.total_qty = `Total Amount should minimum ${MIN_ETH}`;
    }
    if (formData?.crypto == "XRP" && formData?.total_qty < MIN_XRP) {
      errors.total_qty = `Total Amount should minimum ${MIN_XRP}`;
    }
    if (formData?.crypto == "BNB" && formData?.total_qty < MIN_BNB) {
      errors.total_qty = `Total Amount should minimum ${MIN_BNB}`;
    }
    if (formData?.crypto == "USDT" && formData?.total_qty < MIN_USDT) {
      errors.total_qty = `Total Amount should minimum ${MIN_USDT}`;
    }


    if (formData?.total_qty <= 0)
      errors.total_qty = "Total Amount should not be zero";
    if (formData?.total_qty < formData?.min_order_qty / formData?.price)
      errors.total_qty = `Total amount cannot be less than ${numeral(
        formData?.min_order_qty / formData?.price
      ).format("0,0[.]00")}`;

    if (Number(formData?.min_order_qty) >= Number(formData?.max_order_qty)) {
      errors.min_order_qty =
        "Minimum order cannot be greater than or equal to maximum order";
      errors.max_order_qty = "Maximum order cannot be less than or equal to minimum order";
    }

    if (!formData?.payment_methods?.length)
      errors.payment_methods = "Please select payment method";

    let qty_constraint = QTY_CONSTRAINTS[String(formData.fiat)?.toUpperCase()];

     if (qty_constraint && (formData?.min_order_qty < qty_constraint.min)) {
      errors.min_order_qty = `Minimum order limit cannot be less then ${numeral(
        qty_constraint.min
      ).format("0,0[.]00")}`;
    }

    if (qty_constraint && (formData?.max_order_qty > qty_constraint.max)) {
      errors.max_order_qty = `Maximum order limit cannot be greater then ${numeral(
        qty_constraint.max
      ).format("0,0[.]00")}`;
    }

    // if (
    //   qty_constraint &&
    //   !isBetween(
    //     formData?.min_order_qty,
    //     qty_constraint.min,
    //     qty_constraint.max
    //   )
    // ) {
    //   errors.min_order_qty = `Minimum order limit cannot be less then ${numeral(
    //     qty_constraint.min
    //   ).format("0,0[.]00")}`;
    //   errors.max_order_qty = `Maximum order limit cannot be greater then ${numeral(
    //     qty_constraint.max
    //   ).format("0,0[.]00")}`;
    // }

    setErrors(errors);
    return Boolean(!Object.keys(errors)?.length);
  }

  useEffect(() => {
    console.log(isValid());
    if (isValid()) {
      stepTrack[1] = true;
    } else {
      stepTrack[1] = false;
    }
  }, [
    formData?.total_qty,
    formData?.min_order_qty,
    formData?.max_order_qty,
    formData?.payment_methods,
  ]);

  function validateAndContinue() {
    if (isValid()) {
      stepTrack[1] = true;
    }
    isValid() && next();
  }

  const user_payment_methods = userData?.payment_methods;

  const toTitleCase = (phrase) => {
    return phrase
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const paymentMethods = [];
  user_payment_methods &&
    Object.keys(user_payment_methods).map(function (key) {
      const title = toTitleCase(key.replace("_", " "));
      paymentMethods.push({ id: key.toUpperCase(), key: title });
    });

  // console.log([
  //   { id: "BANK_TRANSFER", key: "Bank Transfer" },
  //   { id: "WECHAT", key: "Wechat" },
  //   { id: "ALIPAY", key: "Alipay" },
  // ])

  const defaultPayment = [];

  formData?.payment_methods.map((data) => {
    const title = toTitleCase(data.replace("_", " "));
    defaultPayment.push({ id: data, key: title });
  });

  return (
    <>
      <WizardForm>
        <Cage>
          <dl>Total Amount</dl>
          <FieldGroup>
            <NumbericInput
              attributes={{
                required: true,
                className: "field__input",
                maxLength: 10,
                placeholder: `Enter amount here`,
              }}
              stepValue={0.0000000001}
              onChange={(value) => {
                setFormData({
                  type: "total_qty",
                  value,
                });
                setFormData({
                  type: "available_qty",
                  value,
                });
              }}
              defaultValue={formData?.total_qty}
            />
            <span className="field__addon">{formData.crypto}</span>
          </FieldGroup>
          <small className="text-danger">{errors && errors?.total_qty}</small>
        </Cage>

        {/* Order Limit */}
        <Cage>
          <div className="row">
            <div className="col-md-6">
              <Cage>
                <label htmlFor="">Minimum order limit</label>
                <FieldGroup>
                  <NumbericInput
                    attributes={{
                      required: true,
                      className: "field__input",
                      placeholder: `Enter amount here`,
                    }}
                    onChange={(value) =>
                      setFormData({
                        type: "min_order_qty",
                        value,
                      })
                    }
                    defaultValue={numeral(formData?.min_order_qty).format(
                      "0,0,[.]00"
                    )}
                  />
                  <span className="field__addon">
                    {String(formData.fiat)?.toUpperCase()}
                  </span>
                </FieldGroup>
                <small className="text-danger">
                  {errors && errors.min_order_qty}
                </small>
              </Cage>
            </div>

            <div className="col-md-6">
              <Cage>
                <label htmlFor="">Maximum order limit</label>
                <FieldGroup>
                  <NumbericInput
                    attributes={{
                      required: true,
                      className: "field__input",
                      placeholder: `Enter amount here`,
                    }}
                    onChange={(value) =>
                      setFormData({
                        type: "max_order_qty",
                        value,
                      })
                    }
                    defaultValue={numeral(formData?.max_order_qty).format(
                      "0,0[.]00"
                    )}
                  />
                  <span className="field__addon">
                    {String(formData.fiat)?.toUpperCase()}
                  </span>
                </FieldGroup>
                <small className="text-danger">
                  {errors && errors.max_order_qty}
                </small>
              </Cage>
            </div>
          </div>
        </Cage>
        <hr />
        {/* Payment methods settings */}
        <Cage>
          <div className="row">
            <div className="col-md-6">
              <p className="h5 text-muted">Payment Method</p>
              <p>Select up to 3 method</p>
            </div>
            <div className="col-md-6">
              {/* <button className="float-right btn ">+ADD</button> */}
            </div>
          </div>
          <Multiselect
            displayValue="key"
            isObject={true}
            onKeyPressFn={function noRefCheck() { }}
            selectedValues={defaultPayment}
            hidePlaceholder={(formData.payment_methods).length >= paymentMethods.length ? true : false}
            // displayValue="name"
            onRemove={function noRefCheck(selectedList, selectedItem) {
              setFormData({
                type: "payment_methods",
                value: selectedList?.map(({ id }) => id),
              });
              if (selectedList.length == 0) {
                setErrors((state) => ({
                  ...state,
                  payment_methods: "Please select payment method",
                }));
              }
            }}
            onSearch={function noRefCheck() { }}
            onSelect={function noRefCheck(selectedList, selectedItem) {
              setFormData({
                type: "payment_methods",
                value: selectedList?.map(({ id }) => id),
              });
              if (selectedList.length == 0) {
                setErrors((state) => ({
                  ...state,
                  payment_methods: "Please select payment method",
                }));
              }
            }}
            options={paymentMethods}
            selectionLimit={3}
          />

          <small className="text-danger">
            {errors && errors?.payment_methods}
          </small>
        </Cage>

        <hr />
        <Cage>
          <div className="d-flex flex-row-reverse justify-content-between">
            <button
              type="button"
              onClick={validateAndContinue}
              className="d-block next-bn"
            >
              Continue
            </button>

            <button type="button" onClick={prev} className="btn text-muted">
              Previous
            </button>
          </div>
        </Cage>
      </WizardForm>
    </>
  );
}

// const textAreaStyle = {}
/**
 * @function SetRemarksAndResponse
 * @param {Object} props
 * @returns
 */
function SetRemarksAndResponse({ next, prev, setFormData, formData }) {
  const [errors, setErrors] = useState(null);

  function isValid() {
    const errors = {};

    setErrors(errors);
    return Boolean(!Object.keys(errors).length);
  }

  // const [termErr, setTermErr] = useState("");
  // const [autoReplyErr, setautoReplyErr] = useState("");
  // const [autoRemarksErr, setRemarksErr] = useState("");

  function validateAndContinue() {
    if (isValid()) {
      stepTrack[2] = true;
    }
    isValid() && next();
  }

  return (
    <>
      <WizardForm>
        <Cage>
          <div className="row">
            <div className="col-md-12">
              <Cage>
                <dl>Auto-reply message(Optional)</dl>
                <textarea
                  style={{
                    borderRadius: "5px",
                    padding: 8,
                    border: "1px solid #ededed",
                  }}
                  rows="4"
                  defaultValue={formData?.auto_reply_message}
                  onChange={({ target }) => {
                    setFormData({
                      type: "auto_reply_message",
                      value: target?.value,
                    });
                    isValid();
                  }}
                ></textarea>
                {/* <small className="text-danger">
                  {errors && errors?.auto_reply_message}
                </small> */}
              </Cage>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <Cage>
                <dl>Remarks(Optional)</dl>
                <textarea
                  style={{
                    borderRadius: "4px",
                    padding: 8,
                    border: "1px solid #ededed",
                  }}
                  rows="4"
                  defaultValue={formData?.remarks}
                  onChange={({ target }) => {
                    setFormData({ type: "remarks", value: target?.value });
                    isValid();
                  }}
                ></textarea>
                {/* <small className="text-danger">
                  {errors && errors?.remarks}
                </small> */}
              </Cage>
            </div>
          </div>
        </Cage>

        {/*Counter party terms setting */}
        <Cage>
          <div>
            <p className="mt-4 text-muted">Counterparty conditions</p>
          </div>

          {/* {console.log(formData?.counter_party_conditions.requires_kyc_id)} */}

          <div className="form-check">
            <input
              checked={formData?.counter_party_conditions?.requires_kyc_id}
              className="form-check-input"
              type="checkbox"
              id="requires_kyc_id"
              onChange={({ target }) =>
                setFormData({
                  type: "counter_party_conditions",
                  value: { requires_kyc_id: target?.checked },
                })
              }
            />
            <label className="form-check-label" htmlFor="requires_kyc_id">
              Completed KYC
            </label>
          </div>
          {/* <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="registration_date"
              onChange={({ target }) =>
                setFormData({
                  type: "counter_party_conditions",
                  value: { recent_u: target?.checked },
                })
              }
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              Registarted 0 day(s) ago
            </label>
          </div> */}
          {/* <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="holding-more-ID"
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              Holding more than 0.01 BTC
            </label>
          </div> */}
        </Cage>

        <hr />
        <Cage>
          <div className="d-flex flex-row-reverse justify-content-between">
            <div style={{ display: "inline-flex", gap: 10 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <AntSwitch
                      color="default"
                      onChange={({ target }) =>
                        setFormData({
                          type: "published",
                          value: target?.checked,
                        })
                      }
                      inputProps={{ "aria-label": "controlled" }}
                      checked={formData?.published}
                    ></AntSwitch>
                  }
                  label="Publish"
                ></FormControlLabel>
              </FormGroup>
              <button
                type="button"
                disabled={errors && Object.values(errors).length}
                onClick={validateAndContinue}
                className="d-block next-bn"
              >
                Finish
              </button>
            </div>

            <button type="button" onClick={prev} className="btn btn-default">
              Previous
            </button>
          </div>
        </Cage>
      </WizardForm>
    </>
  );
}
