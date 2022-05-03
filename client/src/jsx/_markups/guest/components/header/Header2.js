import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import logo_white from "../../app-assets/images/logo/logo-white.png";
import icon_user from "../../app-assets/images/icon/icon_user.png";

import { useTranslation } from "react-i18next";

// HELPERS
import { routeMap } from "../../routes";
import UserMenu from "../userMenu.component";
import { LogoContainer } from "../../../_shared/components/styled.component";

export const Header2 = () => {
  const { t } = useTranslation();

  const session = useSelector((state) => state?.session);
  const cur_loc = window.location.pathname;

  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 100);
    });
  }, []);

  const [menuToggle, setMenuToggle] = useState(false);
  const handleClick = () => {
    setMenuToggle(!menuToggle);
  };

  return (
    <header
      className="header1 fixed-header"
      style={
        scroll
          ? { backgroundColor: "rgba(0,0,0,0.75)" }
          : { backgroundColor: "transparent" }
      }
    >
      <div className="inner d-flex clear">
        <LogoContainer>
          <Link to="/">
            <img src={logo_white} alt-="CoinTC" />
          </Link>
        </LogoContainer>
        <nav>
          <h2 className="hidden">메인메뉴</h2>
          <div className="gnb_pc clear">
            <ul className="clear">
              <li>
                <NavLink
                  activeClassName="on"
                  isActive={(match, location) => match}
                  to={routeMap?.advert}
                >
                  {t("P2P Trade")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={routeMap?.order}
                  activeClassName="on"
                  isActive={(match, location) => match}
                >
                  {t("Orders")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  activeClassName="on"
                  isActive={(match, location) => match}
                  to={routeMap?.wallet}
                >
                  {t("Wallet")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  activeClassName="on"
                  isActive={(match, location) => match}
                  to={routeMap?.affiliate}
                >
                  {t("Affiliate")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  activeClassName="on"
                  isActive={(match, location) => match}
                  to={routeMap?.support}
                >
                  {t("Support")}
                </NavLink>
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
                <Link
                  to="#"
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
                </Link>
              </div>
            </div>
            <div className="user_m">
              <Link to={routeMap?.me}>
                <img src={icon_user} alt="My page" />
                <p>{session?.user?.profile?.pname || t("My page")}</p>
              </Link>
            </div>
            <div className="gnb_m">
              <ul className="clear">
                <li>
                  <Link to={routeMap?.advert}>P2P Trade</Link>
                </li>
                <li>
                  <Link to={routeMap?.order}>Orders</Link>
                </li>
                <li>
                  <Link to={routeMap?.wallet}>Wallet</Link>
                </li>
                <li>
                  <Link to={routeMap?.affiliate}>Affiliate</Link>
                </li>
                <li>
                  <Link to={routeMap?.support}>Support</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
