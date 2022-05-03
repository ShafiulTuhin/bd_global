import React, { useEffect } from "react";

// HOOKS
import useServiceContextHook from "../../../../_hooks/service.context.hook";

// CONSTANTS
import _constants from "../../../../_constants";

// HELPERS
import { routeMap } from "../../routes";

// COMPONENTS
import AuthForm from "../../components/form/auth.form";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { session, history } = useServiceContextHook();
  const {t} = useTranslation()
  function redirectTo() {
    let state = history.location?.state?.pathname;
    return state || routeMap.me;
  }
  useEffect(() => {
    if (session?.user) history.push(redirectTo());
  }, [session]);

  return (
    <>
      <div className="content">
        <section id="mainTop">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h3
                  className="wow animate__animated fadeInDown"
                  data-wow-delay="0.3s"
                >
                  {t("Login")}
                </h3>
              </div>
            </div>
          </div>
        </section>
        <div style={{ minHeight: "50vh", border: '1px transparent solid' }}>
          <AuthForm />
        </div>
      </div>
    </>
  );
}
