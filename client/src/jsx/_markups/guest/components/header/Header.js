import "./header.scss";
import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../app-assets/images/logo/logo.png";

import _actions from "../../../../_actions";

// Multi language
import { useTranslation } from "react-i18next";

// HELPERS
import { routeMap } from "../../routes";
import UserMenu from "../userMenu.component";
import { LogoContainer } from "../../../_shared/components/styled.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";

export const Header = () => {
  const { t } = useTranslation();
  const {
    session: { user },
    services: { auth },
  } = useServiceContextHook();
  const [scroll, setScroll] = useState(false);
  const cur_loc = window.location.pathname;

  const [menuToggle, setMenuToggle] = useState(false);
  const onToggleSideMenu = () => {
    setMenuToggle(!menuToggle);
  };

  const links = [
    { label: "P2P Trade", path: routeMap?.advert },
    { label: "orders", path: routeMap?.order },
    { label: "Wallet", path: routeMap?.wallet },
    { label: "Affiliate", path: routeMap?.affiliate },
    { label: "Support", path: routeMap?.support },
  ];
  useEffect(() => {
    const scrollFn = () => {
      setScroll(window.scrollY > 100);
    };
    window.addEventListener("scroll", scrollFn);

    return () => {
      if (window?.removeEventListener) {
        // For all major browsers, except IE 8 and earlier
        window?.removeEventListener("scroll", scrollFn);
      } else if (window?.detachEvent) {
        // For IE 8 and earlier versions
        window?.detachEvent("scroll", scrollFn);
      }
    };
  }, []);

  return (
    <header
      className={`page_header fixed_header  ${!scroll ? "transparent" : "dark"
        }`}
    >
      <div className="inner container ">
        <LogoContainer>
          <Link to={routeMap?.home}>
            <h1 className="hidden">메인메뉴</h1>
            <img src={logo} alt-="Gines Global" />
          </Link>
        </LogoContainer>
        <nav className="page_header__nav">
          {/* DESKTOP NAV */}
          <div className="desktop_nav">
            <ul className="nav_link_list">
              {links.map((link, idx) => (
                <li key={idx}>
                  <NavLink
                    activeClassName="on"
                    className="text-capitalize nav_link"
                    to={link?.path}
                  >
                    {t(link.label)}
                  </NavLink>
                </li>
              ))}
            </ul>
            {/* USER MENU */}
            <UserMenu />
            {/* END USER MENU */}
          </div>
          {/* END DESKTOP NAV */}

          {/* MOBILE NAVE */}
          <div className="mobile_nav">
            <button
              type="button"
              className={`hamburger_menu ${menuToggle ? "opened" : "closed"}`}
              onClick={onToggleSideMenu}
            >
              <span className="menu-icon_line menu-icon_line--1"></span>
              <span className="menu-icon_line menu-icon_line--2"></span>
              <span className="menu-icon_line menu-icon_line--3"></span>
            </button>

            <div
              className="side_menu"
              style={menuToggle ? { right: "0px" } : { right: "-250px" }}
            >
              <ul className="nav_link_list">
                {links.map((link, idx) => (
                  <li key={idx}>
                    <NavLink
                      activeClassName="on"
                      className="text-capitalize nav_link"
                      to={link?.path}
                    >
                      {t(link.label)}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <ul className="nav_link_list mt-auto">
                <li>
                  {/* USER MENU */}
                  <UserMenu hideNotification />
                  {/* END USER MENU */}
                </li>
                {user && (
                  <li>
                    <button onClick={auth?.endSession} className="logout-btn">
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
          {/* END MOBILE NAV */}
        </nav>
      </div>
    </header>
  );
};
