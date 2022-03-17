import React, { useContext, useEffect } from "react";
import { Switch, Route, matchPath } from "react-router-dom";

import routes, { routeMap } from "./routes";

import WOW from "wowjs";
import "./app-assets/css/bootstrap.min.css";
import "./app-assets/css/animate.css";
import "./app-assets/css/common.css";
import "./app-assets/css/style.scss";
import "./app-assets/css/responsive.css";

// import '@fortawesome/fontawesome-free/css/all.min.css';
import { Header } from "./components/header/Header";
import { Header2 } from "./components/header/Header2";
import { Header3 } from "./components/header/Header3";
import { Footer } from "./components/footer/Footer";
import { Footer2 } from "./components/footer/Footer2";

import { useTranslation } from "react-i18next";
import Loader from "../_shared/components/Loader.component";
import { ServiceContext } from "../../_context/service.context";
import useServiceContextHook from "../../_hooks/service.context.hook";

function GuestMarkup() {
  const { services, useService } = useContext(ServiceContext);
  const wow = new WOW.WOW({
    boxClass: "wow",
    animateClass: "animated",
    mobile: false,
  });

  wow.init();
  useEffect(() => {
    wow.sync();
  }, []);

  const { t } = useTranslation();

  function isRouteMatch(route) {
    const match = matchPath(window.location.pathname, {
      path: route,
      exact: true,
      strict: false,
    });
    return match;
  }

  const cur_loc = window.location.pathname;
  var Custom_Header = null;
  var Custom_Footer = null;
  if (cur_loc === routeMap?.home) {
    Custom_Header = <Header />;
  } else if (
    cur_loc === routeMap?.affiliate ||
    cur_loc === routeMap?.support ||
    cur_loc === routeMap?.me ||
    isRouteMatch(routeMap?.supportByID)
  ) {
    Custom_Header = <Header3 />;
  } else if (cur_loc === "/frame01") {
    Custom_Header = null;
  } else {
    Custom_Header = <Header2 />;
  }

  if (cur_loc === routeMap?.home) {
    Custom_Footer = <Footer />;
  } else if (cur_loc === "/frame01") {
    Custom_Footer = null;
  } else {
    Custom_Footer = <Footer2 />;
  }

  return (
    <>
      <div className="wrap">
        {/* {Custom_Header} */}
        <Header />
        <div className="" style={{ minHeight: "100vh" }}>
          <Switch>
            <Switch>
              {routes.map(
                (
                  {
                    path = routeMap?.home,
                    title = "",
                    auth = false,
                    element: Component,
                  },
                  i
                ) =>
                  auth ? (
                    <Route
                      key={i}
                      exact
                      path={`${path}`}
                      component={() => (
                        <SecuredRoute
                          component={Component}
                          props={{ services, useService }}
                        ></SecuredRoute>
                      )}
                      title={title}
                    />
                  ) : (
                    <Route
                      key={i}
                      exact
                      path={`${path}`}
                      component={() => (
                        <Component {...{ services, useService }} />
                      )}
                      title={title}
                    />
                  )
              )}
            </Switch>
          </Switch>
        </div>
        {Custom_Footer}
      </div>
    </>
  );
}

export default GuestMarkup;

/**
 * @function SecuredRoute
 * @param {Object} props
 * @returns
 */
function SecuredRoute({ component: Component, props }) {
  const { session, history } = useServiceContextHook();
  useEffect(() => {
    if (!session?.user) history.push(routeMap?.login);
  }, [session]);

  return session?.user ? (
    <Component {...props} {...{ user: session?.user }} />
  ) : (
    <Loader />
  );
}
/*   <div
      style={{
        minHeight: "50vh",
        padding: 10,
        marginTop: 100,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <header className="text-center" style={{ position: "relative" }}>
        <h2 className="h3 font-weight-bold">
          {t("You are not allowed to view this page as guest")}
        </h2>
        <p>{t("You must be logged in to view the content of this page")}</p>
      </header>
    </div>  */
