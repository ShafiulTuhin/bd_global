import React from "react";
import "./footer.scss";
// import { Col, Container, Row, ListGroup,Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";


// Multi language
import { useTranslation } from "react-i18next";

export const Footer2 = () => {
  const { t } = useTranslation();
  return (
    <footer className="">
      <div className="container ">
        <div className="row footer">
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.2s"
          >
            <dl>
              <dt>
              <Link to="/advert">{t("P2P Trade")}</Link>
              </dt>
              <dd>
              <Link to="/advert/create">{t("Buy")}</Link>
              </dd>
              <dd>
              <Link to={{ pathname:"/advert/create",state:{type:"sell",replace:true}}}>{t("Sell")}</Link>
              </dd>
            </dl>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.3s"
          >
            <dl>
              <dt>
                <Link to="/order">{t("Order")}</Link>
              </dt>
              <dd>
              <Link to={{ pathname:"/order" ,state:{status:"PENDING",replace:true}}}>{t("In progress")}</Link>
              </dd>
              <dd>
              <Link to="/order">{t("All Orders")}</Link>
              </dd>
            </dl>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.4s"
          >
            <dl>
              <dt>
                <Link to="/wallet">{t("Wallet")}</Link>
              </dt>
              <dd>
              <Link to="/wallet">{t("Asset")}</Link>
              </dd>
              <dd>
              <Link to={{ pathname: "/wallet", state: { tabname: "History", replace: true }}}>{t("History")}</Link>
              </dd>
            </dl>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.5s"
          >
            <Link to="/affiliate">{t("Affiliate")}</Link>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.6s"
          >
            <Link to="/support">{t("Support")}</Link>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.7s"
          >
            <dl className="sns clear">
              <dt>{t("Community")}</dt>
              <dd className="twitter">
                <Link to="#">{t("order")}</Link>
              </dd>
              <dd className="instagram">
                <Link to="#">{t("Instagram")}</Link>
              </dd>
              <dd className="youtube">
                <Link to="#">{t("Youtube")}</Link>
              </dd>
              <dd className="facebook">
                <Link to="#">{t("Facebook")} </Link>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <hr />
      <div className="col-12">
        <p className="wow animate__animated  fadeInUp" data-wow-delay="0.8s">
          COPYRIGHT.&copy;{new Date().getFullYear()}. Gines Global ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};
