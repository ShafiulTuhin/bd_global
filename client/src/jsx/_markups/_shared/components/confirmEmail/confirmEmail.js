import React from "react";

import { Formik } from "formik";
import { useDispatch, useSelector } from 'react-redux';

import { toast } from 'react-toastify';
import _actions from "../../../../_actions";
import _constants from "../../../../_constants";
import _services from "../../../../_services";
import { SERVICE } from "../../../../_constants";

const { NOTICE, REQUEST, SESSION } = _constants;
const { user: userAction } = _actions;

export const ConfirmEmail = ({ services, useService }) => {

    const session = useSelector((state) => state?.session);
    

    const dispatch = useDispatch()

    const { auth } = services;

    // const { dispatchRequest } = useService({
    //     [SERVICE?.REGISTER]: auth?.confirm,
    // });



    return (

        <Formik
            initialValues={{ email: "" }}
            validate={(values) => {
                const errors = {};

                if (!values.email) {
                    errors.email = "Email is required";
                } else if (
                    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                ) {
                    errors.email = "Invalid email address";
                }
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                const { email } = values;
                // const body = { email, password, repeat_password, invite_code }
                setSubmitting(true);

                try {
                    // let request = async () =>
                    //     await dispatchRequest({
                    //         type: SERVICE?.REGISTER,
                    //         payload: {
                    //             email,
                    //         },
                    //         toast: { error: notifyError },
                    //     });
                    // dispatch(userAction.confirm(request));
                    // const body = { email, session }

                    const resp = await auth.verifyEmailLink(values)
                    console.log(resp);

                } catch (error) {
                    console.error(error);
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
                    <div className="content">
                        <section id="mainTop">
                            <div className="container">
                                <div className="row">
                                    <div className="col-12">
                                        <h3 className="wow animate__animated fadeInDown" data-wow-delay="0.3s">Confirm Email</h3>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="join">
                            <div className="container">
                                <div className="row" data-wow-delay="0.2s">
                                    <div className="col-12 col-md-6 mx-auto join-row wow animate__animated fadeInDown">
                                        {/* <h4>Join the membership</h4>
                            <p className="mb-5">
                                A verification code has been sent to the email you entered.
                                Complete the membership registration through code verification.
                            </p> */}

                                        <form id="signUp" onSubmit={handleSubmit} >
                                            <hr className="join-hr" />
                                            <div className="mb-4 mt-4">
                                                <label className="form-label" for="coin-email">Enter Email</label>
                                                <input className="form-control" id="coin-email" type="email" name="email" onChange={handleChange}
                                                    onBlur={handleBlur} value={values.email} />
                                                <small className="text-danger">
                                                    {errors.email && touched.email && errors.email}
                                                </small>
                                            </div>

                                            {/* <div className="mb-4">
                                    <ul className="valid-time my-5">
                                        <li>Valid time</li>
                                        <li>03:00</li>
                                    </ul>
                                </div> */}

                                            <div className="mb-3">
                                                <button type="submit" className="btn btn_signup d-block w-100" disabled={isSubmitting}> {!isSubmitting ? "Confirm Email" : "Submitting..."}</button>
                                            </div>

                                            <div className="mb-4 text-center">
                                                <a className="login_link" href="#">Already have an account? go to log in</a>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </>
            )}
        </Formik>
    )
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