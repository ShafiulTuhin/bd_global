// import React, { useEffect } from "react";
import { Formik } from "formik";
import logo from "../../_shared/asset/image/logo/logo.png";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import _actions from "../../../_actions";
import { useTranslation } from "react-i18next";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import CONSTANTS from "../../../_constants";
import { routeMap } from "../../guest/routes";
import { log } from "../../../_helpers/log";
import { objectToQuery } from "../../../_helpers/utils.helper";
const { user: userAction } = _actions;

const LoginPage = ({ services, useService }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  // const location = useLocation();
  const { auth } = services;

  const { dispatchRequest } = useService(
    {
      [SERVICE?.LOGIN]: auth?.login,
    },
    { error: notifyError }
  );

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validate={(values) => {
        const errors = {};

        if (!values.email) {
          errors.email = t("Email is required");
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
        ) {
          errors.email = t("Invalid email address");
        }

        if (!values.password) {
          errors.password = t("Password is required");
        }
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        const { email, password } = values;
        setSubmitting(true);
        try {
          let request = await auth.login(
            {
              email,
              password,
              access_level: 3,
            });
          const { data, error, message = "Unable to authenticate user" } = request;
          if (!data) throw new Error(error?.message || message);
          if (data?.token) {
            // let { type, data } = await dispatch(userAction.login(request));
            dispatch(log({ type: CONSTANTS?.SESSION?.LOGIN, data }));
            // if (type === CONSTANTS.NOTICE.ERROR) throw new Error(data);
          } if (data?.reason) {
            switch (data?.reason) {
              case "2fa-enabled": {
                const query = objectToQuery({
                  user_id: data?.user_id,
                  next: '/admin',
                }),
                  pathname = `${routeMap?.twoFactor}${query}`;
                return (window.location.href = pathname);
              }
              default: {
                // Move to the sendOTP page
                const query = objectToQuery({
                  user_id: data?.user_id,
                  next: routeMap.me,
                }),
                  pathname = `${routeMap?.verifyOTP}${query}`;
                return (window.location.href = pathname);
                // history.push({
                //   pathname: `${routeMap?.verifyOTP}?user_id=${data?.user_id}`,
                //   state: {
                //     from: window.location.href,
                //   },
                // });
              }
            }
          }
        } catch (error) {
          notifyError(error?.message);
        } finally {
          setSubmitting(false);
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
          {/* {alert.message && (
        <div className={`alert ${alert.type}`}>{alert.message}</div>
      )} */}
          <div className="authentication flex flex-column align-items-center justify-content-center vh-100">
            <div className="container h-100">
              <div className="row justify-content-center h-100 align-items-center">
                <div className="col-lg-6 col-sm-11">
                  <div className="authincation-content">
                    <div className="row no-gutters">
                      <div className="col-xl-12">
                        <div className="auth-form">
                          <div className="text-center mb-3">
                            <Link to="/">
                              <img src={logo} alt="" />
                            </Link>
                          </div>
                          <h4 className="text-center mb-4 ">
                            {t("Admin login")}
                          </h4>
                          <form onSubmit={handleSubmit}>
                            <div className="form-group">
                              <label className="mb-1 ">
                                <strong>{t("Email")}</strong>
                              </label>
                              <input
                                required
                                type="email"
                                name="email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                                className="form-control"
                                placeholder={t("Email address")}
                              />
                              <small className="text-danger">
                                {errors.email && touched.email && errors.email}
                              </small>
                            </div>
                            <div className="form-group">
                              <label className="mb-1 ">
                                <strong>{t("Password")}</strong>
                              </label>
                              <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                                className="form-control"
                                placeholder={t("Password")}
                              />
                              <small className="text-danger">
                                {errors.password &&
                                  touched.password &&
                                  errors.password}
                              </small>
                            </div>
                            <div className="form-row d-flex justify-content-between mt-4 mb-2"></div>
                            <div className="text-center">
                              <button
                                disabled={isSubmitting}
                                type="submit"
                                className="btn btn-primary btn-block"
                              >
                                {!isSubmitting
                                  ? t("Login")
                                  : t("Submitting...")}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Formik>
  );
};

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

export default LoginPage;

LoginPage.displayName = "LoginPage";
