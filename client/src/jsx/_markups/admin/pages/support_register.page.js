import { Card, Row, Col, Button, Table, Badge, Form, FormLabel } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
import { toast } from "react-toastify";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import { useEffect, useReducer, useState } from "react";
import TableGenerator from "../components/tableGenerator.component";
import Moment from "react-moment";
import useToggler from "../../../_hooks/toggler.hook";
import { Popper } from "@mui/core";
import { useTranslation } from 'react-i18next'
import { ModalForm } from "../components/modalForm.component.jsx";
import BankDetailForm from "../forms/bankdetail.form";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { Formik } from "formik";

import useServiceContextHook from "../../../_hooks/service.context.hook";
import { Selector } from "../../_shared/components/styled.component";

import useQuery from "../../../_hooks/query.hook";

function SupportRegister({ services }) {
    const { t } = useTranslation()
    // const { user, advert, faq } = services;

    // let service = useService({
    //     [SERVICE?.RETRIEVE]: faq.findall,
    //     // [SERVICE?.BULK_RETRIEVE]: advert.find,
    //     // [SERVICE?.UPDATE]: advert.updateByID,
    //     // [SERVICE?.DROP]: advert.removeByID,
    //     // [SERVICE?.CREATE]: advert.create,
    // });


    // const { dispatchRequest, retryDispatch, serviceMap } = service;

    const {
        isOpen: isModalOpen,
        onOpen: onOpenModal,
        onClose: onModalClose,
        toggledPayload: modalPayload,
    } = useToggler();

    function formReducer(state, { type, value }) {
        // console.log({ type, value });
        switch (type) {
            case "question": {
                return { ...state, question: value };
            }
            case "answer": {
                return { ...state, answer: value };
            }
            case "category": {
                return { ...state, category: value };
            }
            case "subcategory": {
                return { ...state, subcategory: value };
            }
            case "link": {
                return { ...state, link: value };
            }

            default: {
                return state;
            }
        }
    }

    const {
        services: { currency, faq },
        useService,
    } = useServiceContextHook();


    const initialValues = {
        question: "",
        answer: "",
        category: "",
        subcategory: "",
        link: ""
    }

    const DD1 = [
        { name: "User Guide", subcategory: ["Information Use", "Certification process", "deposit and withdrawal", "Information Use"] },
        { name: "Frequently Asked Questions", subcategory: ["Account", "Signup / Security Level / Withdrawal", "Transactions / Assets", "Deposit / Withdraw in KRW", "Digital asset deposit/withdrawal", "Digital asset misdeposit", "Kakao Pay", "Terms related to digital assets", "Other inquiries"] }
    ]


    const history = useHistory()

    const [selectdd1, setselectdd1] = useState([])
    const [ddl2, setddl2] = useState([])


    const [formData, setFormData] = useReducer(formReducer, initialValues);

    const selectChange = (e) => {
        if (e !== "") {
            setFormData({ type: "category", value: e });
            setselectdd1(e);
            const data = DD1.find((item) => { return item.name === e }).subcategory;
            setddl2(data)
        } else {
            setddl2([])
        }
    }

    const [queErr, setqueErr] = useState("")
    const [ansErr, setansErr] = useState("")
    const [catErr, setcatErr] = useState("")
    const [linkErr, setLinkErr] = useState("")
    const [subErr, setsubErr] = useState("")

    const { id, next } = useQuery();


    useEffect(async () => {
        try {
            if (id) {
                const param = { sudo: true }
                let { data, error, message } = await faq.findByID(id, param)

                if (!data) throw new Error(error?.message || message);

                if (data) {
                    setFormData({ type: "question", value: data?.question });
                    // setDefaultQue(data?.question)
                    setFormData({ type: "answer", value: data?.answer });
                    // setdefAns(data?.answer)
                    // setdefCat(data?.category)
                    setFormData({ type: "category", value: data?.category });
                    // setdefSub(data?.subcategory)
                    setFormData({ type: "subcategory", value: data?.subcategory });

                    setFormData({ type: "link", value: data?.link });
                    // setdeflink(data?.link)

                    const result = DD1.find((item) => {
                        return item.name === data?.category;
                    })
                    setddl2(result.subcategory)
                }
            }

        } catch (e) {
            console.log("Error", e)
        }
    }, [id])

    const onSubmit = async () => {

        const param = { sudo: true }

        if (formData?.question == "") {
            setqueErr("question is required")
        }

        if (formData?.answer == "") {
            setansErr("answer is required")
        }

        if (formData?.category == "") {
            setcatErr("category is required")
        }
        if (formData?.link == "") {
            setLinkErr("link is required")
        }
        if (formData?.subcategory == "") {
            setsubErr("subcategory is required")
        }
        
        if (id) {

            if (formData?.question != "" && formData?.answer != "" && formData?.category != "" && formData?.link != "" && formData?.subcategory != "") {
                try {
                    const { error, data, message } = await faq.updateByID(id, formData)
                    if (data) {
                        history.push("/admin/support-board")
                    }

                    if (!data) throw new Error(error?.message || message);
                    notifySuccess("Faq Added succcessfully!");
                } catch (err) {
                    notifyError(err.message, "error");
                }
            }

        } else {
            if (formData?.question != "" && formData?.answer != "" && formData?.category != "" && formData?.link != "" && formData?.subcategory != "") {
                try {
                    const { error, data, message } = await faq.create(param, formData)
                    if (data) {
                        history.push("/admin/support-board")
                    }

                    if (!data) throw new Error(error?.message || message);
                    notifySuccess("Faq Added succcessfully!");
                } catch (err) {
                    notifyError(err.message, "error");
                }

            }

        }
    }

    return (
      <>
        <PageTitle activeMenu="" motherMenu="Advert management" />
        <header className="mb-4">
          <h3>{t("Notice Registration & Edit")}</h3>
        </header>
        <></>

        <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
          <i className="fas fa-caret-right"></i>
          <Form.Label>question</Form.Label>
          <Form.Control
            type="text"
            name="question"
            required
            minLength="3"
            defaultValue={formData?.question}
            onChange={(e) => {
              setFormData({ type: "question", value: e.target.value });
            }}
          />
          <small className="text-danger">{queErr}</small>
        </Form.Group>

        <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
          <i className="fas fa-caret-right"></i>
          <Form.Label>answer</Form.Label>
          <Form.Control
            type="text"
            name="answer"
            required
            minLength="3"
            defaultValue={formData?.answer}
            // onChange={(e) => {}
            // onChange={() => setFormData({ type: "answer", value })}

            onChange={(e) => {
              setFormData({ type: "answer", value: e.target.value });
            }}
          />
          <small className="text-danger">{ansErr}</small>
        </Form.Group>

        <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
          <i className="fas fa-caret-right"></i>
          <Form.Label>Category</Form.Label>
          <Selector
            name="category"
            value={formData?.category}
            onChange={(e) => {
              selectChange(e.target.value);
            }}
          >
            <option value="">Select Category</option>
            {DD1.map((item, idx) => (
              <option
                key={idx}
                value={item.name}
              >
                {item.name}
              </option>
            ))}
          </Selector>

          <small className="text-danger">{catErr}</small>
        </Form.Group>

        <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
          <i className="fas fa-caret-right"></i>
          <Form.Label>subcategory</Form.Label>

          <Selector
            name="subcategory"
            // value={defSub}
            onChange={(e) => {
              setFormData({ type: "subcategory", value: e.target.value });
            }}
          >
            <option value="">select subcategory</option>
            {ddl2.map((item) => (
              <option value={item} selected={formData?.subcategory === item}>
                {item}
              </option>
            ))}
          </Selector>

          <small className="text-danger">{subErr}</small>
        </Form.Group>

        <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
          <i className="fas fa-caret-right"></i>
          <Form.Label>link</Form.Label>
          <Form.Control
            type="text"
            name="link"
            required
            minLength="3"
            defaultValue={formData?.link}
            onChange={(e) => {
              setFormData({ type: "link", value: e.target.value });
            }}
            // onChange={handleChange}
            // onBlur={handleBlur}
            // value={values?.link}
            // placeholder="Bank Name"
          />
          <small className="text-danger">{linkErr}</small>
        </Form.Group>

        {/* <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
                            <i className="fas fa-caret-right"></i>
                            <Form.Label>Active Status</Form.Label>
                            <br />
                  

                            <RadioGroup
                         
                                onChange={handleChange}
                                row
                                aria-label="active_status"
                                onBlur={handleBlur}
                                name="active_status"
                                id="active_status"
                            >
                                <FormControlLabel
                                    value="active"
                                    control={<Radio />}
                                    label="Active"
                                />
                                <FormControlLabel
                                    value="deactive"
                                    control={<Radio />}
                                    label="Deactive"
                                />
                            </RadioGroup>
                            <small className="text-danger">
                                {errors && touched && errors.active_status}
                            </small>
                        </Form.Group> */}
        <br />

        <Form.Group className="mb-4 col-xl-6 col-lg-6" controlId="bank_name">
          <Button
            variant="primary"
            onClick={() => {
              onSubmit();
            }}
          >
            Save
          </Button>{" "}
          <Link to="/admin/support-board" className="btn btn-primary">
            List
          </Link>
        </Form.Group>
        {/* </form>
                )}
            </Formik> */}
      </>
    );
}

export default SupportRegister;

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

function validateInput(values) {
    const errors = {};

    if (!values?.question) {
        errors.question = "question is required";
    }

    if (!values?.answer) {
        errors.answer = "answer is required";
    }

    if (!values?.answer) {
        errors.category = "answer is required";
    }
    if (!values?.link) {
        errors.link = "answer is required";
    }
    if (!values?.subcategory) {
        errors.subcategory = "subcategory is required";
    }

    return errors;
}