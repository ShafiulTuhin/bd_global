import { useContext, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import routes from "./routes";
import Nav from "./layouts/nav";
import { ThemeContext } from "../../_context/theme.context";
import { normalize } from "path";
import useServiceContextHook from "../../_hooks/service.context.hook";
/// STYLE
import "../../../vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "../../../css/style.css";
import "./common.css";

// COMPONENTS
import UnderConstruction from "./components/underConstruction.component";
import { useSelector } from "react-redux";
import LoginPage from "./pages/login.page";

import Error404 from "../_shared/components/Error404.component";
// import useService from "../../_hooks/service.hook";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";

const languages = [
  {
    code: "en",
    name: "English",
    country_code: "gb",
  },
  {
    code: "ko",
    name: "KOREAN",
    country_code: "ko",
  },
];


export default AdminMarkup;

function AdminMarkup() {
  const session = useSelector((state) => state?.session);
  const { services, useService } = useServiceContextHook();

  const { t } = useTranslation();
  const currentLanguageCode = cookies.get("i18next") || "en";
  const currentLanguage = languages.find((l) => l.code === currentLanguageCode);

  useEffect(() => {
    document.body.dir = currentLanguage.dir || "ltr";
    document.title = t("CoinTC");
  }, [currentLanguage, t]);

  return services ? (
    <Switch>
      <Route exact path="/admin/login">
        {!session?.user ? (
          <LoginPage {...{ services, useService }} />
        ) : session.user?.access_level > 1 ? (
          <Redirect to={{ pathname: `/admin` }} />
        ) : (
          <Redirect to={{ pathname: `/` }} />
        )}
      </Route>
      <Route path="/admin">
        <AdminLayout>
          <Switch>
            {session?.user ? (
              session.user?.access_level > 1 ? (
                routes.map(({ url, component: Component }, i) => (
                  <Route
                    key={i}
                    exact
                    path={normalize(`/admin/${url}`)}
                    render={(props) =>
                      Component ? (
                        <Component {...{ ...props, services, useService }} />
                      ) : (
                        <UnderConstruction />
                      )
                    }
                  />
                ))
              ) : (
                <Redirect to={{ pathname: `/` }} />
              )
            ) : (
              <Redirect to={{ pathname: `/admin/login` }} />
            )}
            <Route exact path="/admin/">
              <Redirect to={{ pathname: "/admin" }} />
            </Route>
            <Route>
              <Error404 />
            </Route>
          </Switch>
        </AdminLayout>
      </Route>
    </Switch>
  ) : (
    "Initializing services and session..."
  );
}

function AdminLayout({ children }) {
  const { menuToggle } = useContext(ThemeContext);

  const {
    helpers: { history },
  } = useServiceContextHook();

  let path = history.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];

  // pages without the default layour will carry a pref: **-page** e,g login-page
  let pagePath = path.split("-").includes("page");

  return (
    <div
      id={`${!pagePath ? "main-wrapper" : ""}`}
      className={`${!pagePath ? "show" : "mh100vh"}  ${
        menuToggle ? "menu-toggle" : ""
      }`}
      style={{
        minHeight: "100vh",
      }}
    >
      {!pagePath && <Nav />}

      <div className={`${!pagePath ? "content-body" : ""}`}>
        <div className={`${!pagePath ? "container-fluid" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
