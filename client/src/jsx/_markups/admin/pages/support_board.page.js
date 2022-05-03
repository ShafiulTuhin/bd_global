import { Card, Row, Col, Button, Table, Badge, Form } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
import { toast } from "react-toastify";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import { useEffect } from "react";
import TableGenerator from "../components/tableGenerator.component";
import Moment from "react-moment";
import useToggler from "../../../_hooks/toggler.hook";
import { Popper } from "@mui/core";
import { useTranslation } from 'react-i18next'
import { ModalForm } from "../components/modalForm.component.jsx";
import BankDetailForm from "../forms/bankdetail.form";
import { Switch } from "@mui/material";
// import ReactDatePicker from "react-datepicker";
import { useState } from "react";


function AdvertsManagement({ services, useService }) {
    const { t } = useTranslation()
    const { user, advert, faq } = services;

    let service = useService({
        [SERVICE?.RETRIEVE]: faq.findall,
        [SERVICE?.BULK_RETRIEVE]: faq.findall,
        [SERVICE?.FINDBYID]: faq.find,
        // [SERVICE?.UPDATE]: advert.updateByID,
        // [SERVICE?.DROP]: advert.removeByID,
        // [SERVICE?.CREATE]: advert.create,
        // [SERVICE?.FIND]: faq.find,
        [SERVICE?.REMOVEFAQ]: faq.deleteById,
    });

    const { dispatchRequest, retryDispatch, serviceMap } = service;

    const {
        isOpen: isModalOpen,
        onOpen: onOpenModal,
        onClose: onModalClose,
        toggledPayload: modalPayload,
    } = useToggler();

    function useFormRenderer(formData = { type: null, payload: null }) {

        const [title, form] = (() => {
            const action = serviceMap[formData?.type];
            try {
                switch (formData?.type) {
                    case SERVICE?.CREATE:
                        return [
                            t("Add new bank detail"),
                            // <div className="modal-dialog modal-confirm">
                            <div className="">

                                <div className=" flex-column">
                                    {/* <div className="icon-box">
                      <i className="material-icons">&#xE5CD;</i>
                    </div> */}
                                    <h4 className="modal-title w-100">Are you sure?</h4>
                                    {/* <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button> */}
                                </div>

                                <div >
                                    <p>Do you really want to delete these records? This process cannot be undone ok.</p>
                                </div>
                                <div className="modal-footer justify-content-center">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                    <button type="button" className="btn btn-danger" >Delete</button>
                                </div>

                            </div>
                            // </div>
                            // <BankDetailForm
                            //   {...{ services }}
                            //   action={action}
                            //   payload={formData?.payload}
                            //   callback={() => {
                            //     retryDispatch(SERVICE?.FIND);
                            //     onModalClose();
                            //   }}
                            // />,
                        ];
                    case SERVICE?.UPDATEBYID:
                        return [
                            t("Update bank detail"),
                            <BankDetailForm.Update
                                {...{ services }}
                                action={action}
                                payload={formData?.payload}
                                callback={() => {
                                    retryDispatch(SERVICE?.FIND);
                                    onModalClose();
                                }}

                            />,
                        ];
                    case SERVICE?.REMOVEBYID:
                        return [
                            t("Delete Bank details"),
                            <BankDetailForm.Remove
                                {...{ services }}
                                action={action}
                                payload={formData?.payload}
                                callback={() => {
                                    retryDispatch(SERVICE?.FIND);
                                    onModalClose();
                                }}
                            />,
                        ];
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

    useEffect(() => {
        dispatchRequest({
            type: SERVICE?.BULK_RETRIEVE,
            payload: {
                // fake: true,
                sudo: true,
                // where: {
                //   type: "sell",
                // },
            },
            toast: { success: notifySuccess, error: notifyError },
        });
    }, []);



    const history = useHistory()
    const redirectToEdit = (id) => {
        history.push(`/admin/support-register?id=${id}`);
    };

    const removeFaq = (id) => {

        // dispatchRequest({
        //     type: SERVICE?.REMOVEFAQ,
        //     payload: {
        //         // fake: true,
        //         sudo: true,
        //         // where: {
        //         //   type: "sell",
        //         // },
        //         id: id
        //     },
        //     toast: { success: notifySuccess, error: notifyError },
        // });
    }

    const [cate, setCate] = useState("")


    const [startdate, setstartDate] = useState("")

    const [enddate, setendDate] = useState("")


    const [question, setQuestion] = useState("")


    const onSearch = async () => {

        var query = "";

        if (question != "") {
            query += `where[question]=${question}&`
        }

        if (cate != "") {
            query += `where[category]=${cate}&`
        }
        if (startdate != "") {
            const sdate = new Date(startdate)
            var start = sdate.toISOString();
            query += `where[created_at][$lte]=${start}&`
        }
        if (enddate != "") {
            const edate = new Date(enddate)
            var end = edate.toISOString();
            query += `where[created_at][$gte]=${end}&`
        }



        // if (cate === "ALL") {
        //     console.log("all")
        //     dispatchRequest({
        //         type: SERVICE?.BULK_RETRIEVE,
        //         payload: {
        //             sudo: true
        //         },
        //         toast: { success: notifySuccess, error: notifyError },
        //     });
        // } else {

        dispatchRequest({
            type: SERVICE?.FINDBYID,
            payload: {
                query: query
            },
            toast: { success: notifySuccess, error: notifyError },
        });
        // retryDispatch(SERVICE?.FIND);
        // }

    }

    return (
        <>
            <PageTitle activeMenu="" motherMenu="Advert management" />
            <header className="mb-4">
                <h3>{t("Notice List")}</h3>
                <Link to="/admin/support-register" className="btn btn-outline-light" >Registration</Link>
            </header>
            <div
                style={{ marginBottom: 20, display: "flex", gap: 10, width: "100%", position: "relative" }}
            >
                <div
                    sm="auto"
                    style={{ padding: 0, marginLeft: "auto", display: "flex", gap: 10, rowGap: 10 }}
                >
                    <input className="form-control" placeholder="start date" type="date" id="date" aria-placeholder="aajj" onChange={(e) => { setstartDate(e.target.value) }} />
                    <input className="form-control" placeholder="end date" type="date" id="date" onChange={(e) => { setendDate(e.target.value) }} />
                </div>


            </div>


            <div
                style={{ marginBottom: 20, display: "flex", gap: 10, width: "100%", position: "relative" }}
            >
                <div
                    sm="auto"
                    style={{ padding: 0, marginLeft: "auto", display: "flex", gap: 10, rowGap: 10 }}
                >
                    <select>
                        <option value={true}>
                            ==Active Status==
                        </option>
                        <option value={true}>
                            {t("Activate")}
                        </option>
                        <option value={false}>
                            {t("Deactivate")}
                        </option>
                    </select>
                    <select onChange={(e) => { setCate(e.target.value) }}>
                        <option value="">
                            ==ALL CATEGORY==
                        </option>
                        <option value="User Guide">
                            User Guide
                        </option>
                        <option value="Frequently Asked Questions">
                            Frequently Asked Questions
                        </option>
                    </select>
                    <input type="text" className="form-control" placeholder="pleased select a search option" onChange={(e) => { setQuestion(e.target.value) }} />
                    <div className="input-group-append">
                        <button className="btn btn-primary" type="button" onClick={() => { onSearch() }} >Search</button>
                        <button type="button" className="btn btn-outline-info">reset</button>
                    </div>
                </div>
            </div>

            <div
                style={{ marginBottom: 20, display: "flex", gap: 10, width: "100%", position: "relative" }}
            >


                <div
                    sm="auto"
                    style={{ padding: 0, marginLeft: "auto", display: "flex", gap: 10, rowGap: 10 }}
                >
                    hello
                </div>
            </div>


            <ModalForm
                useFormRenderer={useFormRenderer}
                formData={modalPayload}
                isOpen={isModalOpen}
                onClose={onModalClose}
            ></ModalForm>

            <div style={{ marginBottom: 60 }}>
                <TableGenerator
                    {...{ service }}
                    omit="*"
                    extras={[
                        "category",
                        "subcategory",
                        "question",
                        "answer",
                        "link",
                        "registration_date",
                        "action",
                    ]}
                    transformers={{
                        subcategory: ({ row }) => row?.subcategory,
                        category: ({ row }) => row?.category,
                        question: ({ row }) => row?.question,
                        answer: ({ row }) =>
                            row?.answer ? row?.answer : "Unknown",
                        link: ({ row }) =>
                            row?.link ? row?.link : "Unknown",
                        registration_date: ({ row }) => (
                            <Moment format="MMM Do, Y, hh:mm A" date={row?.created_at} />
                        ) || "Unknown",
                        action: function Action({ row }) {
                            const [isInactive, setIsInactive] = useState(!!row?.archived_at);

                            async function onChangeActive(inactive) {
                                let status = null,
                                    response;
                                if (inactive) {
                                    // response = await currency.restoreByID(row?.id);
                                } else {
                                    // response = await currency.removeByID(row?.id);
                                }
                                status = response?.data && response?.data?.status;
                                if (status) {
                                    notifySuccess("Done");
                                    setIsInactive(!inactive);
                                } else notifyError("Operation is incomplete");
                            }
                            return (
                                <div className="d-flex" style={{ gap: 20 }}>
                                    {isInactive ? (
                                        <span className="badge light badge-danger">
                                            <i className="fa fa-circle text-danger mr-1" />
                                            Inactive
                                        </span>
                                    ) : (
                                        <span className="badge light badge-success">
                                            <i className="fa fa-circle text-success mr-1" />
                                            Active
                                        </span>
                                    )}
                                    <button
                                        disabled={isInactive}
                                        style={{
                                            appearance: "none",
                                            border: "none",
                                            background: "none",
                                        }}
                                        onClick={() => { redirectToEdit(row?.id) }}
                                    //   onClick={() =>
                                    //     onOpenModal({ type: SERVICE?.UPDATEBYID, payload: row })
                                    //   }
                                    >
                                        {/* onClick={() => {
                                        redirectToEdit(row?.id); */}
                                        <span className="themify-glyph-29"></span> Edit

                                    </button>

                                    {/* <button className="btn btn-danger" onClick={() => { removeFaq(row?.id) }}>Delete</button> */}
                                    <div className="" title="activate/deactivate">
                                        <Switch
                                            onChange={() => onChangeActive(isInactive)}
                                            name="force"
                                            id="activate-currency"
                                            size="small"
                                            checked={!isInactive}
                                        />
                                    </div>
                                </div>
                            );
                        },
                        // active: ({ row }) => row?.avtive ? <span className="badge light badge-danger">
                        //     <i className="fa fa-circle text-danger mr-1" />
                        //     Inactive
                        // </span> : <span className="badge light badge-success">
                        //     <i className="fa fa-circle text-success mr-1" />
                        //     Active
                        // </span>,
                        // action: function Action({ row }) {
                        //     const {
                        //         isOpen,
                        //         onOpen: onPopoverOpen,
                        //         onClose: onPopoverClose,
                        //         toggledPayload: popOverTarget,
                        //     } = useToggler();

                        //     const handleClick = (event) => {
                        //         console.log(event.target);
                        //         console.log(popOverTarget);
                        //         // alert("Gomand");
                        //         // onPopoverOpen(popOverTarge?t ? null : event.currentTarget);
                        //         onPopoverOpen(popOverTarget ? null : event.target);
                        //     };

                        //     /* const handleClose = () => {
                        //               onPopoverClose(null);
                        //             }; */

                        //     const open = Boolean(popOverTarget);
                        //     const id = open ? row?.id : undefined;

                        //     return (
                        //         <div
                        //             style={{
                        //                 display: "flex",
                        //                 gap: 10,
                        //             }}
                        //         >
                        //             <button
                        //                 style={{
                        //                     appearance: "none",
                        //                     border: "none",
                        //                     background: "none",
                        //                     fontSize: 12,
                        //                 }}
                        //                 onClick={() =>
                        //                     onOpenModal({ method: SERVICE?.UPDATE, payload: row })
                        //                 }
                        //             >

                        //                 {/* <span className="themify-glyph-29"></span> Edit */}
                        //             </button>
                        //             <button type="button" className="btn btn-outline-info" onClick={() => {
                        //                 redirectToEdit(row?.id);
                        //             }} >Edit</button>
                        //             {/* TODO: Delete user */}
                        //             {/* <button
                        //                 style={{
                        //                     appearance: "none",
                        //                     border: "none",
                        //                     background: "none",
                        //                     position: "relative",
                        //                     fontSize: 12,
                        //                 }}
                        //                 aria-describedby={id}
                        //                 variant="contained"
                        //                 onClick={handleClick}
                        //             >
                        //                 <span className="themify-glyph-165"></span> Deactive
                        //             </button> */}

                        //             {id && (
                        //                 <Popper id={id} open={isOpen} anchorEl={popOverTarget}>
                        //                     <ul
                        //                         className="bg-white shadow"
                        //                         style={{
                        //                             padding: 10,
                        //                         }}
                        //                     >
                        //                         <li>
                        //                             <a
                        //                                 href="#"
                        //                                 onClick={() =>
                        //                                     onOpenModal({
                        //                                         type: SERVICE?.CREATE
                        //                                         // method: SERVICE?.REMOVE,
                        //                                         // payload: { ...row, force: false },
                        //                                     })
                        //                                 }
                        //                             >
                        //                                 <small>Delete</small>
                        //                             </a>
                        //                         </li>
                        //                         <li>
                        //                             <a
                        //                                 href="#"
                        //                                 onClick={() =>
                        //                                     onOpenModal({
                        //                                         method: SERVICE?.REMOVE,
                        //                                         payload: { ...row, force: true },
                        //                                     })
                        //                                 }
                        //                             >
                        //                                 <small>Permanently delete</small>
                        //                             </a>
                        //                         </li>
                        //                     </ul>
                        //                 </Popper>
                        //             )}
                        //         </div>
                        //     );
                        // },
                    }}
                />
            </div>
        </>
    );
}

export default AdvertsManagement;

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
