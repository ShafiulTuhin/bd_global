import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import _actions from "../../../../_actions";
import _constants from "../../../../_constants";
import _services from "../../../../_services";
import useQuery from "../../../../_hooks/query.hook";
import { notify } from "../../../../_helpers/notify";
import { useDispatch } from "react-redux";
const { NOTICE , SESSION} = _constants;





export default function VerifyOTP({ services }) {
  const session = useSelector((state) => state?.session);
  const { user_id, next } = useQuery();
  const { auth } = services;
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (session?.user) window.location = "/";
  }, [session]);

  return (
    <Formik
      initialValues={{ token: "" }}
      validate={(values) => {
        const errors = {};

        if (!values.token) {
          errors.otp = "Token is required";
        }
        return errors;
      }}
      onSubmit={async (values, actions) => {
        try {
          if (!user_id) {
            actions.setErrors({ token: "<token> is required" });
            actions.setSubmitting(false);
            return;
          }
          let {
            data,
            error,
            message = "Error verifying Google Authenticator token! Try again!",
          } = await auth.verifyOTOTP({ ...values, user_id: user_id });

          if (!data) throw new Error(error.message || message);
          dispatch(log({ type: SESSION.LOGIN, data }));
          // next && (window.location.href = next);
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
        <div className="content">
          <section id="mainTop">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <h3
                    className="wow animate__animated fadeInDown"
                    data-wow-delay="0.3s"
                  >
                    Confirm Token
                  </h3>
                </div>
              </div>
            </div>
          </section>

          <section id="join">
            <div className="container">
              <div className="row" data-wow-delay="0.2s">
                <div className="col-12 col-md-6 mx-auto join-row wow animate__animated fadeInDown">
                  <h4>Confirm OTP</h4>
                  <p className="mb-5">
                    A verification code has been sent to your email you entered.
                    enter the code to proceed
                  </p>

                  <form id="signUp" onSubmit={handleSubmit}>
                    <hr className="join-hr" />
                    <div className="mb-4 mt-4">
                      <label className="form-label" htmlFor="coin-email">
                        Enter OTP
                      </label>
                      {/* <input className="form-control" id="coin-email" type="email" name="email" onChange={handleChange}
                                                onBlur={handleBlur} value={values.email} /> */}
                      <input
                        className="form-control"
                        id="coin-otp"
                        name="otp"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.token}
                      />
                      <small className="text-danger">
                        {errors.token && touched.token && errors.token}
                      </small>
                    </div>

                    {/* <div className="mb-4">
                      <ul className="valid-time my-5">
                        <li>Valid time</li>
                        <li>03:00</li>
                      </ul>
                    </div> */}

                    <div className="mb-3">
                      <button
                        className="btn btn_signup d-block w-100"
                        disabled={isSubmitting}
                      >
                        {!isSubmitting ? "Submit" : "Submitting..."}
                      </button>
                    </div>

                    <div className="mb-4 text-center">
                      Already have an account?{" "}
                      <a className="login_link" href="#">
                        Log in
                      </a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>
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
