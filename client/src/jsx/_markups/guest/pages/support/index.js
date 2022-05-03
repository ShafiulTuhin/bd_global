import React, { useEffect, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import "./support.style.scss";

import { useTranslation } from "react-i18next";
import { Link } from "@mui/material";
import { routeMap } from "../../routes.js";
import { generatePath, useHistory } from "react-router-dom";
import SupportBanner from "./component/SupportBanner.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import Feedback from "../../../_shared/components/Feedback.component";

// function ToggleButtonGroupControlled() {
//   const [value, setValue] = useState([1, 3]);

//   /*
//    * The second argument that will be passed to
//    * `handleChange` from `ToggleButtonGroup`
//    * is the SyntheticEvent object, but we are
//    * not using it in this example so we will omit it.
//    */
//   const handleChange = (val) => setValue(val);

//   return (
//     <ToggleButtonGroup type="switch" value={value} onChange={handleChange}>
//       <ToggleButton id="tbg-btn-1" value={1}>
//         Option 1
//       </ToggleButton>
//       <ToggleButton id="tbg-btn-2" value={2}>
//         Option 2
//       </ToggleButton>
//       <ToggleButton id="tbg-btn-3" value={3}>
//         Option 3
//       </ToggleButton>
//     </ToggleButtonGroup>
//   );
// }

export default function SupportPage() {
  const { t } = useTranslation();
  const history = useHistory();

  const [FAQ, setFAQ] = useState([]);
  const [userGuides, setUserGuides] = useState([]);
  const [frequentlyAskedQuestions, setFrequentlyAskedQuestions] =
    useState(null);
  const [onlineCustomer, setOnlineCustomer] = useState(null);
  // Frequently_Asked_Questions

  const {
    services: { faq },
  } = useServiceContextHook();

  // const id = '341f567a-63e9-11ec-90d6-0242ac120003';
  const handleProceed = (id) => {
    id && history.push(generatePath(routeMap?.supportByID, { id }));
  };

  async function fetchUserData(filter = { limit: 50 }) {
    let allFAQ = null;
    try {
      let { data, error } = await faq.findall(filter);
      if (error) throw new Error(error);

      allFAQ = data.result;
      if (data?.result) {
        setFAQ(data.result);
      }
    } catch (error) {
      console.error(error);
    }

    console.log(FAQ);

    let all_online_customer = [];
    allFAQ &&
      allFAQ.map((val) => {
        if (val.category == "Online Customer Center Information") {
          all_online_customer.push(val);
        }
      });
    setOnlineCustomer(all_online_customer);

    let all_user_guides = [];
    allFAQ &&
      allFAQ.map((val) => {
        if (val.category == "User Guide") {
          all_user_guides.push(val);
        }
      });

    let all_Frequently_Asked_Questions = [];
    allFAQ &&
      allFAQ.map((val) => {
        if (val.category == "Frequently Asked Questions") {
          all_Frequently_Asked_Questions.push(val);
        }
      });

    const user_guides = all_user_guides.reduce(function (r, a) {
      r[a.subcategory] = r[a.subcategory] || [];
      r[a.subcategory].push(a);
      return r;
    }, Object.create(null));
    setUserGuides(user_guides);

    const frequently_Asked_Questions = all_Frequently_Asked_Questions.reduce(
      function (r, a) {
        r[a.subcategory] = r[a.subcategory] || [];
        r[a.subcategory].push(a);
        return r;
      },
      Object.create(null)
    );
    setFrequentlyAskedQuestions(frequently_Asked_Questions);
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  const maxShow = 2;

  // SEARCH COMPONENT
  const [textState, setTextState] = useState("");
  const getSuggestions = (value, FAQ) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : FAQ?.filter((obj) => {
          return Object.keys(obj).reduce((acc, curr) => {
            return acc || obj["question"].toLowerCase().includes(inputValue);
          }, false);
        });
  };

  const completions = FAQ && getSuggestions(textState, FAQ);
  const onSuggetionClick = (v) => {
    setTextState(v.question);
    let id = v?.id;
    id && history.push(generatePath(routeMap?.supportByID, { id }));
  };

  return (
    <div className="content">
      <SupportBanner {...{ setTextState, onSuggetionClick, completions }} />
      {/* <div className="support-banner" id="support">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col col-sm-12 col-md-6 d-flex justify-content-center">
              <div className="support-search-input w-100">
                <label
                  htmlFor="searchInput"
                  className="d-flex justify-content-center font-weight-bold"
                >
                  <h4>{t("Search your questions.")}</h4>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">
                      <i className="fas fa-search"></i>
                    </span>
                  </div>
                  <input
                    style={{ color: "black" }}
                    type="text"
                    className="form-control"
                    placeholder={t("search")}
                    aria-label="search"
                    aria-describedby="basic-addon1"
                    value={textState}
                    onChange={(e) => setTextState(e.target.value)}
                  />
                </div>
                {completions && completions.length != 0 ? (
                  <div id="result">
                    <ul>
                      {completions &&
                        completions.map((val, index) =>
                          index < 5 ? (
                            <li
                              key={index}
                              className={"font-weight-bold cursor-pointer"}
                              onClick={() => {
                                onSuggetionClick(val);
                              }}
                              key={index}
                            >
                              {val.question}
                            </li>
                          ) : null
                        )}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div> */}
      {FAQ && FAQ?.length ? (
        <div>
          {onlineCustomer && onlineCustomer?.length ? (
            <section className="py-5">
              <div className="container-fluid">
                <div className="container">
                  <div className="customer-center">
                    <h5 className="customer-center-title font-weight-bold mb-5">
                      Online Customer Center Information
                    </h5>
                    {onlineCustomer &&
                      Object.entries(onlineCustomer).map(
                        ([key, value], index) => {
                          // console.log(index)
                          return (
                            <>
                              <div
                                key={key}
                                className={key >= maxShow ? " hidden-li" : ""}
                              >
                                <Link
                                  className={
                                    "customer-center-content font-weight-bold mb-0 cursor-pointer"
                                  }
                                  to="#"
                                  onClick={() => {
                                    handleProceed(value.id);
                                  }}
                                >
                                  {value.question}
                                </Link>
                                <hr className="mt-0 mb-4" />
                              </div>
                            </>
                          );
                        }
                      )}

                    {onlineCustomer && onlineCustomer.length > maxShow ? (
                      <label
                        onClick={(e) => {
                          let b =
                            e.target.parentNode.getElementsByTagName("DIV");
                          if (e.target.classList.contains("see-more")) {
                            for (let i = 0; i < b.length; i++) {
                              if (b[i].classList.contains("hidden-li")) {
                                b[i].classList.remove("hidden-li");
                              }
                            }
                            e.target.classList.remove("see-more");
                            e.target.classList.add("show-less");
                            e.target.innerHTML = "- Less";
                          } else {
                            for (let i = 0; i < b.length; i++) {
                              if (i >= maxShow) {
                                b[i].classList.add("hidden-li");
                              }
                            }
                            e.target.classList.add("see-more");
                            e.target.classList.remove("show-less");
                            e.target.innerHTML = "+ More";
                          }
                        }}
                        className="more see-more cursor-pointer"
                      >
                        {" "}
                        + More
                      </label>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {userGuides && Object.keys(userGuides)?.length ? (
            <section className="py-5">
              <div className="container-fluid">
                <div className="container">
                  <div className="user-guide">
                    <div className="user-guide-title mb-3">
                      <h5 className="font-weight-bold">User Guide</h5>
                    </div>
                    <div className="row py-3">
                      {userGuides &&
                        Object.entries(userGuides).map(([key, value]) => {
                          return (
                            <>
                              <div
                                key={key}
                                className="col col-sm-12 col-md-4 my-text mb-5"
                              >
                                <h5 className="text-left font-weight-bold">
                                  {key}
                                </h5>
                                <ul className="navbar-nav">
                                  {value.map((val, key) => {
                                    return (
                                      <>
                                        <li
                                          key={key}
                                          className={
                                            "nav-item" +
                                            (key >= maxShow ? " hidden-li" : "")
                                          }
                                        >
                                          <Link
                                            className="nav-link d-flex align-items-center text-black cursor-pointer"
                                            to="#"
                                            onClick={() => {
                                              handleProceed(val.id);
                                            }}
                                          >
                                            {val.question}
                                          </Link>
                                        </li>
                                      </>
                                    );
                                  })}
                                </ul>
                                <label
                                  onClick={(e) => {
                                    let b =
                                      e.target.parentNode.getElementsByTagName(
                                        "LI"
                                      );
                                    if (
                                      e.target.classList.contains("see-more")
                                    ) {
                                      for (let i = 0; i < b.length; i++) {
                                        if (
                                          b[i].classList.contains("hidden-li")
                                        ) {
                                          b[i].classList.remove("hidden-li");
                                        }
                                      }
                                      e.target.classList.remove("see-more");
                                      e.target.classList.add("show-less");
                                      e.target.innerHTML = "- Less";
                                    } else {
                                      for (let i = 0; i < b.length; i++) {
                                        if (i >= maxShow) {
                                          b[i].classList.add("hidden-li");
                                        }
                                      }
                                      e.target.classList.add("see-more");
                                      e.target.classList.remove("show-less");
                                      e.target.innerHTML = "+ More";
                                    }
                                  }}
                                  className="more see-more cursor-pointer"
                                >
                                  {value.length > maxShow ? "+ More" : ""}
                                </label>
                              </div>
                            </>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            ""
          )}

          {frequentlyAskedQuestions &&
          Object.keys(frequentlyAskedQuestions)?.length ? (
            <section className="py-5">
              <div className="container-fluid">
                <div className="container">
                  <div className="user-guide">
                    <div className="user-guide-title mb-3">
                      <h5 className="font-weight-bold">
                        {" "}
                        Frequently Asked Questions{" "}
                      </h5>
                    </div>
                    <div className="row py-3">
                      {frequentlyAskedQuestions &&
                        Object.entries(frequentlyAskedQuestions).map(
                          ([key, value]) => {
                            return (
                              <>
                                <div
                                  key={key}
                                  className="col col-sm-12 col-md-4 my-text mb-5"
                                >
                                  <h5 className="text-left font-weight-bold">
                                    {key}
                                  </h5>
                                  <ul className="navbar-nav">
                                    {value.map((val, key) => {
                                      return (
                                        <>
                                          <li
                                            key={key}
                                            className={
                                              "nav-item" +
                                              (key >= maxShow
                                                ? " hidden-li"
                                                : "")
                                            }
                                          >
                                            <Link
                                              className="nav-link d-flex align-items-center text-black cursor-pointer"
                                              to="#"
                                              onClick={() => {
                                                handleProceed(val.id);
                                              }}
                                            >
                                              {val.question}
                                            </Link>
                                          </li>
                                        </>
                                      );
                                    })}
                                  </ul>
                                  <label
                                    onClick={(e) => {
                                      let b =
                                        e.target.parentNode.getElementsByTagName(
                                          "LI"
                                        );
                                      if (
                                        e.target.classList.contains("see-more")
                                      ) {
                                        for (let i = 0; i < b.length; i++) {
                                          if (
                                            b[i].classList.contains("hidden-li")
                                          ) {
                                            b[i].classList.remove("hidden-li");
                                          }
                                        }
                                        e.target.classList.remove("see-more");
                                        e.target.classList.add("show-less");
                                        e.target.innerHTML = "- Less";
                                      } else {
                                        for (let i = 0; i < b.length; i++) {
                                          if (i >= maxShow) {
                                            b[i].classList.add("hidden-li");
                                          }
                                        }
                                        e.target.classList.add("see-more");
                                        e.target.classList.remove("show-less");
                                        e.target.innerHTML = "+ More";
                                      }
                                    }}
                                    className="more see-more cursor-pointer"
                                  >
                                    {value.length > maxShow ? "+ More" : ""}
                                  </label>
                                </div>
                              </>
                            );
                          }
                        )}

                      {/* <div className="col col-sm-12 col-md-4 my-text">
                    <h5 className="text-left font-weight-bold"> Account </h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I want to recover my Coin TC account.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I can't log in. / The login verification code does not
                          come.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          My mobile phone number has changed.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          to="#"
                        >
                          {" "}
                          + More
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col col-sm-12 col-md-4 my-text">
                    <h5 className="text-left font-weight-bold">
                      Signup / Security Level / Withdrawal
                    </h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          Do I need to have my own mobile phone and account?{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          Is it possible to use the phone in the corporate name?{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          How do I upgrade the security level?{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          to="#"
                        >
                          + More{" "}
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col col-sm-12 col-md-4 my-text">
                    <h5 className="text-left font-weight-bold">
                      Transactions / Assets
                    </h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          Suddenly there was USDT.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          How is the KRW market, BTC market, and USDT market
                          different?
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I have an asset, but I cannot place a buy or sell order.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          + More
                        </Link>
                      </li>
                    </ul>
                  </div> */}
                    </div>
                    {/* <div className="row py-3">
                  <div className="col col-sm-12 col-md-4 mt-5 my-text">
                    <h5 className="text-left font-weight-bold">
                      Deposit / Withdraw in KRW{" "}
                    </h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          Failed to withdraw KRW.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          Failed to deposit KRW.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          How do I deposit KRW into my Coin TC account?{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          to="#"
                        >
                          + More
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col col-sm-12 col-md-4 mt-5 my-text">
                    <h5 className="text-left font-weight-bold">
                      {" "}
                      Digital asset deposit/withdrawal
                    </h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          What is the secondary address?{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          Please tell me how to withdraw digital assets.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          How can I check whether deposits and withdrawals are
                          possible by digital asset?{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          to="#"
                        >
                          {" "}
                          + More{" "}
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col col-sm-12 col-md-4 mt-5 my-text">
                    <h5 className="text-left font-weight-bold">
                      Digital asset misdeposit
                    </h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I made an incorrect withdrawal to another exchange and
                          it was returned.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          You entered the wrong digital asset address.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I made a deposit to the previously deposited address,
                          but it is different from the currently issued deposit
                          address.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          to="#"
                        >
                          + More
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="row py-3">
                  <div className="col col-sm-12 col-md-4 mt-5 my-text">
                    <h5 className="text-left font-weight-bold">Kakao Pay</h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          I want to use Kakao Pay authentication.
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I have completed Kakao Pay verification, but why can't I
                          withdraw money?
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I can't receive Kakao Pay authentication message.
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          to="#"
                        >
                          {" "}
                          + More
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col col-sm-12 col-md-4 mt-5 my-text">
                    <h5 className="text-left font-weight-bold">
                      Terms related to digital assets
                    </h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          What is NFT?
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          What is TXID?{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I'm not familiar with exchange terminology.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          + More
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col col-sm-12 col-md-4 mt-5 my-text">
                    <h5 className="text-left font-weight-bold">
                      Other inquiries
                    </h5>
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          I want to use the Open API.{" "}
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          What is an API?
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          onClick={handleProceed}
                          to="#"
                        >
                          {" "}
                          Is there a feature to keep me logged in?
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link
                          className="nav-link d-flex align-items-center text-black cursor-pointer"
                          to="#"
                        >
                          {" "}
                          + More{" "}
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div> */}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            ""
          )}
        </div>
      ) : (
        <div className="container my-4">
          <Feedback>
            <div
              style={{
                padding: 30,
                boxShadow: "0 0 0 1px #eee",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "white",
              }}
            >
              <section>
                <h3 className="h4 lead">Oh Snap!</h3>
                <p className="font-light">
                  We could not find any questions for your selection. Kindly
                  Check back later
                </p>
              </section>
            </div>
          </Feedback>
        </div>
      )}
    </div>
  );
}
