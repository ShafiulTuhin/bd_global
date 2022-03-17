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
        [SERVICE?.RETRIEVE]: airdrop.find,
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

        const filter = {
            where: {
              ...(crypto && {
                currency:
                  String(crypto)?.toUpperCase()
              }),
            }
        }
        dispatchRequest({
            type: SERVICE?.RETRIEVE,
            payload: {
                sudo: true,
                ...filter,
                limit:10,
                offset:0
            },
            toast: { success: notifySuccess, error: notifyError },
        });
    }, []);



    const history = useHistory()
    const redirectToEdit = (id) => {
        history.push(`/admin/support-register?id=${id}`);
    };


    const [cryptoErr, setCryptoErr] = useState("")
    const [amtErr, setEmtErr] = useState("")
    const [resonErr, setResonErr] = useState("")
    const [question, setQuestion] = useState("")
    // const [userId, setserId] = useState("")

    const [crypto, setCrypto] = useState("BTC")
    const [userId, setUserId] = useState("")
    const [sDtae, setSDate] = useState("")
    const [eDtae, setEDate] = useState("")
    const [selectedDataStatus, setSelectedDataStatus] = useState(false)


    const onSearch = async () => {
        const filter = {
            where: {
              ...(crypto && {
                currency:
                  String(crypto)?.toUpperCase()
              }),
              ...(userId && {
                user_id: userId,
              }),
              ...(sDtae && {
                // const sdate = new Date(sDtae).toISOString()
                [`$user.created_at$`]: {$gte: new Date(new Date(sDtae)).toISOString()}
              }),
              ...(eDtae && {
                // const sdate = new Date(sDtae).toISOString()
                [`$user.created_at$`]: {$lte: new Date(new Date(new Date(eDtae).setHours(23, 59, 59, 999)).toString().split('GMT')[0] + ' UTC').toISOString()}
              }),

            },
          };
          if(sDtae != ''){
            filter.where[`$user.created_at$`]['$gte'] = new Date(new Date(sDtae)).toISOString()
          }
          if(eDtae != ''){
            filter.where[`$user.created_at$`]['$lte'] = new Date(new Date(new Date(eDtae).setHours(23, 59, 59, 999)).toString().split('GMT')[0] + ' UTC').toISOString();
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
        amount: null,
        reason: "",
        reason_detail: "",
        number_of_payment: null,
        user_id: []
    }

    const [formData, setFormData] = useReducer(formReducer, initialValues);

    const [payAmt, setPayAmt] = useState(0)

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
            case "reason_detail": {
                return { ...state, reason_detail: value };
            }
            case "number_of_payment": {
                return { ...state, number_of_payment: value };
            }
            case "user_id": {
                return { ...state, user_id: value };
            }
            default: {
                return state;
            }
        }
    }

    const sendDataToParent = (index) => { // the callback. Use a better name
        
        setFormData({ type: "user_id", value: index });         
        setFormData({ type: "number_of_payment", value: index.length });
    };




    useEffect(() => {
        
        if(formData.amount == null || formData.number_of_payment == null){
            setPayAmt(0)
        }else{
            const payAmount = formData?.amount && formData?.number_of_payment ? (parseFloat(formData?.number_of_payment) * parseFloat(formData?.amount)) : 0;
            setPayAmt((parseFloat(payAmount)))
        }
        // setPayAmt((parseFloat(formData?.number_of_payment) * parseFloat(formData?.amount)))
        // (parseFloat(formData?.number_of_payment) * parseFloat(formData?.amount))
    }, [formData.number_of_payment, formData.amount])

    const onSubmit = async () => {

        if (formData?.crypto == "") {
            // setCryptoErr("crypto is required")
            notifyError("Crypto is required", "error");
        }

        if (formData?.amount == "") {
            // setEmtErr("amount is required")
            notifyError("Amount is required", "error");
        }

        if (formData?.reason == "") {
            // setResonErr("reason is required")
            notifyError("Reason is required", "error");
        }

        if (formData?.user_id.length == 0) {
            notifyError("Please select user", "error");
        }

        if (formData?.crypto != "" && formData?.amount != "" &&
            formData?.reason != "" && formData?.user_id.length != 0) {
            try {
                const { error, data, message } = await airdrop.create({ ...formData, airdrop_type: "selected" })

                if (!data) throw new Error(error?.message || message);

                const filter = {
                    where: {
                      ...(crypto && {
                        currency:
                          String(crypto)?.toUpperCase()
                      }),
                    }
                }
                
                dispatchRequest({
                    type: SERVICE?.RETRIEVE,
                    payload: {
                        // fake: true,
                        sudo: true,
                        ...filter
                    },
                    toast: { success: notifySuccess, error: notifyError },
                });
                onReset();
                setSelectedDataStatus(true)
                notifySuccess("Airdrop Added succcessfully!");
            } catch (err) {
                notifyError(err.message, "error");
            }
        }

    }

    function onReset() {
        setFormData({ type: "crypto", value: "" });
        setFormData({ type: "amount", value: "" });
        setFormData({ type: "reason", value: "" });
        setFormData({ type: "reason_detail", value: "" });
    }
    const test =(stat) => {
        setSelectedDataStatus(stat)
    }


    return (
        <>
            <PageTitle activeMenu="Airdrop Create" motherMenu="Airdrop Management" />
            <header className="mb-4">
                <h3>Airdrop Management</h3>
                <p>Airdrop</p>
            </header>

            <div className="airdrop_management_wrap">
                <FormControl className="cm_select">
                    <CryptoCurrencySelector
                        all={true}
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
                <div className="col-xl-9">
                    <div className="airdrop_table">
                        <div style={{ marginBottom: 60 }}>
                            <TableGenerator
                                {...{ service }}
                                mapping={{
                                    id: "Airdrop ID",
                                    iso_code: "symbol",
                                }}
                                sendDataToParent={sendDataToParent}
                                // selectedData={{"data" :formData?.user_id,"status":setSelectedDataStatus}}
                                is_selected = {selectedDataStatus}
                                checkchange = {test}
                                bulkActions={true}
                                omit="*"
                                extras={["email_or_profile_name", "crypto", "registration_date", "total_payment", "latest_payment_date"]}
                                transformers={{
                                    email_or_profile_name: ({ row }) => row?.user?.profile?.pname || row?.user?.email,
                                    crypto: ({ row }) => row?.currency || "-",
                                    registration_date: ({ row }) => (
                                        <Moment format="MMM Do, Y" date={row?.user?.createdAt} />
                                    ) || "-",
                                    total_payment: ({ row }) => row?.airdrops.length && row?.airdrops[0]?.total_payment || "--",
                                    latest_payment_date: ({ row }) => row?.airdrops.length && (
                                        <Moment format="MMM Do, Y, hh:mm A" date={row?.airdrops[0]?.last_payment_date} />
                                    ) || "-",
                                    
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-xl-3">
                    <div className="input_right_form">

                        <div className="input_form_inner">
                            <div className="input_title">
                                Crypto
                            </div>
                            <div className="w-100">
                                <FormControl className="cm_select_right">
                                    <CryptoCurrencySelector
                                        attributes={{ value: formData?.crypto }}
                                        onChange={(value) => {
                                            setFormData({ type: "crypto", value });
                                        }}
                                    />
                                </FormControl>
                            </div>
                        </div>

                        <div className="input_form_inner">
                            <div className="input_title">
                                Amount
                            </div>
                            <div className="airdrop_text_input">
                                <TextField id="outlined-basic1" variant="filled"
                                    // defaultValue={formData?.amount}
                                    type="number"
                                    value={formData?.amount}
                                    onChange={(e) => {
                                        setFormData({ type: "amount", value: e.target.value });
                                    }} />
                            </div>
                        </div>

                        <div className="input_form_inner">
                            <div className="input_title">
                                Reason
                            </div>
                            <div className="airdrop_text_input">
                                <TextField id="outlined-basic2" variant="filled"
                                    value={formData?.reason}
                                    onChange={(e) => {
                                        setFormData({ type: "reason", value: e.target.value });
                                    }} />
                            </div>
                        </div>
                        <div className="input_form_inner">
                            <div className="input_title">
                                Reason Detail
                            </div>
                            <div className="airdrop_text_input">
                                <TextField id="outlined-basic2" variant="filled"
                                    value={formData?.reason_detail}
                                    onChange={(e) => {
                                        setFormData({ type: "reason_detail", value: e.target.value });
                                    }} />
                            </div>
                        </div>

                        <div className="input_form_inner">
                            <div className="input_title">
                                Number of Payment
                            </div>
                            <div className="airdrop_text_input">
                                <TextField id="outlined-basic3" variant="filled" value={formData?.number_of_payment} disabled />
                            </div>
                        </div>

                        <div className="input_form_inner">
                            <div className="input_title">
                                Payment Amount
                            </div>
                            <div className="airdrop_text_input">
                                <TextField id="outlined-basic4" variant="filled" value={payAmt} disabled />
                            </div>
                        </div>

                        <div className="pay_btn_wrap">
                            <button className="btn btn-primary" type="button" onClick={() => {
                                onSubmit();
                            }}>Pay to all</button>
                            <button className="btn btn-primary" type="button" onClick={() => {
                                onReset();
                            }}>Reset</button>
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





