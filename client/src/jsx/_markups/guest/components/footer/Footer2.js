import React from "react";
import "./footer.scss";
// import { Col, Container, Row, ListGroup,Dropdown } from "react-bootstrap";

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
                <a href="/offer">{t("P2P Trade")}</a>
              </dt>
              <dd>
                <a href="#">{t("Buy")}</a>
              </dd>
              <dd>
                <a href="#">{t("Sell")}</a>
              </dd>
            </dl>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.3s"
          >
            <dl>
              <dt>
                <a href="/order">{t("Order")}</a>
              </dt>
              <dd>
                <a href="#">{t("In progress")}</a>
              </dd>
              <dd>
                <a href="#">{t("All Orders")}</a>
              </dd>
              <dd>
                <a href="#">{t("My Offers")}</a>
              </dd>
            </dl>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.4s"
          >
            <dl>
              <dt>
                <a href="/wallet">{t("Wallet")}</a>
              </dt>
              <dd>
                <a href="#">{t("Asset")}</a>
              </dd>
              <dd>
                <a href="#">{t("History")}</a>
              </dd>
            </dl>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.5s"
          >
            <a href="/affiliate">{t("Affiliate")}</a>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.6s"
          >
            <a href="/support">{t("Support")}</a>
          </div>
          <div
            className="col-lg-2 col-md-4 col-sm-4 wow animate__animated  fadeInLeft"
            data-wow-delay="0.7s"
          >
            <dl className="sns clear">
              <dt>{t("Community")}</dt>
              <dd className="twitter">
                <a href="#">{t("order")}</a>
              </dd>
              <dd className="instagram">
                <a href="#">{t("Instagram")}</a>
              </dd>
              <dd className="youtube">
                <a href="#">{t("Youtube")}</a>
              </dd>
              <dd className="facebook">
                <a href="#">{t("Facebook")} </a>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <hr />
      <div className="col-12">
        <p className="wow animate__animated  fadeInUp" data-wow-delay="0.8s">
          COPYRIGHT. 2021. P2PElim ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};
