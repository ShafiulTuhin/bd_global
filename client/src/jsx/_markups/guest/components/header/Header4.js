import React from "react";
import { Nav, Navbar } from "react-bootstrap";

import logo from "../../app-assets/images/logo/CoinTC_logo_black.png";
import user from "../../app-assets/images/icon/user-01.png";

// HELPERS
import { routeMap } from "../../routes";

export const Header4 = () => {
  return (
    <>
      <Navbar
        className="navbar navbar-light bg-light my-border header4"
        expand="lg"
      >
        <div className="container">
          <Nav.Link to={routeMap?.home}>
            <img src={logo} width="100" alt="logo" />
          </Nav.Link>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              // style={{ maxHeight: "100px" }}
              navbarScroll
            >
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Nav.Link
                    className="nav-link text-black"
                    to={routeMap?.advert}
                  >
                    P2P Trade <span className="sr-only">(current)</span>
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link
                    className="nav-link text-black"
                    to={routeMap?.order}
                  >
                    Orders
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link
                    className="nav-link text-black"
                    to={routeMap?.wallet}
                  >
                    Wallet
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link
                    className="nav-link text-black"
                    to={routeMap?.affiliate}
                  >
                    Affiliate
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link
                    className="nav-link text-black"
                    to={routeMap?.support}
                  >
                    Support
                  </Nav.Link>
                </li>
              </ul>
            </Nav>
            <Nav
              className="ml-auto my-2 my-lg-0"
              // style={{ maxHeight: "100px" }}
              navbarScroll
            >
              <ul className="navbar-nav ls-btn-info">
                <li className="nav-item btn-login">
                  <Link className="btn text-black" to={routeMap?.me}>
                    <img src={user} className="pr-2" />
                    My Page
                  </Link>
                </li>
              </ul>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </>
  );
};
