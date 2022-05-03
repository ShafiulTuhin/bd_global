import { Button, Col, Row, Table, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import TableGenerator from "../components/tableGenerator.component";
import { Switch } from "@mui/material";
import Moment from "react-moment";
import { useTranslation } from "react-i18next";
import { Badge } from "react-bootstrap";
import { notify } from "../../../_helpers/notify";
// COMPONENTS
import PageTitle from "../layouts/PageTitle";

// CONSTANTS
import { SERVICE } from "../../../_constants";

// HOOKS
import useServiceContextHook from "../../../_hooks/service.context.hook";
import useToggler from "../../../_hooks/toggler.hook";

import CurrencyForm from "../forms/currency.form";
// import { ModalForm } from "../components/modalForm.component.jsx";
import { ModalForm } from "../../_shared/components/modalForm.component";
import { Formik } from "formik";
import { Link } from "react-router-dom";
import { routeMap } from "../../guest/routes";

import { useSelector } from 'react-redux';
// import KycForm from "../components/form/kyc.form";

import KycForm from "../../guest/components/form/kyc.form"


function ToggleStatus({ row }) {
    const { t } = useTranslation();
    const {
        services: { kyc: kycService },
    } = useServiceContextHook();
    const [status, setStatus] = useState(row?.status);

    const KYCStatus = () =>
        String(status)?.toLowerCase() === "accepted" ? true : false;


    const {
        services: { security },
    } = useServiceContextHook();


    /**
     *
     * @param {Object} event
     * @param {Object} event.target
     */
    async function handleChange({ target }) {
        try {
            const newStatus = target?.checked ? "ACCEPTED" : "PENDING";

            let { data, error, message } = await kycService?.updateByUserAndType(
                row?.user_id,
                row?.type,
                {
                    status: newStatus,
                }
            );
            if (!data)
                throw new Error(error?.message || message || `Error updating KYC Type`);

            notify("Changes saved");
            setStatus(newStatus);
        } catch (err) {
            console.log(err);
            notify(err.message, "error");
        }
    }

    return (
        <>
            <small className="d-flex" style={{ gap: 10, alignItems: "center" }}>
                <Switch
                    color={"default"}
                    name={row?.id}
                    onChange={handleChange}
                    inputProps={{ "aria-label": "controlled" }}
                    checked={KYCStatus()}
                    size="small"
                />
                {KYCStatus() ? (
                    <small className="badge badge-success text-white">
                        <i className="fa fa-check-circle text-white mr-2" />
                        {t("completed")}
                    </small>
                ) : (
                    <small className="badge badge-warning text-white">
                        <i className="fa fa-circle text-white mr-2" />
                        {t("pending")}
                    </small>
                )}
            </small>
            {/* {row?.kyc && row?.kyc[key]?.status === "ACCEPTED" ? "Done" : "Pending"} */}
        </>
    );
}

function UserKYCMgmt() {

    const { toggledPayload, onOpen, onClose, isOpen } = useToggler();


    function useFormRenderer({ ...formData }) {
        return [
            "Google Authentication Verification",
            <KycForm.VerifyGoogleAuth initialValues={formData} onClose={onClose} />,
        ];
    }

    const {
        services: { kyc },
        useService,
    } = useServiceContextHook();
    const { t } = useTranslation();


    const [isInactive, setIsInactive] = useState(false);

    // const securityData = useSelector((state) => state.session.user.security);


    const {
        services: { security },
    } = useServiceContextHook();



    const [securityData, setSecurityData] = useState();



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
        });
        setConfirmation(obj);
    }


    useEffect(() => {
        fetchSecurity();
        // console.log("confirmations  : ",confirmations);

        return () => {
            security.abort();
        };
    }, []);




    const [confirmations, setConfirmation] = useState({
        login: { email: false, sms: false, otp: false },
        transaction: { email: false, sms: false, otp: false },
    });




    async function onConfirmationChange({ type, key, value }) {
        console.log(type, key, value)
        try {
            // send a request to update confirmation
            const newState = {
                ...confirmations,
                [type]: { ...confirmations[type], [key]: value },
            };
            let changes = {};
            // Transform confirmation object to array format
            Object.entries(newState)?.map(([key, value]) => {
                changes[key] = Object.keys(value)
                    ?.filter((k) => value[k])
                    .map((t) => String(t)?.toUpperCase());
            });

            let { data, error } = await security.updateByID(securityData?.id, {
                confirmations: changes,
            });
            if (error) throw new Error(error.message);
            if (data) {
                notify("Done", "success");
                setConfirmation(newState);
                fetchSecurity();
            }
        } catch (err) {
            console.error(err);
            notify(err.message, "error");
        }
    }


    const isSetDone = (value) => {
        if(value===true){
            fetchSecurity()
        }
    }


    return (
        <>

            <PageTitle activeMenu="KYC" motherMenu="User management" />
            <header
                className="mb-4 d-flex justify-content-between"
                style={{ flexWrap: "wrap" }}
            >
                <h3>{t("Setting")}</h3>
                <button className="btn">
                    {/* <i className="fa fa-arrow mr-2" /> */}
                    {t("Refresh")}
                </button>
            </header>

            <h1>Enable Google Auth</h1>
            {!securityData?.two_factor ? (
                <>
                    <Button onClick={() => onOpen()}>
                        <i className="fa fa-plus"></i> {t("Enable")}
                    </Button>
                </>
            )
                :

                <>
                    {securityData &&
                        confirmations &&
                        Object.entries(confirmations).map(([type, tvalue]) => {

                            return (
                                type === "transaction" ?
                                    <tr key={type}>
                                        <td className="text-capitalize">
                                            {t("Pleased Turn on if you want Google authentication for manager withdrawal")}{"- "}
                                        </td>

                                        {Object.entries(tvalue).map(([key, value]) => (
                                            key === "otp" ?
                                                < td key={`${type}-${key}`}>
                                                    {/* 
                                                    <Form.Check
                                                        type="switch"
                                                        // id={`switch-${type}-${key}`}
                                                        // name={`${type}-${key}`}
                                                        className="custom-switch-md "
                                                        onChange={() => {
                                                            onConfirmationChange({
                                                                type,
                                                                key,
                                                                value: !value,
                                                            });
                                                        }}
                                                        checked={confirmations[type][key]}
                                                    /> */}

                                                    <Switch
                                                        onChange={() => {
                                                            onConfirmationChange({
                                                                type,
                                                                key,
                                                                value: !value,
                                                            });
                                                        }}
                                                        // name="force"
                                                        id={`switch-${type}-${key}`}
                                                        name={`${type}-${key}`}
                                                        size="small"
                                                        checked={confirmations[type][key]}
                                                        disabled={(confirmations[type][key] == true) ? true : false}
                                                    />

                                                </td>
                                                : ""
                                        ))}
                                    </tr>
                                    : ""

                            );
                        })}
                </>
            }



            <ModalForm
                {...{ useFormRenderer, isOpen, onClose, formData: { ...toggledPayload, onClose, isSetDone } }}
            />
        </>
    );
}


export default UserKYCMgmt;
