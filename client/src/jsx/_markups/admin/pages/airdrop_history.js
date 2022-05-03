import { Card, Row, Col, Button, Table, Badge, Form } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
import { toast } from "react-toastify";
import CryptoCurrencySelector from "../../_shared/components/input/CryptoCurrencySelector.component";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import { useEffect, useReducer } from "react";
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
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import '../../admin/common.css'


function Airdropmanagement({ services, useService }) {
    const { t } = useTranslation()
    const { user, advert, faq, airdrop } = services;

    let service = useService({
        [SERVICE?.RETRIEVE]: airdrop.history,
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
                            <div className="">

                                <div className=" flex-column">
                                    <h4 className="modal-title w-100">Are you sure?</h4>
                                </div>

                                <div >
                                    <p>Do you really want to delete these records? This process cannot be undone ok.</p>
                                </div>
                                <div className="modal-footer justify-content-center">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                    <button type="button" className="btn btn-danger" >Delete</button>
                                </div>

                            </div>
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
            type: SERVICE?.RETRIEVE,
            payload: {
                sudo: true,
                limit: 10,
                offset: 0
            },
            toast: { success: notifySuccess, error: notifyError },
        });
    }, []);



    const history = useHistory();

    const [crypto, setCrypto] = useState("")
    const [userId, setUserId] = useState("")
    const [sDtae, setSDate] = useState("")
    const [eDtae, setEDate] = useState("")

    const onSearch = async () => {
        const filter = {
            where: {
                ...(crypto && {
                    crypto:
                        String(crypto)?.toUpperCase()
                }),
                ...(userId && {
                    user_id: userId,
                }),
                ...(sDtae && {

                    created_at: { $gte: new Date(new Date(sDtae)).toISOString() }
                }),
                ...(eDtae && {

                    created_at: { $lte: new Date(new Date(new Date(eDtae).setHours(23, 59, 59, 999)).toString().split('GMT')[0] + ' UTC').toISOString() }
                }),

            },
        };
        if (sDtae != '') {
            filter.where.created_at['$gte'] = new Date(new Date(sDtae)).toISOString()
        }
        if (eDtae != '') {
            filter.where.created_at['$lte'] = new Date(new Date(new Date(eDtae).setHours(23, 59, 59, 999)).toString().split('GMT')[0] + ' UTC').toISOString()
        }
        dispatchRequest({
            type: SERVICE?.RETRIEVE,
            payload: {
                ...filter
            },
            toast: { success: notifySuccess, error: notifyError },
        });
    }


    const initialValues = {
        crypto: "",
        amount: "",
        reason: "",
        number_of_payment: "",
        userid: []
    }


    function formReducer(state, { type, value }) {
        // console.log({ type, value });
        switch (type) {
            case "crypto": {
                return { ...state, crypto: value };
            }
            case "amount": {
                return { ...state, amount: value };
            }
            case "reason": {
                return { ...state, reason: value };
            }
            case "number_of_payment": {
                return { ...state, number_of_payment: value };
            }
            case "userid": {
                return { ...state, userid: value };
            }

            default: {
                return state;
            }
        }
    }

    const sendDataToParent = (index) => { // the callback. Use a better name
      
        setFormData({ type: "userid", value: index });
        let a = [...formData?.userid, ...index]
        let unique = a.filter((item, i, ar) => ar.indexOf(item) === i);

    };

    const [formData, setFormData] = useReducer(formReducer, initialValues);


    return (
        <>
            <PageTitle activeMenu="Airdrop History" motherMenu="Airdrop Management" />
            <header className="mb-4">
                <h3>Airdrop Management</h3>
                <p>Airdrop</p>
            </header>

            <div className="airdrop_management_wrap">
                <FormControl className="cm_select">
                   
                    <CryptoCurrencySelector
                        attributes={{ value: crypto }}
                        onChange={(value) => {
                            setCrypto(value)
                        }}
                    />
                </FormControl>

                <TextField id="outlined-basic" label="Email Or Username" variant="outlined" className="center_input_mar" onChange={(e) => {
                    setUserId(e.target.value)
                }} />

                <div className="date_wrap">
                    <div className="date_title">
                        Condition
                    </div>
                    <TextField
                        variant="filled"
                        id="date"
                        type="text"
                        label=""
                        name="from"
                        fullWidth
                        className="text-box"
                        onChange={(e) => { setSDate(e.target.value) }}
                        onFocus={(e) => (e.currentTarget.type = "date")}
                        onBlur={(e) => (e.currentTarget.type = "text")}
                        placeholder="Starting Date"
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                    <div className="date_center">~</div>
                    <TextField
                        variant="filled"
                        id="date"
                        type="text"
                        label=""
                        name="from"
                        fullWidth
                        className="text-box"
                        onChange={(e) => { setEDate(e.target.value) }}
                        onFocus={(e) => (e.currentTarget.type = "date")}
                        onBlur={(e) => (e.currentTarget.type = "text")}
                        placeholder="Ending Date"
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                </div>
                <div className="input-group-append">
                    <button className="btn btn-primary" type="button" onClick={() => { onSearch() }} >Search</button>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-12">
                    <div className="airdrop_table">
                        <div style={{ marginBottom: 60 }}>
                            <TableGenerator
                                {...{ service }}
                                mapping={{
                                    id: "Airdrop ID",
                                    iso_code: "symbol",
                                }}
                                sendDataToParent={sendDataToParent}
                                // bulkActions={true}
                                omit="*"
                                extras={["email_or_profile_name", "crypto", "amount", "reason", "reason_detail", "airdrop_date", "person_who_airdropped"]}
                                transformers={{
                                    // wallet_id: ({ row }) => row?.type || "unknown",
                                    email_or_profile_name: ({ row }) => row?.user.profile?.pname || row?.user?.email,

                                    crypto: ({ row }) => row?.crypto || "-",
                                    amount: ({ row }) => row?.amount || 0,
                                    reason: ({ row }) => row?.reason || "",
                                    reason_detail: ({ row }) => row?.reason_detail || "",
                                    airdrop_date: ({ row }) => (
                                        <Moment format="MMM Do, Y, hh:mm A" date={row?.createdAt} />
                                    ) || "-",
                                    person_who_airdropped: ({ row }) => row?.author.profile?.pname || row?.author?.email,

                                }}
                            />
                        </div>
                    </div>
                </div>
                
            </div>
        </>
    );
}

export default Airdropmanagement;

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