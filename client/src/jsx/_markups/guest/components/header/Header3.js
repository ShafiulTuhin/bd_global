import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

// HOOKS
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

// ASSETS
import logo_icon from "../../app-assets/images/logo/logo-black.png";
import icon_user_color from "../../app-assets/images/icon/icon_user_color.png";

// HELPERS
import { routeMap } from "../../routes";
import UserMenu from "../userMenu.component";
import { LogoContainer } from "../../../_shared/components/styled.component";
// import useServiceContextHook from "../../../../_hooks/service.context.hook";

export const Header3 = () => {
  const { t } = useTranslation();
  // const {
  //   session: { user },
  // } = useServiceContextHook();
  const cur_loc = window.location.pathname;

  const [menuToggle, setMenuToggle] = useState(false);
  const handleClick = () => {
    setMenuToggle(!menuToggle);
  };

  return (
    <header className="header2 fixed-header">
      <div className="inner d-flex clear">
        <LogoContainer>
          <a href="/">
            <img src={logo_icon} alt-="Gines Global" />
          </a>
        </LogoContainer>
        <nav>
          <h2 className="hidden">메인메뉴</h2>
          <div className="gnb_pc clear">
            <ul className="clear">
              <li
                className={
                  cur_loc === routeMap?.advert ||
                    cur_loc === routeMap?.createOffer ||
                    cur_loc === routeMap?.addPayment
                    ? "on"
                    : ""
                }
              >
                <Link to={routeMap?.advert}>{t("P2P Trade")}</Link>
              </li>
              <li className={cur_loc === "/" ? "on" : ""}>
                <Link to={routeMap?.order}>{t("Orders")}</Link>
              </li>
              <li className={cur_loc === "/wallet" ? "on" : ""}>
                <Link to={routeMap?.wallet}>{t("Wallet")}</Link>
              </li>
              <li className={cur_loc === "/affiliate" ? "on" : ""}>
                <Link to={routeMap?.affiliate}>{t("Affiliate")}</Link>
              </li>
              <li className={cur_loc === "/support" ? "on" : ""}>
                <Link to={routeMap?.support}>{t("Support")}</Link>
              </li>
            </ul>
          </div>
          <UserMenu />

          <div
            className="side_menu"
            style={menuToggle ? { right: "0px" } : { right: "-250px" }}
          >
            <div className="burger_box">
              <div className="menu-icon-container">
                <a
                  href="#"
                  className={
                    "menu-icon js-menu_toggle " +
                    (menuToggle ? "opened" : "closed")
                  }
                  onClick={handleClick}
                >
                  <span className="menu-icon_box">
                    <span className="menu-icon_line menu-icon_line--1"></span>
                    <span className="menu-icon_line menu-icon_line--2"></span>
                    <span className="menu-icon_line menu-icon_line--3"></span>
                  </span>
                </a>
              </div>
            </div>
            <div className="user_m">
              <Link to={routeMap?.me}>
                <img src={icon_user_color} alt="My page" />
                <p>{t("My page")}</p>
              </Link>
            </div>
            <div className="gnb_m">
              <ul className="clear">
                <li>
                  <Link to={routeMap?.advert}>{t("P2P Trade")}</Link>
                </li>
                <li>
                  <Link to={routeMap?.order}>{t("Orders")}</Link>
                </li>
                <li>
                  <Link to={routeMap?.wallet}>{t("Wallet")}</Link>
                </li>
                <li>
                  <Link to={routeMap?.affiliate}>{t("Affiliate")}</Link>
                </li>
                <li>
                  <Link to={routeMap?.support}>{t("Support")}</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
