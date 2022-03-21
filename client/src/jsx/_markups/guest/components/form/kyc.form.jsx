import { FormLabel, RadioGroup, Radio, FormControlLabel } from "@mui/material";
import { Formik, Form } from "formik";
import { useState, useEffect, useRef } from "react";
import { FormControl, Button, Alert } from "react-bootstrap";
import styled from "styled-components";
import { notify } from "../../../../_helpers/notify";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import PhoneNumber from "../../../_shared/components/input/PhoneNumber.component";
import FileUpload from "../../../_shared/components/input/FileUpload.component";
import UIColors from "../../../_shared/components/colors";

import speakeasy from "speakeasy";
import qrcode from "qrcode";

import {
  Cage,
  DecimalList,
  StyledSection,
} from "../../../_shared/components/styled.component";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import { log } from "../../../../_helpers/log";
import _constants from "../../../../_constants";
import CountrySelector from "../../../_shared/components/input/CountrySelector.component";
import CopyToClipboard from "react-copy-to-clipboard";

const InlineInput = styled("div")`
  display: flex;
  border: 1px solid #acacac;
  &:focus,
  &:focus-within {
    box-shadow: 0 0 0px 2px ${UIColors.primary};
    border-color: ${UIColors.primary};
  }
  input {
    flex: 1 auto;
    padding: 8px;
    &:hover,
    &:focus {
      border: none;
      outline: none;
      box-shadow: none;
    }
  }
  button {
    border: none;
    color: ${UIColors.primary};
    font-weight: bold;
    &:disabled {
      opacity: 0.5;
      color: ${UIColors.disabled};
    }
    &:hover,
    &:focus {
      border: none;
      outline: none;
      box-shadow: none;
    }
    padding: 8px;
  }
`;

function ModifyProfile({ formData = {} }) {
  const { onClose = () => null } = formData;
  const {
    services: { profile },
  } = useServiceContextHook();

  const initialValues = {
    pname: formData?.pname || "",
    gender: formData?.gender || "",
  };

  async function onSubmit(values, { setSubmitting }) {
    try {
      let { data, error, message } = await profile.update(values);
      if (!data) throw new Error(error?.message || message);
      notify("Profile updated successfully!");
      typeof onClose == "function" && onClose();
    } catch (err) {
      notify(err.message, "error");
    }
  }
  return (
    <Formik {...{ initialValues, onSubmit }}>
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
            {/* NICK NAME */}
            <label>Nickname</label>
            <FormControl
              placeholder="Nickname"
              onChange={handleChange}
              onBlur={handleBlur}
              defaultValue={values?.pname}
              // required
              name="pname"
              type="text"
            />

            <small className="text-danger">
              {errors && touched && errors.pname}
            </small>

            {/* GENDER */}
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup
              defaultValue={values?.gender}
              onChange={handleChange}
              row
              aria-label="gender"
              onBlur={handleBlur}
              name="gender"
              id="gender"
            >
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label="Other"
              />
            </RadioGroup>
            <small className="text-danger">
              {errors && touched && errors.gender}
            </small>

            {/* SUBMIT BUTTON */}
            <button
              disabled={isSubmitting || Object.keys(errors)?.length}
              type="submit"
              className="btn btn-primary mt-auto"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </Formik>
  );
}

/**
 *
 * @param {Object} props
 * @param {Function} props.onClose
 * @returns
 */
function VerifyID({ onClose = () => null }) {
  const {
    session: { user },
    actions,
    services: { kyc, upload, profile, address },
  } = useServiceContextHook();

  const initialValues = {
    front: null,
    rear: null,
    oname: undefined,
    lname: undefined,
    date_of_birth: undefined,
    address_line: undefined,
    zipcode: undefined,
    country: undefined,
  };

  /*  async function fetchData() {
    try {
      let { data, error, message } = await kyc.find({
        "filter[type]": "ID",
      });
      if (!data)
        throw new Error(error?.message || message || "Error fetching kyc data");
      let kycData = data?.result[0];
      if (kycData) setData(kycData?.kyc?.id);
    } catch (err) {
      notify(err?.message, "error");
    }
  } */

  function validate(values) {
    // console.log(values)
    const errors = {};

    if (!values?.front) {
      errors.front = `Required field`;
    }

    if (!values?.rear) {
      errors.rear = `Required field`;
    }

    if (!values?.date_of_birth) {
      errors.dob = `Required field`;
    } else {
      if (!new Date(values?.date_of_birth)) errors.dob = `invalid date`;
    }

    if (!values?.country) {
      errors.country = "Country is required";
    }

    if (!values?.lname) {
      errors.lname = `Required field`;
    } else {
      if (values?.lname.length < 2)
        errors.lname = `Must be at least (2) characters long`;
    }

    if (!values?.address_line) {
      errors.address_line = `Required field`;
    } else {
      if (values?.address_line.length < 2)
        errors.address_line = `Must be at least (2) characters long`;
    }
    // address
    return errors;
  }
  /**
   *
   * @param {Object} param.data
   * @param {Error} param.error
   * @param {String} param.message
   * @param {String} successMessage
   * @param {String} errorMessage
   */
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
    const { front, rear, lname, oname, date_of_birth, ...address_fields } =
      values;
    try {
      setSubmitting(true);

      // Send all promises =============================================================================
      await Promise.all([
        profile.update({ lname, oname, date_of_birth }).then((data) => {
          actions.user.update({ profile: { ...user?.profile, oname, lname } });
          return handleResponse(data, `Profile updated!`);
        }),

        !user?.address
          ? address.create(address_fields).then((data) => {
              actions.user.update({ address: data?.address });
              return handleResponse(data, `Address created!`);
            })
          : address.update(address_fields).then((data) => {
              actions.user.update({ address: address_fields });
              return handleResponse(data, `Address updated`);
            }),
      ]).catch(console.error);

      let uploads = await Promise.all(
        Object.entries({ front, rear })?.map(async ([key, value]) => {
          let formData = new FormData();
          formData.append("file", value);
          let response = await upload.create(formData);
          let data = handleResponse(
            response,
            `${key} image upload completed!`,
            `${key} upload unsuccessful! Try again`
          );
          return data;
        })
      ).catch(console.error);

      // Set ID Kyc
      let {
        data,
        error,
        message = "Error creating ID KYC",
      } = await kyc.create({
        type: "ID",
        uploads,
      });
      if (!data) throw new Error(error?.message || message);
      notify("ID KYC submitted successfully!");
      onClose && typeof onClose == "function" && onClose();
    } catch (err) {
      notify(err?.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  /* useEffect(() => {
    fetchData();
  }, []); */
  return (
    <Formik {...{ initialValues, validate, onSubmit }}>
      {({
        values,
        isSubmitting,
        setFieldValue,
        handleSubmit,
        errors,
        touched,
        handleChange,
        handleBlur,
      }) => (
        <form /* onSubmit={handleSubmit} enctype="multipart/form-data" */>
          <div
            style={{
              display: "flex",
              gap: 30,
              flexWrap: "wrap",
              flex: "1",
            }}
          >
            <div
              style={{
                flex: "1 auto",
                display: "flex",
                flexDirection: "column",
                gap: 30,
              }}
            >
              <div>
                <p>Front side</p>
                <FileUpload
                  altText="ID front photo (Click to select file)"
                  onChange={([v]) => setFieldValue("front", v)}
                  inputProps={{
                    files: values?.front,
                    id: "file-upload",
                    name: "front",
                  }}
                />
                <small className="text-danger">
                  {errors && touched && errors.front}
                </small>
              </div>
              {/*  <FileUpload
              altText="ID surface photo (Click to select file)"
              onChange={([v]) => setFieldValue("surface", v)}
              inputProps={{
                files: values?.surface,
                id: "file-upload",
                name: "surface",
              }}
            /> */}
              <div>
                <p>Rear side</p>
                <FileUpload
                  altText="Rear ID photo (Click to select file)"
                  onChange={([v]) => setFieldValue("rear", v)}
                  inputProps={{
                    files: values?.rear,
                    id: "file-upload",
                    name: "rear",
                  }}
                />
                <small className="text-danger">
                  {errors && touched && errors.rear}
                </small>
              </div>
            </div>
            <div
              style={{
                flex: "1 auto",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* LAST NAME */}
              <label>Last name</label>
              <FormControl
                placeholder="Last name"
                onChange={handleChange}
                onBlur={handleBlur}
                defaultValue={values?.lname}
                required
                name="lname"
                type="text"
              />
              <small className="text-danger">
                {errors && touched && errors.lname}
              </small>
              {/* Other names */}
              <label>Other names</label>
              <FormControl
                placeholder="Other names"
                onChange={handleChange}
                onBlur={handleBlur}
                defaultValue={values?.oname}
                // required
                name="oname"
                type="text"
              />
              <small className="text-danger">
                {errors && touched && errors.oname}
              </small>

              {/* {/ DOB /} */}
              <label>Date of Birth</label>
              <FormControl
                placeholder="Date of Birth"
                max={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                onBlur={handleBlur}
                defaultValue={values?.date_of_birth}
                type="date"
                // required
                name="date_of_birth"
              />
              <small className="text-danger">
                {errors && touched && errors.dob}
              </small>

              <label>Address</label>
              <FormControl
                placeholder="Address"
                onChange={handleChange}
                onBlur={handleBlur}
                defaultValue={values?.address_line}
                // required
                name="address_line"
                type="text"
              />
              <small className="text-danger">
                {errors && touched && errors.address_line}
              </small>
              <label>Country</label>
              <CountrySelector
                onChange={(v) => setFieldValue("country", v)}
                altTitle="Select country"
                attributes={{ name: "country", value: values?.country }}
              />
              <small className="text-danger">
                {errors && touched && errors.country}
              </small>

              <label>Zip Code</label>
              <FormControl
                placeholder="Zip Code"
                onChange={handleChange}
                onBlur={handleBlur}
                defaultValue={values?.pin}
                // required
                name="zipcode"
                type="number"
              />
              <small className="text-danger">
                {errors && touched && errors.zip}
              </small>
            </div>
          </div>

          {/* {/ SUBMIT BUTTON /} */}
          {/* <InlineInput>
              <input placeholder="Address" type="text" name="address" />
            </InlineInput> */}
          {/* <p>Birth Date</p>
            <InlineInput>
              <input type="date" />
            </InlineInput> */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "15px 0 0",
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              type="button"
              className="btn btn-primary mt-auto font-bold py-2 px-4"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </Formik>
  );
}

function VerifyMail({ formData = { data: {}, onChange: () => null } }) {
  const {
    services: { auth },
    session,
  } = useServiceContextHook();

  const emailBox = useRef();
  const [isSending, setSending] = useState(false);
  const initialValues = {
    email: "",
    code: "",
  };

  useEffect(() => {
    if (emailBox.current) emailBox.current.focus();
  }, []);

  async function sendOTP(email) {
    try {
      setSending(true);
      let { data, error, message } = await auth.send_otp(
        JSON.stringify({ id: session?.user?.id, email })
      );
      if (!data) throw new Error(error?.message || message);

      if (data?.status) {
        notify(`An OTP has been sent to your email address: ${email}`);
      } else notify(`Could not contact mail server`);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSending(false);
    }
  }

  function validate(values) {
    const errors = {};
    if (!values?.code) errors.code = "Code is required";
    if (initialValues?.email === values?.email)
      errors.email = `${values?.email} is already in use!`;
    if (!values?.email) errors.email = "Email is required";
    return errors;
  }

  async function onVerify(values, { setSubmitting }) {
    try {
      setSubmitting(true);
      let { data, error, message } = await auth.verify_email(
        JSON.stringify(values)
      );
      if (!data)
        throw new Error(
          error?.message || message || "Operation not completed!"
        );

      if (data && data?.status) {
        formData.onChange(values);
        notify("Email confirmed successfully!");
      } else notify("Invalid code", "error");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Formik {...{ initialValues, onSubmit: onVerify, validate }}>
      {({
        values,
        isSubmitting,
        touched,
        errors,
        handleChange,
        handleBlur,
        isValid,
      }) => (
        <Form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {formData?.data?.email && (
            <div style={{ display: "flex", gap: 5 }}>
              <strong style={{ fontWeight: "bold" }}>Current:</strong>
              <span>{formData?.data?.email}</span>
            </div>
          )}
          <InlineInput>
            <input
              ref={emailBox}
              placeholder="Email address"
              type="email"
              name="email"
              onChange={handleChange}
              defaultValue={values?.email}
              onBlur={handleBlur}
              disabled={isSending}
            />
            <button
              onClick={() => sendOTP(values?.email, formData?.onChange)}
              type="button"
              disabled={isSending || errors?.email || !values?.email}
            >
              {isSending ? "Sending..." : "Send code"}
            </button>
          </InlineInput>
          <small className="text-danger">{errors && errors?.email}</small>

          <InlineInput>
            <input
              placeholder="OTP code"
              type="text"
              name="code"
              maxLength={6}
              onBlur={handleBlur}
              onChange={handleChange}
              defaultValue={values?.code}
            />

            <button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Checking..." : "Confirm code"}
            </button>
          </InlineInput>
          <small className="text-danger">
            {errors && touched && errors?.code}
          </small>
        </Form>
      )}
    </Formik>
  );
}

function VerifyPhone(formData = { phone: "", onChange: () => null }) {
  const {
    services: { auth },
    session,
  } = useServiceContextHook();
  const phoneBox = useRef();
  const [isSending, setSending] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const initialValues = {
    phone: "",
    code: "",
    errors: {},
  };
  const [timer, setTimer] = useState(0);
  const { onClose = () => null } = formData;
  useEffect(() => {
    let timeout = null;

    if (timer) {
      timeout = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [timer]);

  useEffect(() => {
    if (phoneBox.current) phoneBox.current.focus();
  }, []);

  async function sendOTP(phone) {
    try {
      setSending(true);
      let { data, error, message } = await auth.sendOTP(
        JSON.stringify({ id: session?.user?.id, phone, type: "phone" })
      );

      if (!data) throw new Error(error?.message || message);

      if (data?.errors.timeout) {
        notify(data?.errors?.timeout?.message);
        setTimer(data?.time_left || 60);
        return;
      }
      if (data?.errors.sms) {
        notify(data?.errors?.sms?.message || `Could not contact SMS server`);
        return;
      }
      setTimer(data?.time_left || 60);
      notify(`An OTP has been sent to ${phone}`);
      setIsOTPSent(true);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSending(false);
    }
  }

  async function onVerify(values, { setSubmitting }) {
    try {
      const { errors, ...rest } = values;
      setSubmitting(true);
      let { data, error, message } = await auth.verifySMSOTP(
        JSON.stringify(rest)
      );
      if (!data)
        throw new Error(
          error?.message || message || "Operation not completed!"
        );

      if (data && data?.status) {
        notify("Phone confirmed successfully!");
        typeof onClose() == "function" && onClose();
      } else notify("Invalid code", "error");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Formik
      {...{
        initialValues,
        onSubmit: onVerify,
        validate(values) {
          return values?.errors;
        },
      }}
    >
      {({
        values,
        isSubmitting,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        handleSubmit,
        errors,
        setErrors,
        isValid,
      }) => (
        <Form
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
          onSubmit={handleSubmit}
        >
          {isOTPSent ? (
            <>
              <FormControl
                placeholder="OTP code"
                type="text"
                name="code"
                maxLength={6}
                onBlur={handleBlur}
                onChange={handleChange}
                defaultValue={values?.code}
              />

              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting ? "Checking..." : "Confirm code"}
              </Button>
              <small className="text-danger">
                {errors && touched && errors?.code}
              </small>
            </>
          ) : (
            <>
              <PhoneNumber
                {...{ defaultValue: values?.phone, name: "phone" }}
                ref={phoneBox}
                onChange={(v) => setFieldValue("phone", v)}
                onError={(v) => setFieldValue("errors", v)}
              />
              <Button
                onClick={() => sendOTP(values?.phone, errors)}
                type="button"
                disabled={isSending || timer || Object.keys(errors).length}
              >
                {timer ? `Retry in ${timer}s` : "Send code"}
              </Button>
            </>
          )}

          {/* <Button variant="contained">Save</Button> */}
        </Form>
      )}
    </Formik>
  );
}

function VerifyGoogleAuth(formData) {
  const {
    services: { auth },
    session,
    history,
  } = useServiceContextHook();

  const [qrdata, setqrdata] = useState("");
  const [secret, setSecret] = useState("");

  const [isSet,_isSet]=useState(false)


  if (
    formData.initialValues.isSetDone &&
    typeof (formData.initialValues.isSetDone === "function")
  ) {
   formData.initialValues.isSetDone(isSet);
  }




  const [ascii, setAscii] = useState("");
  const { onClose = () => null } = formData;
  const steps = [
    {
      label: "Get Authenticator app",
      content: (
        <StyledSection>
          <DecimalList className="px-4">
            <li>
              <h3 className="h6">Install a verification app on your phone</h3>
              <p>
                You will need to use a verification app such as Google
                Authenticator, Authy or Duo. Install from your app store.
                {/* <a href="#" className="d-block">
                  <span className="fas fa-exclamation-circle"></span>&nbsp;Don't
                  have a smart phone?
                </a> */}
              </p>
            </li>
            <li>
              <Cage>
                <h3 className="h6">Open app?</h3>
                <button onClick={nextStep} className="btn btn-primary">
                  Yes I am ready to scan code
                </button>
              </Cage>
            </li>
          </DecimalList>
        </StyledSection>
      ),
    },
    {
      label: "Connect phone",
      content: (
        <StyledSection>
          <Cage>
            <div className="mx-auto">
              <figure>
                <img
                  src={qrdata}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </figure>
            </div>
            {/* <figure>
              <QRCode value={arda} size={100} />
            </figure> */}

            <button onClick={nextStep} className="btn btn-primary">
              Save recovery code
            </button>
            <button onClick={prevStep} className="btn">
              Go back to instructions
            </button>
          </Cage>
        </StyledSection>
      ),
    },
    {
      label: "Save recovery key",
      content: (
        <StyledSection>
          <Cage>
            <Alert variant="warning">
              <div
                style={{
                  display: "inline-flex",
                  gap: 10,
                  alignItems: "baseline",
                }}
              >
                <span className="fas fa-exclamation-circle"></span>
                <p>
                  Copy and save secret in a save place. The secret will be used
                  to recover your account, in case you cannot access the Google
                  Authenticator app
                </p>
              </div>
            </Alert>
            <div
              className=""
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                backgroundColor: "#ededed55",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <span
                style={{ flexGrow: "1", flexShrink: 1 }}
                className="truncate"
              >
                {secret}
              </span>
              <button className="btn btn-primary">
                <CopyToClipboard
                  text={secret}
                  onCopy={() => notify("Copied to clipboard")}
                >
                  <i className="fa fa-copy" title="copy to clipboard"></i>
                </CopyToClipboard>
              </button>
            </div>
            <button
              onClick={() => {
                SaveRecovery();
              }}
              className="btn btn-primary"
            >
              Finish
            </button>
          </Cage>
        </StyledSection>
      ),
    },
  ];

  useEffect(() => {
    const secret = speakeasy.generateSecret({
      name: "P2PElim",
    });
    qrcode.toDataURL(secret.otpauth_url, (err, data) => {
      setqrdata(data);
    });
    setSecret(secret.ascii);
    setAscii(secret.ascii);
  }, []);

  const SaveRecovery = async () => {
    try {
      const payload = {
        secret: ascii,
        encoding: "ascii",
      };

      let response = await auth.registerGoogleAuth(payload);

      const { data, message } = response;

      if (!data) throw new Error(message || "Encountered error!");
      _isSet(true)
      notify("Google authenticator has been set successfully!");
      typeof onClose() == "function" && onClose();
    } catch (e) {
      // console.error({ e });
      notify(e?.message, "error");
    }
  };

  function prevStep() {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  }

  function nextStep() {
    if (activeStep < steps.length) setActiveStep(activeStep + 1);
  }
  const [activeStep, setActiveStep] = useState(0);
  return (
    <div>
      <ul
        style={{
          display: "flex",
          gap: 15,
          padding: "15px 0",
          justifyContent: "space-evenly",
          width: "100%",
        }}
      >
        {steps.map((step, idx) => (
          <li
            key={idx}
            style={{
              ...(activeStep === idx && { color: UIColors.primary }),
              displat: "flex",
              flex: "1",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <span className="fas fa-circle"></span>
            <small className="d-block">{step.label}</small>
          </li>
        ))}
      </ul>

      <div>{steps[activeStep].content}</div>
    </div>
  );
}

const KycForm = Object.assign(VerifyID, {
  VerifyMail,
  VerifyGoogleAuth,
  ModifyProfile,
  VerifyPhone,
});

export default KycForm;
