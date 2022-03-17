import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import _actions from "../../../../_actions";
import _constants from "../../../../_constants";
import _services from "../../../../_services";
import useQuery from "../../../../_hooks/query.hook";
import { notify } from "../../../../_helpers/notify";
import { useDispatch } from "react-redux";

import { useTranslation } from "react-i18next";
import { Button, FormControl } from "react-bootstrap";
// ASSETS
import logo_black from "../../app-assets/images/logo/logo-black.png";
import {
  AuthCard,
  LogoContainer,
} from "../../../_shared/components/styled.component";
import { routeMap } from "../../routes";
const { NOTICE, SESSION } = _constants;

// 2-FA AUTHENTICATION---------------------------------------------------------
export default function TwoFactorTransaction({ services }) {
  const { auth } = services;

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState();
  const [isRecovery, setIsRecovery] = useState(false);

  const session = useSelector((state) => state?.session);
  // const user_id = session?.user?.profile?.user_id;
  const { user_id, next = "/me" } = useQuery();

//   useEffect(() => {
//     if (session?.user) window.location = "/";
//   }, [session]);

  return (
    <Formik
      initialValues={{ token: "", secret: "" }}
      validate={(values) => {
        const errors = {};

        if (!isRecovery) {
          if (!values.token) {
            errors.token = t("6 digit token is required");
          } else if (values.token.length != 6 || isNaN(values.token)) {
            errors.token = t("6 numeric characters are expected");
          }
        } else {
          if (!values.secret) {
            errors.secret = t("Secret is required");
          }
        }
        return errors;
      }}
      onSubmit={async (values, actions) => {
        const { token, secret } = values;
        try {
          const payload = {
            user_id: user_id,
          };
          let data, error, message;
          if (!user_id) {
            actions.setErrors({ token: "No <User ID> found!" });
            actions.setSubmitting(false);
            return;
          }
          if (secret) {
            payload.secret = secret;
            let response = await auth.verifyGoogleAuthSecret(payload);
            data = response.data;
            error = response.error;
            message = response.message || "Error verifying Google Authenticator recovery secret! Try again later!";
          } else {
            payload.token = token;
            let response = await auth.verifyGoogleAuth(payload);
            data = response.data;
            error = response.error;
            message = response.message || "Error verifying Google Authenticator token! Try again!";
          }
          if (!data) throw new Error(error.message || message);
          dispatch(log({ type: SESSION.LOGIN, data }));
          next && (window.location.href = next);
        } catch (err) {
          notify(err.message, "error");
        } finally {
          actions.setSubmitting(false);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
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
                      {t("Two-Factor Transaction")}
                    </h3>
                  </div>
                </div>
              </div>
            </section>

            <form onSubmit={handleSubmit}>
              <div className="container">
                <AuthCard>
                  <header
                    className="auth-card__header wow fadeInUp"
                    data-wow-delay="0.2s"
                  >
                    <LogoContainer>
                      <img
                        src={logo_black}
                        alt=""
                        className="mx-auto w-50 d-flex"
                      />
                      <div className="login_p">
                        <small>
                          {t("Enter Your 2FA factor authentication code.")}
                        </small>
                      </div>
                    </LogoContainer>
                  </header>
                  <div className="auth-card__content wow animate__animated fadeInDown">
                    {!isRecovery ? (
                      <div className="">
                        <label className="" htmlFor="coin-Username">
                          {t("Two factor token")}
                        </label>
                        <FormControl
                          type="text"
                          id="2fa-token"
                          value={values?.token}
                          name="token"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="6 digit code"
                          className="font-bold"
                          maxLength={6}
                        />
                        <small className="text-danger">
                          {errors.token && touched.token && errors.token}
                        </small>
                      </div>
                    ) : (
                      <div className="">
                        <label className="" htmlFor="2fa-secret">
                          {t("Recovery secret")}
                        </label>
                        <FormControl
                          type="text"
                          id="2fa-secret"
                          value={values?.secret}
                          name="secret"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter recovery secret here"
                        />
                        <small className="text-danger">
                          {errors.secret && touched.secret && errors.secret}
                        </small>
                      </div>
                    )}

                    <div className="">
                      <Button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="font-bold d-block w-100"
                      >
                        {!isSubmitting ? t("Confirm") : t("Submitting...")}
                      </Button>
                    </div>
                    <ul className="divider_list">
                      <li className="list_item"
                        onClick={() => setIsRecovery(!isRecovery)}
                      >
                        <span className="cursor-pointer">{!isRecovery ? t("Use recovery code") : t("I have the token")}</span>
                      </li>
                    </ul>
                  </div>
                </AuthCard>
              </div>
            </form>
          </div>
        </>
      )}
    </Formik>
  );
}

function log({ type = NOTICE.INFO, data = null }) {
  return { type, data };
}

function notifyError(error) {
  toast.error(error || "Request Error!", {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
