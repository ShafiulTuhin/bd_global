import React, { useEffect, useState, useRef, useCallback } from "react";
import { Badge, Button, Modal } from "react-bootstrap";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";

// import { } from "lodash";
import { Link, useParams } from "react-router-dom";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { notify } from "../../../../_helpers/notify";
import CopyToClipboard from "react-copy-to-clipboard";

import term_error_icon from "../../app-assets/images/icon/term-error-icon.png";
import term_upload_icon from "../../app-assets/images/icon/term-upload-icon.png";
import term_doc_icon from "../../app-assets/images/icon/term-doc-icon.png";
import moment from "moment";
import "@fortawesome/fontawesome-free/css/all.min.css";
// import Loader from "../../../_shared/components/Loader.component";
import "./order.id.scss";
// import { routeMap } from "../../routes";
import { Formik } from "formik";
import { FormLabel, RadioGroup, Radio, FormControlLabel } from "@mui/material";
import FileUpload from "../../../_shared/components/input/FileUpload.component2";

import FeedbackComponent from "../../../_shared/components/Feedback.component";
import { differenceInMinutes, parseISO } from "date-fns";
import numeral from "numeral";
import Loader from "../../../_shared/components/Loader.component";

function ConfirmTrade({ data }) {
  // onDemand = {onDemand}
  // console.log(onDemand())
  const {
    services: { order },
    session: { user },
  } = useServiceContextHook();

  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [check, setCheck] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const params = useParams();

  function onInputCheckBoxChange(e) {
    setCheck(e.target.checked);
  }

  async function onOrderConfirm(cb) {
    try {
      setIsLoading(true);
      if (check) {
        const {
          data: _data,
          error,
          message = "Error in order confirmation",
        } = await order.confirm(params.id);

        if (!_data) throw new Error(error.message || message);

        setShowButton(false);
        typeof cb == "function"
          ? cb()
          : (() => {
              notify("Order confirmed!");
            })();
      }
    } catch (err) {
      console.error(err);
      notify(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }
  const [isBuyer, setIsBuyer] = useState(null);

  useEffect(() => {
    const advert_type = String(data?.advert?.type)?.toLowerCase();
    // if owner of order and payment not confirmed
    if (user?.id === data?.user?.id && !data?.order_user_confirm) {
      setShowButton(true);
    } else if (
      // owner of ad and advert not confirmed
      !data?.advert_user_confirm &&
      user?.id === data?.advert?.user?.id
    ) {
      setShowButton(true);
    }
    if (advert_type === "sell")
      setIsBuyer(user?.id === data?.advert?.user?.id ? false : true);
    else
      setIsBuyer(
        advert_type === "buy" && user?.id === data?.advert?.user?.id
          ? true
          : false
      );
  }, []);

  function handleConfirmationEvent({ type }) {
    switch (type) {
      case "buyer": {
        onOrderConfirm(() => {
          notify(
            "Order has been successfully confirmed. Please wait for the other party to confirm."
          );
          setShow(false);
        });
        break;
      }
      case "seller": {
        onOrderConfirm(() => {
          notify("Release Successfully");
          setShow(false);
        });
        break;
      }
      default: {
        console.error("Error! user order role is unknown!");
      }
    }
  }
  return (
    data && (
      <>
        {showButton && isBuyer !== null ? (
          <button
            style={{ flex: "1" }}
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => setShow(true)}
          >
            {isBuyer ? "I have paid" : "I have received payment"}
          </button>
        ) : null}

        <Modal
          show={show}
          onHide={() => setShow(false)}
          className="confirmReleaseModal"
        >
          <Modal.Body>
            <div className="con-icon text-center">
              <img src={term_error_icon} alt="exclamation-triangle icon" />
              <h4>{isBuyer ? "Confirm payment " : "Confirm release"}</h4>
            </div>
            <div className="con-content pt-3">
              {isBuyer ? (
                <p className="lead"></p>
              ) : (
                <p className="lead">
                  ATTENTION! Please be sure to LOG IN THE RECEIVING
                  (e.g.Banks/eWallet) ACCOUNT to confirm that the money has
                  arrived in the"Available Balance"
                </p>
              )}
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
                  htmlFor="coin-checked"
                >
                  {isBuyer
                    ? `I hereby confirm that the payment was made to the seller`
                    : `I hereby confirm that the payment is successfully received
                  with correct amount and sender information.`}
                </label>
                {!check && (
                  <span className="text-danger">
                    Please tick the checkbox to proceed!
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                columnGap: 8,
                padding: "8px 0",
              }}
            >
              <button
                disabled={isLoading}
                type="button"
                className="btn btn-primary "
                onClick={() =>
                  handleConfirmationEvent({
                    type: isBuyer ? "buyer" : "seller",
                  })
                }
              >
                Confirm release
              </button>
              <button
                disabled={isLoading}
                type="button"
                className="btn btn-light btn-sm"
                onClick={() => setShow(false)}
              >
                Cancel
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    )
  );
}

function DisputeTrade({ setData }) {
  const {
    services: { order, upload },
    session: { user },
  } = useServiceContextHook();
  const params = useParams();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const initialValues = {
    reason: "",
    detail: null,
    files: null,
  };

  function validate(values) {
    console.log(values);
    const errors = {};
    if (!values?.reason) {
      errors.reason = `Required field`;
    }
    if (values?.reason == "Other reasons" && !values?.detail) {
      errors.detail = `Required field`;
    }
    // if (!values?.detail) {
    //   errors.detail = `Required field`;
    // }
    // if (values?.files?.length == 0) {
    //   errors.files = `Required field`;
    // }
    // if (values?.files?.length > 4) {
    //   errors.files = `Only 4 image is allow`;
    // }
    return errors;
  }

  function handleResponse(response, successMessage, errorMessage) {
    try {
      const { data, error, message = "Encountered unknown error" } = response;
      if (!data) throw new Error(errorMessage || error?.message || message);
      notify(successMessage);
      return data;
    } catch (err) {
      notify(<div className="text-capitalize">{err.message}</div>, "error");
      return null;
    }
  }

  async function onSubmit(values, { setSubmitting }) {
    let { id } = params;
    setSubmitting(true);

    let uploads = await Promise.all(
      values?.files?.map(async (value, index) => {
        console.log(value, index);
        let formData = new FormData();
        formData.append("file", value?.file);
        let response = await upload.create(formData);
        let data = handleResponse(
          response,
          `${value?.file?.name} image upload completed!`,
          `${value?.file?.name} upload unsuccessful! Try again`
        );
        return data;
      })
    ).catch(console.error);

    try {
      let { data, error, message } = await order.dispute(id, {
        ...(values.detail && { description: values.detail }),
        ...(uploads?.length && { images: uploads }),
        ...(values.reason && { reason: values.reason }),
      });
      if (!data) throw new Error(error?.message || message);
      notify(
        "Dispute registered successfully! A system administrator will contact you shortly!"
      );
      setData({ status: "DISPUTED" });
      handleClose();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        style={{ flex: "1" }}
        className="btn btn-danger btn-lg"
        onClick={handleShow}
      >
        Dispute trade
      </button>

      <Modal show={show} onHide={handleClose} className="disputeReportModal">
        <Modal.Header closeButton={false} className="col-md-12 modal-header">
          <div className="">
            {/* <img src={term_logo_01_icon} className="w-auto" alt="" /> */}
            <h1 className="lead h4">Report Dispute</h1>
          </div>
        </Modal.Header>

        <Modal.Body className="">
          <Formik {...{ initialValues, validate, onSubmit }}>
            {({
              values,
              isSubmitting,
              setFieldValue,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexDirection: "column",
                    flex: "1",
                  }}
                >
                  {/* dispute reason */}
                  <div>
                    <FormLabel component="legend">
                      Select dispute reason
                    </FormLabel>
                    <RadioGroup
                      defaultValue={values?.reason}
                      onChange={handleChange}
                      aria-label="gender"
                      onBlur={handleBlur}
                      name="reason"
                      id="reason"
                    >
                      <FormControlLabel
                        value="i`ve paid, but the seller hasn`t released the asset"
                        control={<Radio />}
                        label="i`ve paid, but the seller hasn`t released the asset"
                      />
                      <FormControlLabel
                        value="The seller didn`t comply with terms of trade"
                        control={<Radio />}
                        label="The seller didn`t comply with terms of trade"
                      />
                      <FormControlLabel
                        value="Other reasons"
                        control={<Radio />}
                        label="Other reasons"
                      />
                    </RadioGroup>
                    <small className="text-danger">
                      {errors && touched && errors.reason}
                    </small>
                  </div>

                  <textarea
                    onChange={handleChange}
                    style={{
                      borderRadius: "5px",
                      padding: 8,
                      border: "1px solid #ededed",
                    }}
                    rows="4"
                    placeholder="Write a description of the dispute"
                    name="detail"
                  ></textarea>
                  <small className="text-danger">
                    {errors && touched && errors.detail}
                  </small>

                  <FormLabel component="legend">
                    Upload evidence images(optional. 4 uploads maximum)
                  </FormLabel>
                  <FileUpload
                    setFieldValue={setFieldValue}
                    inputProps={{
                      files: values?.files,
                      id: "file-upload",
                      name: "files",
                    }}
                  ></FileUpload>
                  <small className="text-danger">
                    {errors && touched && errors.files}
                  </small>

                  {/* SUBMIT BUTTON */}
                  <button
                    disabled={Object.values(errors)?.length || isSubmitting}
                    type="submit"
                    className="btn btn-primary"
                  >
                    {isSubmitting ? <Loader></Loader> : "Finish"}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

function AttachmentModal(props) {
  const [show, setShow] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [progress, setProgress] = useState(0);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { services /* session */ } = useServiceContextHook();
  const { upload } = services;

  async function onAddButtonClick() {
    if (file != null) {
      setFileError("");
      const formData = new FormData();
      formData.append("file", file);

      upload
        .create(formData)
        .then((response) => {
          setProgress(100);
          const {
            data,
            error,
            message = "Encountered error while uploading data",
          } = response;
          if (!data) throw new Error(error.message || message);
          props.setAttachments(data);
          notify("Data Upload Successfully");
          handleClose();
          setProgress(0);
          setFile(null);
        })
        .catch((err) => {
          setProgress(0);
          setFile(null);
        });
    } else {
      setFileError("Please Select File");
    }
  }

  async function onInputFileChange(e) {
    let currentFile = e.target.files[0];
    setFile(currentFile);
  }

  return (
    <>
      <button type="button" className="btn" onClick={handleShow}>
        <i className="fas fa-paperclip"></i>
      </button>

      <Modal show={show} onHide={handleClose} className="attchmodal">
        <Modal.Body>
          <div className="att-title">
            <h2>Upload</h2>
          </div>
          <div className="drop-file-content py-4 px-3 d-flex justify-content-center align-items-center">
            <div className="upload-icon">
              <img src={term_upload_icon} className="pdf-icon" alt="" />
            </div>
            <div
              className="upload-icon-content truncate pl-3 "
              style={{ maxWidth: 300 }}
            >
              <div className="mb-0  ">
                {" "}
                {/* <strong>Drop files to attach, or</strong> <span>Browse</span> */}
                <input
                  type="file"
                  id="myfile"
                  name="myfile"
                  onChange={onInputFileChange}
                />
              </div>
              <p className="mb-0">(Individual file upload size limit 1MB)</p>
            </div>
          </div>
        </Modal.Body>
        <div className="main-upload-doc px-3">
          {file != null && (
            <div className="upload-doc my-2">
              <div className="row align-items-start">
                <div className="col-10">
                  <div className="uplod-doc-icon px-3 py-2 d-flex align-items-center">
                    <img src={term_doc_icon} alt="" />
                    <div className="pgl-content w-100">
                      <div className="pgl-title">
                        <p className="mb-0">{file?.name}</p>
                        {/* <ProgressBar now={progress} variant="info" /> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col px-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="close pt-2"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>{" "}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Modal.Footer>
          <Button type="button" variant="outline-cancel" onClick={handleClose}>
            Close
          </Button>
          <Button type="button" variant="primary" onClick={onAddButtonClick}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default function SingleOrder(props) {
  const {
    services: { order },
    session: { user },
  } = useServiceContextHook();
  const { socket } = useServiceContextHook();
  const chatBox = useRef();
  let timeout = null;

  const params = useParams();
  const [id, setID] = useState(null);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState([]);
  const [offset, setOffset] = useState(0);
  const [attachments, setAttachments] = useState(false);
  const [lastRead, setLastRead] = useState();
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [timer, setTimer] = useState(null);
  const [isCancel, setIsCancel] = useState(false);

  const addAttachment = (fileObject) => {
    setAttachments(fileObject);
  };

  const handleReadMessages = (messages) => {
    if (!messages.length) return false;

    for (let p = messages.length - 1; p >= 0; p--) {
      if (messages[p].read) {
        setLastRead(p);
        break;
      }
    }
  };

  const markRead = (res) => {
    socket.emit("message::read", {
      message_id: res.id,
    });
  };
  //Infinite scrolling
  function onScroll(e) {
    if (chatBox && chatBox.current) {
      const chat_box = chatBox.current;
      let element = e.target;
      let scrollPosition = element.scrollTop;
      if (scrollPosition == 0) {
        //Call Socket function to add more states
        let prevHeight = chat_box.scrollHeight;
        socket.emit(
          "message::fetch",
          {
            user_id:
              data?.advert?.user_id != user?.id
                ? data?.advert?.user_id
                : data?.user_id,
            order_id: data?.id,
            offset: offset * 20,
            limit: 20,
          },
          (res) => {
            if (res.rows?.length > 0) {
              res.rows = res.rows.reverse();
              setOffset(offset + 1);
              setShowMessage((prevState) => {
                return [...res.rows, ...prevState];
              });
              let newHeight = chat_box.scrollHeight;
              chat_box.scrollTo({
                top: newHeight - prevHeight,
                behavior: "smooth",
              });
              markRead(res.rows[res.rows.length - 1]);
            }
          }
        );
      }
    }
  }

  // Send message
  function sendMessage(e) {
    e.preventDefault();
    if (chatBox && chatBox.current && (message || attachments)) {
      const chat_box = chatBox.current;

      socket.emit(
        "message::send",
        {
          text: message,
          user_id:
            data?.advert?.user_id != user?.id
              ? data?.advert?.user_id
              : data?.user_id,
          order_id: data?.id,
          upload_id: attachments ? attachments?.id : null,
        },
        (res) => {
          let temp = true;
          showMessage.map((item) => {
            if (item.id == res.id && temp) temp = false;
          });
          if (temp) {
            setShowMessage((prevState) => {
              return [...prevState, res];
            });
            setMessage("");
            chat_box.scrollTo({
              top: chat_box.scrollHeight,
              behavior: "smooth",
            });
            setAttachments(false);
          }
        }
      );
    }
  }

  useEffect(() => {
    handleReadMessages(showMessage);
  }, [showMessage]);

  const cancelOrder = useCallback(async () => {
    if (data) {
      try {
        console.log("Cancelling order");
        await order.updateByID(data?.id, { status: "CANCELLED" });
        socket.emit("message::send", {
          text: `Order ${data?.id} is cancelled!`,
          user_id:
            data?.advert?.user_id != user?.id
              ? data?.advert?.user_id
              : data?.user_id,
          order_id: data?.id,
        });
        onDemand();
      } catch (err) {
        console.error(err);
      }
    }
  }, [data]);

  const onDemand = async () => {
    if (params) {
      try {
        setIsLoading(true);
        let { id } = params;
        setID(id);
        if (id) {
          let {
            data,
            error,
            message = "Error finding order",
          } = await order.findByID(id);

          if (!data) throw new Error(error?.message || message);
          setData(data);
          let diff = differenceInMinutes(
            parseISO(data?.blockage_expiring_date),
            parseISO(new Date()?.toISOString()),
            { roundingMethod: "floor" }
          );

          if (diff <= 0 || data?.status === "CANCELLED") setIsCancel(true);
          setTimer(diff);
          // setDefaultTime(data.created_at);
        }
      } catch (err) {
        setError(err?.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendDataToParent = (index) => {
    // the callback. Use a better name
    onDemand();
  };

  useEffect(onDemand, [params]);

  // Timer watcher
  useEffect(() => {
    if (timer && data) {
      timeout = setInterval(async () => {
        setTimer(
          differenceInMinutes(
            parseISO(data?.blockage_expiring_date),
            parseISO(new Date()?.toISOString()),
            { roundingMethod: "floor" }
          )
        );
        // Cancel order if timer expires and the order is not cancelled
        if (timer <= 0) {
          if (user?.id === data?.user_id && data?.status !== "CANCELLED") {
            cancelOrder();
          }
          clearInterval(timeout);
        }
      }, 10000);
    }
    return () => {
      clearInterval(timeout);
    };
  }, [timer]);

  // Data watcher
  useEffect(() => {
    function onSocketConnection(data) {
      let chat_box = chatBox;
      if (chat_box) {
        setIsLoadingMessages(true);
        socket.emit(
          "chat::join",
          {
            user_id:
              data?.advert?.user_id != user?.id
                ? data?.advert?.user_id
                : data?.user_id,
            order_id: data?.id,
          },
          (res) => {}
        );

        socket.emit(
          "message::fetch",
          {
            user_id:
              data?.advert?.user_id != user?.id
                ? data?.advert?.user_id
                : data?.user_id,
            order_id: data?.id,
          },
          (res) => {
            res.rows = res.rows.reverse();
            setOffset(offset + 1);
            setShowMessage(res.rows);
            if (res.rows.length > 0) {
              markRead(res.rows[res.rows.length - 1]);
            }
            chat_box?.current.scrollTo({
              top: chat_box?.current.scrollHeight,
              left: 0,
              behavior: "smooth",
            });
            setIsLoadingMessages(false);
          }
        );
        socket.on("message::new", (res) => {
          let temp = true;
          showMessage.map((item) => {
            if (item.id == res.id && temp) temp = false;
          });
          if (temp && chat_box?.current) {
            setShowMessage((prevState) => {
              return [...prevState, res];
            });
            chat_box?.current.scrollTo({
              top: chat_box?.current.scrollHeight,
              behavior: "smooth",
            });
            setTimeout(() => {
              markRead(res);
            }, 2000);
          }
        });
        socket.on("message::read", (res2) => {
          setShowMessage((prevState) => {
            return prevState.map((item) => {
              if (item.id == res2.id) item.read = true;
              return item;
            });
          });
        });
        socket.emit("message::lastread", {
          user_id:
            data?.advert?.user_id != user?.id
              ? data?.advert?.user_id
              : data?.user_id,
          order_id: data?.id,
        });
      }
      return socket;
    }
    if (data) {
      onSocketConnection(data);
    }
    return () => {
      socket.emit("chat::leave", {
        user_id:
          data?.advert?.user_id != user?.id
            ? data?.advert?.user_id
            : data?.user_id,
        order_id: data?.id,
      });
    };
  }, [data]);

  return (
    <div className="content">
      <div className="top_mast">
        <div className="container p-0">
          <section id="order_container">
            <div className="lhs ">
              {isLoading ? (
                <div>
                  <FeedbackComponent.Loading />
                </div>
              ) : data ? (
                <>
                  <div className="card_box ">
                    <header>
                      <p className="lead">{data?.user?.profile?.pname} </p>
                      <div
                        className="d-flex align-items-center mt-2"
                        style={{ columnGap: 4 }}
                      >
                        <Badge
                          variant={
                            String(data?.advert?.type)?.toLowerCase() === "buy"
                              ? "danger"
                              : "success"
                          }
                        >
                          <span className="text-capitalize">
                            {String(data?.advert?.type)?.toLowerCase() === "buy"
                              ? "seller"
                              : "buyer"}{" "}
                          </span>
                        </Badge>
                        <span className="divider"></span>
                        <small className="truncate">{data?.id}</small>
                      </div>
                    </header>
                    <div className="p-4">
                      <ul className="order_meta">
                        <li>
                          <span className="">Advert ID</span>
                          <strong className="truncate">
                            {data?.advert?.id}
                          </strong>
                        </li>
                        <li>
                          <span>Status</span>
                          <strong className="ml-1">
                            <Badge
                              pill
                              variant={(() => {
                                switch (String(data?.status)?.toLowerCase()) {
                                  case "cancelled": {
                                    return "danger";
                                  }
                                  case "completed": {
                                    return "success";
                                  }
                                  default:
                                    return "info";
                                }
                              })()}
                            >
                              {data?.status}
                            </Badge>
                          </strong>
                        </li>
                        <li>
                          <span className="">Creation time</span>
                          <strong className="ml-1 text-left">
                            {moment(data?.advert?.createdAt).format(
                              "YY/MM/DD HH:MM"
                            )}
                          </strong>
                        </li>

                        <li>
                          <span>Total</span>
                          <dl>
                            <strong
                              className={
                                String(data?.advert?.type)?.toLowerCase() ===
                                "buy"
                                  ? "text-success"
                                  : "text-danger"
                              }
                              style={{ fontSize: "1.25rem", fontWeight: 500 }}
                            >
                              {data?.advert?.total_qty}{" "}
                              <small>{data?.advert?.crypto}</small>
                            </strong>
                          </dl>
                        </li>
                        <li className="">
                          <span>Price</span>
                          <strong
                            className={
                              String(data?.advert?.type)?.toLowerCase() ===
                              "buy"
                                ? "text-success"
                                : "text-danger"
                            }
                            style={{ fontSize: "1.25rem", fontWeight: 500 }}
                          >
                            {data?.advert?.price}{" "}
                            <small>{data?.advert?.fiat}</small>
                          </strong>
                        </li>
                        <li>
                          <span>Amount</span>
                          <strong
                            className={
                              String(data?.advert?.type)?.toLowerCase() ===
                              "buy"
                                ? "text-success"
                                : "text-danger"
                            }
                            style={{ fontSize: "1.25rem", fontWeight: 500 }}
                          >
                            {data?.total_amount}{" "}
                            <small>{data?.advert?.fiat?.toUpperCase()}</small>
                          </strong>
                        </li>
                      </ul>

                      <div>
                        <span className="truncate order_meta_title">
                          Payment Methods
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          {data?.advert?.payment_methods?.map(
                            (method, iIndex) => {
                              return (
                                <ul
                                  className="payment_meta"
                                  key={iIndex}
                                  style={{
                                    border: "1px solid #e8e8e8",
                                    borderRadius: 8,
                                    padding: 15,
                                    gap: 10,
                                    flexDirection: "column",
                                  }}
                                >
                                  {data?.advert?.user?.profile?.payment_methods[
                                    String(method)?.toLowerCase()
                                  ] &&
                                    Object.entries(
                                      data?.advert?.user?.profile
                                        ?.payment_methods[
                                        String(method)?.toLowerCase()
                                      ]
                                    ).map(([key, value], jIndex) => {
                                      return (
                                        <li key={jIndex}>
                                          <span
                                            className="text-capitalize text-muted"
                                            style={{ opacity: 0.75 }}
                                          >
                                            {String(key)?.replace(/[-_]/g, " ")}
                                          </span>
                                          <div
                                            className="font-light"
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                              gap: 10,
                                            }}
                                          >
                                            <span className="d-block flex-grow">
                                              {value}
                                            </span>
                                            <CopyToClipboard
                                              text={value}
                                              onCopy={() =>
                                                notify(
                                                  <span>
                                                    Copied <code>{value}</code>{" "}
                                                    to clipboard
                                                  </span>
                                                )
                                              }
                                            >
                                              <i className="fal fa-copy cursor-pointer text-primary" />
                                            </CopyToClipboard>
                                          </div>
                                        </li>
                                      );
                                    })}
                                </ul>
                              );
                            }
                          )}
                        </div>
                        <div className="sellbtc-process">
                          <div>
                            {timer > 0 && (
                              <>
                                <p className="font-light">
                                  Payment timeout:&nbsp;
                                </p>
                                <strong
                                  className="lead text-primary"
                                  style={{ fontSize: 16 }}
                                >
                                  {numeral(timer).format("0,0[.]00")} minutes
                                  left
                                </strong>
                              </>
                            )}
                          </div>
                          {/* <p>Unpaid  {data?.advert?.payment_ttl_mins} minutes</p> */}
                          <small className="text-muted">
                            The {data?.advert?.crypto} will be held in the
                            escrow for {data?.advert?.payment_ttl_mins} mins.
                            And it will be return to the seller if this trade is
                            not paid in time
                          </small>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        background: "#e4e4e4",
                        gap: 10,
                        padding: "15px 0",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
                    >
                      {!["COMPLETED", "DISPUTED", "CANCELLED"].includes(
                        data?.status
                      ) ? (
                        <>
                          <ConfirmTrade
                            {...{ data, setData }}
                            sendDataToParent={sendDataToParent}
                          ></ConfirmTrade>
                          <DisputeTrade {...{ setData }}></DisputeTrade>
                        </>
                      ) : (
                        <div
                          className="p4 text-center text-muted"
                          style={{ flex: "1 auto" }}
                        >
                          {data?.status}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TIPS */}
                  <div className="card_box p-4">
                    <Tips />
                  </div>
                  {/* DISCLAIMER */}
                  <div className="card_box p-4">
                    <DisclaimerBox />
                  </div>
                </>
              ) : (
                <FeedbackComponent>
                  Order with ID: <code>${params?.id}</code> not found!`
                </FeedbackComponent>
              )}
            </div>
            <div className=" rhs sticky">
              <div className="card_box chat_box">
                <div
                  className="chat_box__top"
                  style={{ flex: 1, overflowY: "auto", padding: 15 }}
                  ref={chatBox}
                  onScroll={onScroll}
                >
                  {isLoadingMessages ? (
                    <FeedbackComponent.Loading />
                  ) : data && user?.id && !showMessage?.length ? (
                    <FeedbackComponent.Chat></FeedbackComponent.Chat>
                  ) : (
                    showMessage.map((item, index) => {
                      if (item.sender_id !== user?.id)
                        return (
                          <div key={index} className="recbubble-container">
                            <div className="recbubble my-2">
                              {item.UploadId != null &&
                              item.attachment != null &&
                              item.attachment.mimetype &&
                              item.attachment.mimetype ==
                                ("image/png" || "image/jpg" || "image/webp") ? (
                                <img
                                  className="bubbleImg"
                                  src={item?.attachment?.original?.url}
                                />
                              ) : (
                                ""
                              )}
                              {item.UploadId != null &&
                              item.attachment != "null" &&
                              item.attachment.mimetype &&
                              item.attachment.mimetype !=
                                ("image/png" || "image/jpg" || "image/webp") ? (
                                <Link
                                  to={`${item?.attachment?.original?.url}`}
                                  target="_blank"
                                  className="docIco"
                                >
                                  <img
                                    style={{ opacity: 0.5 }}
                                    src={term_doc_icon}
                                    alt={item?.attachment?.original?.filename}
                                  />
                                  &nbsp;<small>Download Attachment</small>
                                </Link>
                              ) : (
                                ""
                              )}
                              <span className="recbubbleText">{item.text}</span>{" "}
                              <span className="rectime">
                                {moment(item.createdAt).format("h:MM A")}
                              </span>
                            </div>
                            {/* ))} */}
                          </div>
                        );
                      else
                        return (
                          <div key={index} className="bubble-container">
                            <div className="bubble my-2">
                              {item.UploadId != null &&
                              item.attachment != null &&
                              item.attachment.mimetype &&
                              item.attachment.mimetype ==
                                ("image/png" || "image/jpg" || "image/webp") ? (
                                <img
                                  className="bubbleImg"
                                  src={item?.attachment?.original?.url}
                                />
                              ) : (
                                ""
                              )}
                              {item.UploadId != null &&
                              item.attachment != "null" &&
                              item.attachment.mimetype &&
                              item.attachment.mimetype !=
                                ("image/png" || "image/jpg" || "image/webp") ? (
                                <Link
                                  to={item?.attachment?.original?.url}
                                  target="_blank"
                                  className="docIco"
                                >
                                  <img
                                    style={{ opacity: 0.5 }}
                                    src={term_doc_icon}
                                    alt={item?.attachment?.original?.filename}
                                  />
                                  &nbsp;<small>Download Attachment</small>
                                </Link>
                              ) : (
                                ""
                              )}
                              <p className="bubbleText">{item.text}</p>
                              <p className="time">
                                {moment(item.createdAt).format("h:MM A")}
                                {item.read || index <= lastRead ? (
                                  <i className="fas fa-check-double ml-2"></i>
                                ) : (
                                  <i
                                    className="fa fa-check ml-2"
                                    aria-hidden="true"
                                  ></i>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                    })
                  )}
                </div>

                {!isCancel && data && (
                  <div className="chat_box__bottom">
                    <div className="attachment_box">
                      {attachments && (
                        <div className="attchmodal">
                          <div className="model-content">
                            <div className="row">
                              <div className="col-11">
                                <div className="uplod-doc-icon px-3 py-2 d-flex align-items-center">
                                  <img
                                    src={term_doc_icon}
                                    alt=""
                                    style={{ width: "20%" }}
                                  />
                                  <div className="pgl-content w-100">
                                    <div className="pgl-title">
                                      <p className="mb-0">
                                        {attachments?.original?.filename}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-1">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setAttachments(false);
                                  }}
                                  type="button"
                                  className="close btn-cl"
                                  aria-label="Close"
                                >
                                  <span aria-hidden="true">&times;</span>{" "}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* CHAT FORM */}
                    <form className="chat_form" onSubmit={sendMessage}>
                      <input
                        type="text"
                        className="w-100"
                        value={message}
                        onChange={(e) => {
                          e.preventDefault();
                          setMessage(e.target.value);
                        }}
                        placeholder="Write Message......"
                      />

                      <div className="col-auto">
                        <AttachmentModal
                          setAttachments={addAttachment}
                        ></AttachmentModal>
                      </div>

                      <div className="">
                        <button type="submit" className="btn btn-primary">
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <div className="card_box faq_box">
                <button type="button" className="">
                  <i className="far fa-comment-dots"></i> Frequently used
                  phrases
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
function DisclaimerBox() {
  return (
    <>
      <header>
        <h4 className="lead">Disclaimer</h4>
      </header>
      <div className="disclaimer">
        <p className="">
          Warning: Advertisers please beware of scammers who buy crypto from you
          and then report it to the bank later. Make sure you got your Ad's
          terms and conditions adequately provided. Advertisers please consider
          additional verification when necessary. Do NOT listen to any person
          who tells you to buy crypto and transfer to them later. Beware of
          voice phising scams. Sellers please note that you should only release
          crypto when you receive enough money in your account. Please check
          your bank account carefully. Buyer DO NOT write crypto-related content
          in the transfer remark. Buyers please click on Paid after successful
          transfer. Users please be aware of scams / suspicious behaviors.
          Report to Binance immediately if you find scammers
        </p>
        {/* <p className="my-3">
                    {data?.user?.profile?.pname}（real name：
                    {data?.user?.profile?.lname}）has marked the order as paid.
                    Please confirm that you have received the payment and
                    release the asset. Please note: Make sure to log into your
                    account and confirm that you have received the payment
                    before releasing the asset to avoid loss.
                  </p> */}
        <p className="my-3">
          I confirm that I am the account holder ‘Myeong-Woo Woo’. In addition,
          we do not engage in any illegal activities such as voice phishing and
          money laundering. We only conduct secure cryptocurrency transactions.
          If it is related to illegal activities, please notify us and we will
          cancel the order immediately. thank you. Hello, Thank you for placing
          order. My name on bank account is 우명우 which matches with name on
          binance. I do NOT want to be involved in anything illegal such as
          money laundry or any type of fraud. So if you are trying to do any of
          illegal action, please tell me then i will cancel the order right
          away. I only use binance as a safe trading channel for crypto
          currency.
        </p>
      </div>
    </>
  );
}
function Tips() {
  return (
    <>
      <header>
        <h4 className="lead">Tips</h4>
      </header>
      <div className="">
        <ol
          style={{
            fontSize: 12,
            display: "flex",
            rowGap: 12,
            flexDirection: "column",
          }}
        >
          <li>
            Please make sure to log in to your account to confirm the payment is
            received, this can avoid financial losses caused by wrongly clicking
            on the release button.
          </li>

          <li>
            The digital assets you are selling has been frozen by the platform.
            Please confirm the receipt of the payment from the buyer and click
            “release” to release the crypto.
          </li>
          <li>
            Please do not agree to any request to release the crypto before
            confirming the receipt of the payment to avoid financial losses.
          </li>
          <li>
            After receiving the SMS notification, please be sure to log in to
            your bank account to confirm whether the payment is credited, this
            will avoid the release of crypto due to Fraud SMS.
          </li>
        </ol>
      </div>
    </>
  );
}
