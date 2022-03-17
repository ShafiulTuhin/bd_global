import React, { useEffect, useState } from "react";
import { Button, Modal, Nav, ProgressBar, Image } from "react-bootstrap";
import { Link, useLocation, useParams, useHistory } from "react-router-dom";
import qs from "qs";
import { createBrowserHistory } from "history";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { notify } from "../../../../_helpers/notify";

import icon_method01 from "../../app-assets/images/icon/icon_method01.png";
import term_error_icon from "../../app-assets/images/icon/term-error-icon.png";
import term_logo_01_icon from "../../app-assets/images/icon/term-logo-01.png";
import term_user_icon from "../../app-assets/images/icon/term-user-icon.png";
import term_help_icon from "../../app-assets/images/icon/term-help-logo.png";
import term_edit_icon from "../../app-assets/images/icon/term-edit-icon.png";
import term_ask_icon from "../../app-assets/images/icon/term-ask-icon.png";
import term_upload_icon from "../../app-assets/images/icon/term-upload-icon.png";
import term_doc_icon from "../../app-assets/images/icon/term-doc-icon.png";
import * as moment from "moment";
import "@fortawesome/fontawesome-free/css/all.min.css";
import bank_icon from "../../app-assets/images/icon/bank-icon.png";
import money_icon from "../../app-assets/images/icon/money.png";
import chat_icon from "../../app-assets/images/icon/chat-icon.png";
import Loader from "../../../_shared/components/Loader.component";


function Confirm_release() {
    const {
        services: { order },
    } = useServiceContextHook();

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [check, setCheck] = useState(false);

    const history = useHistory();
    const params = useParams();

    function onInputCheckBoxChange(e) {
        // console.log(e)
        // console.log(e.target.checked)
        setCheck(e.target.checked);
    }

    function onSubitClick() {
        console.log(params.id);

        if (check == true) {
            order.confirm(params.id).then((response) => {

                const { data, error, message } = response;
                if (error) {
                    console.log(error);
                    notify(error, "error");
                } else if (data) {
                    notify("Release Successfully");
                }
            });
        } else {
        }

        // if (check == true) {
        //   history.push("/order");
        // }
    }

    return (
        <>
            {/* <Link  className="btn btn_confirm" onClick={handleShow}>
          Confirm release
        </Link> */}

            <button className="btn btn_confirm" onClick={handleShow}>
                Paid
            </button>

            <Modal show={show} onHide={handleClose} className="confirmReleaseModal">
                <Modal.Body>
                    <div className="con-icon text-center">
                        <img src={term_error_icon} />
                        <h4>Payment Confirmation</h4>
                    </div>
                    <div className="con-content pt-3">
                        <p>
                            {/* ATTENTION! Please be sure to LOG IN THE RECEVING
                            (e.g.Banks/eWallet)ACCOUNT to confirm that the money has arrived
                            in the"Available Balance" */}
                            {/* Pleased confirm that you have paid the seller? */}
                        </p>
                    </div>
                    <div className="col-auto">
                        <div className="form-check mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="coin-checked"
                                onChange={onInputCheckBoxChange}
                            />
                            <label
                                className="form-check-label mb-0 read--1"
                                for="coin-checked"
                            >
                                {/* I confirm that the payment is successfully received with correct
                                amount and sender information. */}
                                Pleased confirm that you have paid the seller?
                            </label>
                            <br />
                            <span className="text-danger">
                                {check == false ? "Please check checkbox" : ""}
                            </span>
                        </div>
                    </div>
                    <div className="confirm-cancel">
                        {/* <Link to="/order" className="btn btn-confirm" >
                Confirm release
              </Link> */}
                        <button className="btn btn-confirm " onClick={onSubitClick}>
                            Paid
                        </button>
                        <button className="btn btn-cancel" onClick={handleClose}>
                            Cancel
                        </button>
                        {/* <Link to="#" className="btn btn-cancel" onClick={handleClose}>
                Cancel
              </Link> */}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}


function Dispute_report() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // function tawktoFun() {
    //   var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();

    //   (function () {
    //     var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    //     s1.async = true;
    //     s1.src = 'https://embed.tawk.to/61a76b7d9099530957f78013/1flqvnqd9';
    //     s1.charset = 'UTF-8';
    //     s1.setAttribute('crossorigin', '*');
    //     s0.parentNode.insertBefore(s1, s0);
    //   })();
    // }

    return (
        <>
            {/* <Link to="#" className="btn btn_dispute" onClick={handleShow}>
          Dispute Report
        </Link> */}

            <button className="btn btn_dispute" onClick={handleShow}>
                Dispute Report
            </button>

            <Modal show={show} onHide={handleClose} className="disputeReportModal">
                <Modal.Header className="bg-primary col-md-12 modal-header text-white">
                    <div className="col-md-2"></div>
                    <div className="col-md-6 modal-header-content text-center">
                        <img src={term_logo_01_icon} className="w-auto" />
                        <h4 className="modal-title">HelpCrunch Team</h4>
                    </div>
                    <div className="col-md-2">
                        <button
                            type="button"
                            className="btn btn-primary d-inline pr-0 text-white"
                        >
                            <i className="fa fa-ellipsis-v fa-lg" aria-hidden="true"></i>
                        </button>
                        <button
                            type="button"
                            className="close btn-hps d-inline pl-0 pt-3"
                            onClick={handleClose}
                        >
                            &times;
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body className="mb-5 border-b1 pb-5">
                    <div className="main-crunch-content d-flex">
                        <div className="user-icon d-flex align-items-center pl-2">
                            <img src={term_user_icon} width="60" />
                            <div className="body-header pl-3">
                                <h5 className="mb-0">HelpCrunch Team</h5>
                                <p>Hey there If you have any questions, I’m here to help.</p>
                            </div>
                        </div>
                        <div className="last-seen">
                            <p>14m</p>
                        </div>
                    </div>
                    {/* <ScriptTag isHydrating={true} type="text/javascript" src="/Tawkto.js" /> */}
                </Modal.Body>
                <div className="modal-edit-body text-center pt-5 mt-5">
                    <img src={term_edit_icon} className="edit-img" />
                    <div className="d-flex justify-content-center mt-2">
                        <img src={term_help_icon} className="crunch-img" />
                        <h4>HELPCRUNCH</h4>
                    </div>
                </div>
                <Modal.Footer class="bn-footer">
                    <div className="ask-faq-bn ">
                        <div className="row justify-content-center">
                            <div className="col-6 text-center">
                                <a className="text-black font-weight-bold">
                                    <img src={term_ask_icon} width="25" />
                                    ASK ANY
                                </a>
                            </div>
                            <div className="col-6 text-center">
                                <form className="form-inline d-flex justify-content-center md-form form-sm mt-0 ser-sec">
                                    <i className="fas fa-search" aria-hidden="true"></i>
                                    <input
                                        className="form-control form-control-sm ml-1 w-90 border-none "
                                        type="text"
                                        placeholder="Search"
                                        aria-label="Search"
                                    />
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

function Send_modal() {
    const {
        services: { auth },
        session,
    } = useServiceContextHook();
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const history = createBrowserHistory();
    const params = useParams();

    const routeChange = () => {
        let path = `order_completed`;
        history.push(path);
    };

    async function sendOTP(email) {
        // email = "chintan.codewexy@gmail.com";
        // var phone = "9723215104"
        // phone : phone, type : "phone"
        try {
            let { data, error, message } = await auth.send_otp(
                JSON.stringify({ id: session?.user?.dataValues?.id })
            );
            if (!data) throw new Error(error?.message || message);

            if (data?.status) {
                notify(`An OTP has been sent to your ${email}`);
            } else notify(`Could not contact mail server`);
        } catch (err) {
            notify(err.message, "error");
        } finally {
        }
    }

    return (
        <>
            {/* <Link to="#" className="btn btn-send" onClick={handleShow}>
          {" "}
          Send{" "}
        </Link> */}

            <button className="btn btn-send" onClick={handleShow}>
                Send
            </button>

            <Modal show={show} onHide={handleClose} className="sendSellbtcModal">
                <Modal.Header closeButton>
                    <div className="sy-header-title">
                        <Modal.Title>Security verification</Modal.Title>
                        <p className="txt-secure pl-0 pr-2 py-2">
                            To secure your account. please complete the following
                            verification.
                        </p>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group my-input-group">
                        <label for="phoneNumber " className="txt-ph-var">
                            Phone verification code
                        </label>
                        <input
                            type="email"
                            className="form-control in-vat-txt"
                            id="phoneNumber"
                            placeholder="Verification code sent"
                        />
                        <small className="form-text text-muted mt-3">
                            Enter the 6 digit code sent to 10232***3453
                        </small>
                        <small className="form-text myform-small mt-3">
                            Security verification unavailable?
                        </small>
                    </div>
                    <button
                        type="button"
                        onClick={sendOTP}
                        className="btn btn-primary w-100"
                    >
                        SUBMIT
                    </button>
                </Modal.Body>
            </Modal>
        </>
    );
}

function Attachments_modal() {
    const [show, setShow] = useState(false);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [progress, setProgress] = useState(0);
    // const [disType, setDisType] = useState("none")

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const { services, session } = useServiceContextHook();
    const { upload } = services;

    async function onAddButtonClick() {
        // console.log("onAddButtonClick");

        if (file != null) {
            // console.log("file is not null ");
            setFileError("");
            console.log("selected file name :    " + file.name);
            const formData = new FormData();
            formData.append("file", file);

            upload
                .create(formData)
                .then((response) => {
                    // setProgress(Math.round((100 * event.loaded) / event.total));
                    setProgress(100);
                    console.log("than res : ");
                    console.log(response);
                    const { data, error, message } = response;
                    if (error == null) {
                        notify("Data Upload Successfully");
                    }
                })
                .catch((mes) => {
                    console.log(mes);
                    // setProgress(0);
                    // setMessage("Could not upload the file!");
                    // setCurrentFile(undefined);
                });
            // console.log(response);
            // console.log(response.error);
        } else {
            setFileError("Please Select File");
        }
    }

    async function onInputFileChange(e) {
        console.log("onInputFileChange   " + e.target.files[0].name);
        setFile(e.target.files[0]);
        // const response = await upload.create(e.target.files[0].name);
        // console.log(response);
    }

    return (
        <>
            {/* <Link to="#" className="float-left mr-3" onClick={handleShow}>
          <i className="fas fa-paperclip pr-2"></i> Attachments
        </Link> */}
            <span className="float-left mr-3" onClick={handleShow}>
                <i className="fas fa-paperclip pr-2"></i>Attachments
            </span>

            <Modal show={show} onHide={handleClose} className="attchmodal">
                <Modal.Body>
                    <div className="att-title">
                        <h2>Upload</h2>
                    </div>
                    <div className="drop-file-content py-4 px-3 d-flex justify-content-center align-items-center">
                        <div className="upload-icon">
                            <img src={term_upload_icon} className="pdf-icon" />
                        </div>
                        <div className="upload-icon-content pl-3">
                            <p className="mb-0">
                                {" "}
                                {/* <strong>Drop files to attach, or</strong> <span>Browse</span> */}
                                <input
                                    type="file"
                                    id="myfile"
                                    name="myfile"
                                    onChange={onInputFileChange}
                                />
                            </p>
                            <p className="mb-0">(Individual file upload size limit 1MB)</p>
                        </div>
                    </div>
                </Modal.Body>
                <div className="main-upload-doc px-3">
                    <div className="upload-doc mt-2">
                        <div className="row">
                            <div className="col-10">
                                <div className="uplod-doc-icon px-3 py-2 d-flex align-items-center">
                                    <img src={term_doc_icon} />
                                    <div className="pgl-content w-100">
                                        <div className="pgl-title">
                                            <p className="mb-0">File name goes here.pdf</p>
                                            <ProgressBar now={progress} variant="info" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-1">
                                <Link to="#" className="close btn-cl" aria-label="Close">
                                    {" "}
                                    <span aria-hidden="true">&times;</span>{" "}
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* <div className="upload-doc mt-2">
              <div className="row">
                <div className="col-10">
                  <div className="uplod-doc-icon px-3 py-2 d-flex align-items-center">
                    <img src={term_doc_icon} width="50" />
                    <div className="pgl-content w-100">
                      <div className="pgl-title">
                        <p className="mb-0">File name goes here.pdf</p>
                        <ProgressBar now={50} variant="info" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-1">
                  <Link to="#" className="close btn-cl" aria-label="Close">
                    {" "}
                    <span aria-hidden="true">&times;</span>{" "}
                  </Link>
                </div>
              </div>
            </div>
            <div className="upload-doc mt-2">
              <div className="row">
                <div className="col-10">
                  <div className="uplod-doc-icon px-3 py-2 d-flex align-items-center">
                    <img src={term_doc_icon} width="50" />
                    <div className="pgl-content w-100">
                      <div className="pgl-title">
                        <p className="mb-0">File name goes here.pdf</p>
                        <ProgressBar now={100} variant="info1" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-1">
                  <Link to="#" className="close btn-cl" aria-label="Close">
                    {" "}
                    <span aria-hidden="true">&times;</span>{" "}
                  </Link>
                </div>
              </div>
            </div> */}
                </div>
                <Modal.Footer>
                    <Button variant="outline-cancel" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onAddButtonClick}>
                        Add
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default function Offer(props) {

    const { order } = props?.services;
    const payment_methods = {
        alipay: {
            icon: money_icon,
        },
        wechat: {
            icon: chat_icon,
        },
        bank_transfer: {
            icon: bank_icon,
        },
    };

    const params = useParams();

    const [id, setID] = useState(null);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    async function getOrderByID(id) {
        return await order.findByID(id, { fake: true });
    }
    useEffect(
        () =>
            (async () => {
                if (params)
                    try {
                        setIsLoading(true);
                        let { id } = params;

                        setID(id);
                        let { data, error, message } = await getOrderByID(id);

                        if (error) throw new Error(message);

                        // console.log(data);
                        if (data) {
                            setData(data);
                        }
                    } catch (err) {
                        setError(err?.message);
                    } finally {
                        setIsLoading(false);
                    }
            })(),
        [params]
    );

    return isLoading ? (
        <Loader />
    ) : data ? (
        <div className="content">
            <section id="mainTop">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h3
                                className="wow animate__animated fadeInDown"
                                data-wow-delay="0.3s"
                            >
                                P2p Trade
                            </h3>
                        </div>
                    </div>
                </div>
            </section>

            <section id="sellbtc">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-7 ">
                            <div className="sell-btc-left-row">
                                <div className="row align-items-center">
                                    <div className="col-12 col-sm-12 col-lg-5">
                                        <h4>
                                            {String(data?.advert?.type)?.toUpperCase()}{" "}
                                            {data?.advert?.crypto.toUpperCase()}
                                        </h4>
                                    </div>
                                    <div className="col-12 col-sm-12 col-lg-7">
                                        <div
                                            className="d-flex justify-content-between"
                                            style={{ gap: 0 }}
                                        >
                                            <strong className="truncate" style={{ flex: "1 " }}>
                                                Order Number
                                            </strong>
                                            <span
                                                className="ml-1 truncate text-right"
                                                style={{ flex: "1" }}
                                            >
                                                {data?.advert?.id}
                                            </span>
                                        </div>
                                        <div
                                            className="d-flex justify-content-between"
                                            style={{ gap: 0 }}
                                        >
                                            <strong className="truncate" style={{ flex: "1" }}>
                                                Creation time
                                            </strong>
                                            <span className="ml-1 text-left" style={{ flex: "1" }}>
                                                {moment(data?.advert?.createdAt).format(
                                                    "YY/MM/DD HH:MM"
                                                )}
                                            </span>
                                        </div>
                                        <div
                                            className="d-flex justify-content-between"
                                            style={{ gap: 0 }}
                                        >
                                            <strong className="truncate" style={{ flex: "1" }}>
                                                Payment Methods
                                            </strong>
                                            <ul className="truncate text-left" style={{ flex: "1" }}>
                                                {Array()
                                                    .concat(data?.advert?.payment_methods)
                                                    .map((payment_method, index) => (
                                                        <li key={index} className="ml-1 truncate">
                                                            {payment_method}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                        <div
                                            className="d-flex justify-content-between"
                                            style={{ gap: 0 }}
                                        >
                                            <strong style={{ flex: "1" }}>Status</strong>
                                            <span style={{ flex: "1" }} className="ml-1">
                                                {data?.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="sellbtc-hr" />

                                <div className="row mb-4">
                                    <div className="sell-payment col-sm-12 col-md-4 col-lg-4">
                                        <dl>
                                            <dt>Total</dt>
                                            <dd>{data?.advert?.total_qty}</dd>
                                            <dd>{data?.advert?.fiat}</dd>
                                        </dl>
                                    </div>
                                    <div className="sell-payment col-sm-12 col-md-4 col-lg-4">
                                        <dl>
                                            <dt>Price</dt>
                                            <dd>{data?.advert?.price}</dd>
                                            <dd>{data?.advert?.fiat}</dd>
                                        </dl>
                                    </div>
                                    <div className="sell-payment col-sm-12 col-md-4 col-lg-4">
                                        <dl>
                                            <dt>Amount</dt>
                                            <dd>{data?.total_amount}</dd>
                                            <dd>{data?.advert?.fiat.toUpperCase()}</dd>
                                        </dl>
                                    </div>
                                </div>

                                <div className="row" id="bankTransfer">
                                    <div className="col-sm-12 col-md-9 banktransfer">
                                        <h4>Payment method</h4>
                                        <div className="row mt-3">
                                            <div className="col-sm-12 col-lg-5">
                                                <h4>
                                                    {/* {Array()
                            .concat(data?.advert?.payment_methods)
                            .map((pm, key) =>
                              typeof pm == "string" ? (
                                <span key={key}>
                                  {payment_methods[pm] &&
                                  payment_methods[pm].icon ? (
                                    <Image
                                      src={payment_methods[pm].icon}
                                      style={{ width: 25 }}
                                      alt={`${pm} icon`}
                                    />
                                  ) : null}
                                </span>
                              ) : null
                            )} */}
                                                    {/* &nbsp; */}
                                                    {/* <img src={icon_method01} className="mr-1" /> */}
                                                    {/* Bank Transfer */}
                                                    {/*  {data?.advert?.payment_methods[0] === "bank_tranfer"
                            ? "Bank Transfer"
                            : data?.payment_methods[0]} */}
                                                    {Array()
                                                        .concat(data?.advert?.payment_methods)
                                                        .map((payment_method, index) => (
                                                            <li key={index} className="ml-1 truncate">
                                                                <img
                                                                    src={payment_methods[payment_method].icon}
                                                                    className="mr-1"
                                                                />{" "}
                                                                <span>{payment_method}</span>
                                                            </li>
                                                        ))}
                                                </h4>
                                            </div>
                                            {Array()
                                                .concat(data?.advert?.payment_methods)
                                                .map((pm, index) => {
                                                    return (
                                                        <ul key={index} className="col-sm-12 col-lg-7">
                                                            {Object.entries(
                                                                data?.advert?.user?.profile?.payment_methods[pm]
                                                            ).map(function ([key, value], pm_key) {
                                                                return (
                                                                    <li key={pm_key} className="billed clearfix">
                                                                        <dl>
                                                                            <dt>{key}</dt>
                                                                            <dd>{value}</dd>
                                                                        </dl>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>

                                <div className="row mt-3" id="bankTransfer">
                                    <div className="col-sm-12 col-md-9 banktransfer pb-5">
                                        <h4>Terms of trade</h4>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-12 col-md-9">
                                        <div className="sellbtc-process">
                                            <h3>Unpaid {data?.advert?.payment_ttl_mins} minutes</h3>
                                            <p>
                                                The BTC will be held in the escrow for{" "}
                                                {data?.advert?.payment_ttl_mins} mins. And it will be
                                                return to the seller if this trade is not paid in time
                                            </p>
                                        </div>
                                        <div className="btn_sellbtc mt-3">
                                            <Confirm_release></Confirm_release>

                                            <Dispute_report></Dispute_report>
                                        </div>
                                    </div>
                                </div>

                                <div id="selltips" className="pt-5">
                                    <div className="sell-tip">
                                        <h4>Tips</h4>
                                        <ol>
                                            <li>
                                                Please make sure to log in to your account to confirm
                                                the payment is received, this can avoid financial losses
                                                caused by wrongly clicking on the release button.
                                            </li>

                                            <li>
                                                The digital assets you are selling has been frozen by
                                                the platform. Please confirm the receipt of the payment
                                                from the buyer and click “release” to release the
                                                crypto.
                                            </li>
                                            <li>
                                                Please do not agree to any request to release the crypto
                                                before confirming the receipt of the payment to avoid
                                                financial losses.
                                            </li>
                                            <li>
                                                After receiving the SMS notification, please be sure to
                                                log in to your bank account to confirm whether the
                                                payment is credited, this will avoid the release of
                                                crypto due to Fraud SMS.
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-5">
                            <div className="sell-btc-right-row">
                                <div className="sell-btc-right-row-top">
                                    <h4>
                                        {data?.advert?.user?.profile.pname}{" "}
                                        {data?.advert?.user?.profile.lname}
                                    </h4>
                                </div>
                                <hr className="warning-border" />

                                <div id="warning">
                                    <p>
                                        Warning: Advertisers please beware of scammers who buy
                                        crypto from you and then report it to the bank later. Make
                                        sure you got your Ad's terms and conditions adequately
                                        provided. Advertisers please consider additional
                                        verification when necessary. Do NOT listen to any person who
                                        tells you to buy crypto and transfer to them later. Beware
                                        of voice phising scams. Sellers please note that you should
                                        only release crypto when you receive enough money in your
                                        account. Please check your bank account carefully. Buyer DO
                                        NOT write crypto-related content in the transfer remark.
                                        Buyers please click on Paid after successful transfer. Users
                                        please be aware of scams / suspicious behaviors. Report to
                                        Binance immediately if you find scammers
                                    </p>
                                    <p className="my-5">
                                        {data?.user?.profile?.pname}（real name：
                                        {data?.user?.profile?.pname}）has marked the order as paid.
                                        Please confirm that you have received the payment and
                                        release the asset. Please note: Make sure to log into your
                                        account and confirm that you have received the payment
                                        before releasing the asset to avoid loss.
                                    </p>
                                    <p className="my-5">
                                        I confirm that I am the account holder ‘Myeong-Woo Woo’. In
                                        addition, we do not engage in any illegal activities such as
                                        voice phishing and money laundering. We only conduct secure
                                        cryptocurrency transactions. If it is related to illegal
                                        activities, please notify us and we will cancel the order
                                        immediately. thank you. Hello, Thank you for placing order.
                                        My name on bank account is 우명우 which matches with name on
                                        binance. I do NOT want to be involved in anything illegal
                                        such as money laundry or any type of fraud. So if you are
                                        trying to do any of illegal action, please tell me then i
                                        will cancel the order right away. I only use binance as a
                                        safe trading channel for crypto currency.
                                    </p>
                                </div>
                                <hr className="warning-border" />

                                <div className="sellbtc-contact">
                                    <form>
                                        <input
                                            type="text"
                                            className="w-100"
                                            placeholder="Write Message......"
                                        />
                                    </form>
                                    <div className="col-auto">
                                        <Attachments_modal></Attachments_modal>
                                    </div>
                                    <div className="col-auto">
                                        <Link to="#" className="float-left">
                                            <i className="far fa-comment-dots"></i> Frequently used
                                            phrases
                                        </Link>
                                    </div>
                                </div>

                                <div className="sellbtc-send-btn">
                                    <Send_modal></Send_modal>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    ) : (
        <>No data found</>
    );
}