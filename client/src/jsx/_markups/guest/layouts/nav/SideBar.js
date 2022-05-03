/// Menu
import MetisMenu from "metismenujs";
import { useHistory } from "react-router";
import React, { useRef, useState, useContext, useEffect } from "react";
/// Scroll
import $path from "path";
import PerfectScrollbar from "react-perfect-scrollbar";
/// Link
import { Link } from "react-router-dom";
import useScrollPosition from "use-scroll-position";
import { ThemeContext } from "../../../../../context/ThemeContext";
import sidebar_routes from "../../sidebar_routes";
// import styled from "styled-components";

/* const MainProfile = styled.div`
  .main-profile {
    i {
      color: var(--primary);
      margin-right: -20px;
    }
  }
`; */

function MM({ children }) {
  const el = useRef();
  useEffect(() => {
    if (el.current) {
      new MetisMenu(el.current, {});
      // return mm.dispose('dispose');
    }
  }, [el]);

  return (
    <div className="mm-wrapper">
      <ul className="metismenu" ref={el}>
        {children}
      </ul>
    </div>
  );
}

const SideBar = () => {
  const { iconHover, sidebarposition, headerposition, sidebarLayout } =
    useContext(ThemeContext);
  const [pathname, setPathname] = useState();
  const history = useHistory();

  useEffect(() => {
    var btn = document.querySelector(".nav-control");
    var aaa = document.querySelector("#main-wrapper");
    function toggleFunc() {
      return aaa.classList.toggle("menu-toggle");
    }
    btn.addEventListener("click", toggleFunc);

    //sidebar icon Heart blast
    // var handleheartBlast = document.querySelector(".heart");
    // function heartBlast() {
    //   return handleheartBlast.classList.toggle("heart-blast");
    // }

    // handleheartBlast.addEventListener("click", heartBlast);
  }, []);
  let scrollPosition = useScrollPosition();

  useEffect(() => {
    let path = history.location.pathname;
    path = path.split("/");
    setPathname(path[path.length - 1]);
  }, [history.location.pathname]);

  return (
    <div
      className={`deznav ${iconHover} ${
        sidebarposition.value === "fixed" &&
        sidebarLayout.value === "horizontal" &&
        headerposition.value === "static"
          ? scrollPosition > 120
            ? "fixed"
            : ""
          : ""
      }`}
    >
      <PerfectScrollbar className="deznav-scroll">
        {/* <MainProfile>
          <div className="main-profile">
            <img src={profile} alt="" />
            <Link to="/admin/setting">
              <i className="fa fa-cog" aria-hidden="true"></i>
            </Link>
            <h5 className="mb-0 fs-20 text-black ">
              <span className="font-w400">Hello,</span> Marquez
            </h5>
            <p className="mb-0 fs-14 font-w400">marquezzzz@mail.com</p>
          </div>
        </MainProfile> */}

        <MM className="metismenu" id="menu">
          {sidebar_routes.map(({ name, embedded = [], path, icon }, index) => {
            return (
              <li
                key={`sidebar_routes_${name}_${index}`}
                className={`${
                  embedded.length
                    ? embedded.includes(pathname)
                      ? "mm-active"
                      : ""
                    : pathname === path
                    ? "mm-active"
                    : ""
                }`}
              >
                <Link
                  className={`${embedded.length ? "has-arrow ai-icon" : ""} `}
                  to={
                    embedded.length > 0
                      ? "#"
                      : $path.normalize(`/admin/${path}`)
                  }
                  style={{
                    display: "flex",
                    gap:8
                  }}
                >
                  <i className={icon}></i>
                  <span className="nav-text text-capitalize">
                    {name.replace(/[-]/gi, " ")}
                  </span>
                </Link>

                {embedded.length ? (
                  <ul>
                    {embedded.map((data, _index) => {
                      return (
                        <li key={`${name}_${data.path}_${_index}`}>
                          <Link
                            className={`${
                              pathname === data.path ? "mm-active" : ""
                            } text-capitalize`}
                            to={$path.normalize(`/admin/${data.path}`)}
                          >
                            {data.name.replace(/[-]/gi, " ")}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </MM>

        <div className="copyright">
          <p>
            <strong>CoinTC </strong> © 2021 All Rights Reserved
          </p>
          {/* <p className="fs-12">
                Made with <span className="heart"></span> by DexignZone
              </p> */}
        </div>
      </PerfectScrollbar>
    </div>
  );
};

export default SideBar;
