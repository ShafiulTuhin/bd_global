import React, { useState } from 'react'
import { Card, Row, Col, Button, Table, Badge, Form, FormLabel } from "react-bootstrap";
import PageTitle from "../layouts/PageTitle";
import { toast } from "react-toastify";
import CryptoCurrencySelector from "../../_shared/components/input/CryptoCurrencySelector.component";
import '../../admin/common.css'
import { useEffect, useReducer } from "react";
import { useSelector } from 'react-redux';

import { Formik, Form as FormikForm, Field } from "formik";

import { ModalForm } from "../components/modalForm.component.jsx";
import useToggler from "../../../_hooks/toggler.hook";
import UserForm from "../forms/user.form";
import { SERVICE } from "../../../_constants";
import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";

const Mainwallet = ({ services, useService }) => {



    const { user, auth } = services;


    const {
        services: { security },
    } = useServiceContextHook();




    const [is2faEnable, _is2faEnable] = useState(false)
    const [securityData, setSecurityData] = useState();
    const [confirmations, setConfirmation] = useState({
        login: { email: false, sms: false, otp: false },
        transaction: { email: false, sms: false, otp: false },
    });

    useEffect(() => {
        async function fetchSecurity() {
            let { data } = await security?.find();

            console.log("secutiry data", data)

            if (data) setSecurityData(data);
            // Transform confirmation array to object format
            const obj = {};
            Object.entries(data?.confirmations || {}).forEach(([key, value]) => {
                let temp = {};
                value.forEach((el) => {
                    temp[String(el)?.toLowerCase()] = true;
                });
                obj[key] = { ...confirmations[key], ...temp };
                if (key === "transaction") {
                    if (value.includes("OTP")) {
                        _is2faEnable(true)
                        // console.log("2fa enabled")

                    }
                }
            });
            setConfirmation(obj);
        }

        fetchSecurity();

        return () => {
            security.abort();
        };
    }, []);


    // Object.entries(securityData?.confirmations || {}).forEach(([key, value]) => {
    //     if (key === "transaction") {
    //         if (value.includes("OTP")) {
    //             // _is2faEnable(true)
    //             console.log("2fa enabled")
    //         }
    //     }
    // });




    let service = useService({
        [SERVICE?.FIND]: user?.find,
        [SERVICE?.CREATE]: auth?.verifyGoogleAuth,
        [SERVICE?.FINDBYID]: user?.findByID,
        [SERVICE?.UPDATEBYID]: user?.updateByID,
        [SERVICE?.REMOVEBYID]: user?.removeByID,
    })

    const { dispatchRequest, retryDispatch, serviceMap } = service;


    const {
        isOpen: isModalOpen,
        onOpen: onOpenModal,
        onClose: onModalClose,
        toggledPayload: modalPayload,
    } = useToggler();

    const { t } = useTranslation();

    function useFormRenderer(formData = { type: null, payload: null }) {
        // const UserForm = lazy(()=>import('../forms/user'))


        const setData = (data) => {
            if (data) {
                _is2faVerify(true)
            } else {
                _is2faVerify(false)
            }
        }

        const [title, form] = (() => {
            const action = serviceMap[formData?.type];

            try {
                switch (formData?.type) {
                    case SERVICE?.CREATE: {
                        return [
                            t("Vetify 2 FA "),
                            <Verify2fa
                                action={action}
                                payload={formData?.payload}
                                callback={onModalClose}
                                sendData={setData}
                            />,
                        ];
                    }
                    case SERVICE?.UPDATE: {
                        return [
                            "Update User",
                            <UserForm.Update
                                action={action}
                                payload={formData?.payload}
                                callback={onModalClose}
                            />,
                        ];
                    }

                    case SERVICE?.REMOVE: {
                        return [
                            "Delete User",
                            <UserForm.Remove
                                action={action}
                                payload={formData?.payload}
                                callback={onModalClose}
                            />,
                        ];
                    }
                    default:
                        return [null, null];
                }
            } catch (error) {
                console.error(
                    "Must pass in method and payload key to the formData argument"
                );
            }
        })();
        return [
            title,
            <Row>
                <Col>{form}</Col>
            </Row>,
        ];
    }





    const { mainwallet } = services;

    const [crypto, setCrypto] = useState("BTC")
    const [balance, setBalance] = useState("")
    const [address, setAddress] = useState("")
    const [depositeAddress, setDepositeAddress] = useState("")
    const [amount, setAmount] = useState(0)

    const [depositeAddressErr, setDepositeAddressErr] = useState("")
    const [amountErr, setAmountErr] = useState("")
    const [cryptoErr, setcryptoErr] = useState("")
    const [tagErr, setTagErr] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)


    const [is2faVerify, _is2faVerify] = useState(false)


    const session = useSelector((state) => state.session.user);
    console.log(session)


    useEffect(async () => {

        setCryptoBalance()
    }, [crypto]);

    async function setCryptoBalance() {
        try {
            let request = await mainwallet.coinbalance(
                {
                    crypto: crypto
                });
            const { data, error, message = "Unable to authenticate user" } = request;
            if (!data) throw new Error(error?.message || message);
            setBalance(data.balance)
            setAddress(data.masterAddress)

        } catch (error) {
            notifyError(error?.message);
            setBalance("--")
            setAddress("--")
        } finally {
            // setSubmitting(false);
        }
    }

    const initialValues = {
        to: "",
        amount: 0,
        tag: ""
    }

    const [formData, setFormData] = useReducer(formReducer, initialValues);

    function formReducer(state, { type, value }) {
        // console.log({ type, value });
        switch (type) {
            case "to": {
                return { ...state, to: value };
            }
            case "amount": {
                return { ...state, amount: value };
            }
            case "tag": {
                return { ...state, tag: value };
            }
            default: {
                return state;
            }
        }
    }

    function onReset() {
        setFormData({ type: "to", value: "" });
        setFormData({ type: "amount", value: 0 });
        setFormData({ type: "tag", value: "" });
        setCrypto("BTC")
    }

    async function onWithdraw() {

        if (formData?.to == "") {
            setDepositeAddressErr("Address is required")
        } else {
            setDepositeAddressErr("")
        }

        if (formData?.amount <= 0) {
            setAmountErr("Amount is not less than or equal to zero")
        } else {
            setAmountErr("")
        }




        if (crypto == "XRP") {

            if (formData?.tag !== "" && formData?.tag <= 0) {
                setTagErr("Destination Tag must be greater than zero")
            } else {
                setTagErr("")
            }

            if (formData?.to != "" && formData?.amount != 0 && crypto != "") {
                try {

                    if (is2faEnable && is2faVerify === false) {

                        onOpenModal({ type: SERVICE?.CREATE })

                    } else {
                        setIsSubmitting(true)
                        const { error, data, message } = await mainwallet.mainwithdraw({ ...formData, currency: crypto })

                        if (!data) {
                            throw new Error(error?.message || message);
                        } else {

                            notifySuccess(`Withdraw Done for ${crypto}`);
                            setCryptoBalance();
                            _is2faVerify(false)
                            onReset();
                        }
                        setIsSubmitting(false)
                    }

                } catch (err) {
                    notifyError(err?.message, "error");
                    _is2faVerify(false)
                    setIsSubmitting(false)
                }
            }


        } else {

            if (formData?.to != "" && formData?.amount != 0 && crypto != "") {
                try {

                    if (is2faEnable && is2faVerify === false) {

                        onOpenModal({ type: SERVICE?.CREATE })

                    } else {
                        setIsSubmitting(true)
                        const { error, data, message } = await mainwallet.mainwithdraw({ ...formData, currency: crypto })

                        if (!data) {
                            throw new Error(error?.message || message);
                        } else {

                            notifySuccess(`Withdraw Done for ${crypto}`);
                            _is2faVerify(false)
                            setCryptoBalance();
                            onReset();
                        }
                        setIsSubmitting(false)
                    }

                } catch (err) {
                    notifyError(err?.message, "error");
                    _is2faVerify(false)
                    setIsSubmitting(false)
                }
            }
        }// ELSE END




    }




    return (
        <>
            <a className="btn btn-primary" href="/admin/main-wallet-transaction">History</a>
            <PageTitle activeMenu="Main Wallet" motherMenu="Transaction Management" />
            <header className="mb-4">
                <h3>Main Wallet</h3>
            </header>

            <div className='main_wallet_wrap'>
                <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="formCurrencyType">
                    <i className="fas fa-caret-right"></i>
                    <Form.Label className='label_'>Crypto</Form.Label>
                    <CryptoCurrencySelector

                        all
                        onlySymbol
                        altTitle="Select currency"
                        attributes={{ 'className': "form-control" }, { value: crypto }}
                        onChange={(value) => {
                            setCrypto(value);
                        }}
                    />
                </Form.Group>
                <small className="text-danger">{cryptoErr}</small>

                <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
                    <i className="fas fa-caret-right"></i>
                    <Form.Label>Balance</Form.Label>
                    <p className='wallet_text'>{balance}{" "}{crypto}</p>
                </Form.Group>

                <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
                    <i className="fas fa-caret-right"></i>
                    <Form.Label>Deposit Address</Form.Label>
                    <p className='wallet_text'>{address}</p>
                </Form.Group>

                <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
                    <i className="fas fa-caret-right"></i>
                    <Form.Label>Withdraw Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="withdrawaddress"
                        required
                        value={formData?.to}
                        // minLength="3"
                        // defaultValue={formData?.to}
                        onChange={(e) => {
                            setFormData({ type: "to", value: e.target.value });
                        }}
                    />
                    <small className="text-danger">{depositeAddressErr}</small>
                </Form.Group>

                {crypto && crypto == "XRP" ?
                    (<Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
                        <i className="fas fa-caret-right"></i>
                        <Form.Label>Destination Tag(optional)</Form.Label>
                        <Form.Control
                            min="1"
                            type="number"
                            name="withdrawtag"
                            required
                            value={formData?.tag}
                            // minLength="3"
                            // defaultValue={formData?.to}
                            onChange={(e) => {
                                setFormData({ type: "tag", value: e.target.value });
                            }}
                        />
                        <small className="text-danger">{tagErr}</small>
                    </Form.Group>)
                    : ("")}

                <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
                    <i className="fas fa-caret-right"></i>
                    <Form.Label>Withdraw Amount</Form.Label>
                    <Form.Control
                        min="0"
                        type="number"
                        name="withdrawamount"
                        required
                        // minLength="3"
                        value={formData?.amount}
                        // defaultValue={formData?.amount}
                        onChange={(e) => {
                            setFormData({ type: "amount", value: e.target.value });
                        }}
                    />
                    <small className="text-danger">{amountErr}</small>
                </Form.Group>


                <div className="pay_btn_wrap">
                    <button className="btn btn-primary" type="button" onClick={onWithdraw} disabled={isSubmitting}>Withdraw</button>
                    <button className="btn btn-primary" type="button" onClick={onReset}>Cancel</button>
                </div>
            </div>
            <ModalForm
                useFormRenderer={useFormRenderer}
                formData={modalPayload}
                isOpen={isModalOpen}
                onClose={onModalClose}
            ></ModalForm>
        </>
    )
}

function notifySuccess() {
    toast.success("Success !", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
}

function notifyError(error) {
    toast.error(error || "Request Error!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
}




export function Verify2fa({ action, callback, sendData }) {

    const session = useSelector((state) => state.session.user);

    const { t } = useTranslation()
    return (
        <Formik
            initialValues={{
                email: "",
                admin: false,
                token: ""
            }}
            // validate={(values) => {}}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    const user_id = session.id;
                    let { token } = values;
                    // let access_level = admin ? 2 : 1;
                    let { data } = await action({ user_id, token });
                    sendData(data)
                    handleResponse(!!data, () => callback(data));
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
                isSubmitting,
                handleSubmit,
                handleChange,
                handleBlur,
                touched,
            }) => (
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formCurrencyCode">
                        <Form.Label as="strong">{t("verification code")}</Form.Label>
                        <Form.Control
                            type="text"
                            name="token"
                            required
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.token}
                            placeholder={t("Enter 6 digit verification code")}
                        />
                    </Form.Group>

                    <Button variant="primary" disabled={isSubmitting} block type="submit">
                        {isSubmitting ? t("Submitting...") : t("Submit")}
                    </Button>

                    <Form.Group className="mt-3">
                        <Form.Label
                            style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            {/* <span> {t("Administrator")} </span> */}
                            {/* <Switch
                  name="admin"
                  checked={values?.admin}
                  defaultValue={values?.admin}
                  onChange={handleChange}
                /> */}
                                    

                        </Form.Label>
                    </Form.Group>
                </Form>
            )}
        </Formik>
    );
}



function handleResponse(response, callback) {

    toast[response ? "success" : "error"](
        response ? "Done" : "Operation not completed.",
        {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        }
    );
    response && callback();
}



export default Mainwallet