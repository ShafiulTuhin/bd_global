import React, { useEffect } from "react";
import { Col, Container, Row, ListGroup, Dropdown } from "react-bootstrap";
// import './footer.scss';

import twitter_icon from "../../app-assets/images/icon/twitter.png";
import instagram_icon from "../../app-assets/images/icon/instagram.png";
import medium_icon from "../../app-assets/images/icon/medium.png";
import google_play_icon from "../../app-assets/images/icon/google-play.png";
import apple_icon from "../../app-assets/images/icon/apple.png";
import global_icon from "../../app-assets/images/icon/global.png";
import LanguageSelector from "../../../_shared/components/input/Language.component";

import { useTranslation } from "react-i18next";
import i18next from "i18next";
import cookies from "js-cookie";
import { FieldGroup } from "../../../_shared/components/styled.component";

export const Footer = () => {
  const currentLanguageCode = cookies.get("i18next") || "en";

  const { t, i18n, ready } = useTranslation();

  function onChangeLanguage(language) {
    i18next.changeLanguage(language);
  }

  return (
    <footer className="page-footer font-small blue">
      <div className="container-fluid text-center text-md-left">
        <div className="container wow fadeInLeft">
          <div className="row">
            <div className="col-md-2 mt-md-0 mt-3">
              <h4 className="text-left">{t("Gines Global")}</h4>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    <img src={twitter_icon} className="pr-2 w-auto" />
                    {t("Twitter")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    <img src={instagram_icon} className="pr-2 w-auto" />
                    {t("Instagram")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    <img src={medium_icon} className="pr-2 w-auto" />
                    {t("Medium")}
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-4 mt-md-0 mt-3 d-none d-md-block"></div>
            <div className="col-md-2 mt-md-0 mt-3">
              <h5 className="text-left">{t("Company")}</h5>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("About")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Careers")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Press")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Center")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Prime")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Ventures")}
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-2 mt-md-0 mt-3">
              <h5 className="text-left">{t("Resources")}</h5>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("APIs")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Status")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Open Source")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Research")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Legal & Privacy")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Wallet Support")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Exchange Support")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Blog")}
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-2 mt-md-0 mt-3">
              <h5 className="text-left">{t("Products")}</h5>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Wallet")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Exchange")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Explorer")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Institutional")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Learn")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Prices")}
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link d-flex align-items-center" href="#">
                    {t("Charts")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-5"
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 15,
            }}
          >
            <div>
              <FieldGroup>
                <div className="addon__field p-2">
                  <img src={global_icon} />
                </div>

                <LanguageSelector
                  attributes={{
                    className: "input__field px-4",
                    id: "change-language",
                    name: "change-language",
                  }}
                />
              </FieldGroup>
            </div>

            <div className="">
              <a
                href="#"
                className="btn btn-lg btn-brand float-left mr-3 clearfix mb-2 mb-md-0"
              >
                <div className="google-play-icon pr-2 float-left">
                  <img src={google_play_icon} className="w-auto" />
                </div>
                <div className="google-play-content float-right">
                  <p className="mb-0 text-left border-0 pt-0">
                    {t("Download on the")} <br />{" "}
                    <strong>{t("Google Store")}</strong>
                  </p>
                </div>
              </a>
              <a href="#" className="btn btn-lg btn-brand clearfix float-left">
                <div className="apple-icon pr-2 float-left">
                  <img src={apple_icon} className="w-auto" />
                </div>
                <div className="apple-content float-right">
                  <p className="mb-0 text-left border-0 pt-0">
                    {t("Download on the")} <br />{" "}
                    <strong>{t("App Store")}</strong>
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
