import { Form, Button, Row, Col } from "react-bootstrap";
import { Formik, Form as FormikForm, Field } from "formik";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
// import country_list from "country-list";
import { toast } from "react-toastify";

import { useTranslation } from 'react-i18next'

import { useSelector } from 'react-redux';

// CREATOR FORM
export function Create({ action, callback }) {
  const { t } = useTranslation()
  return (
    <Formik
      initialValues={{
        email: "",
        admin: false,
      }}
      // validate={(values) => {}}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let { admin, email } = values;
          let access_level = admin ? 2 : 1;
          let { data } = await action({ access_level, email });
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
            <Form.Label as="strong">{t("Email address")}</Form.Label>
            <Form.Control
              type="email"
              name="email"
              required
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
              placeholder={t("Email address")}
            />
          </Form.Group>

          <Button variant="primary" disabled={isSubmitting} block type="submit">
            {isSubmitting ? t("Saving...") : t("Save")}
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
              <span> {t("Administrator")} </span>
              <Switch
                name="admin"
                checked={values?.admin}
                defaultValue={values?.admin}
                onChange={handleChange}
              />
            </Form.Label>
          </Form.Group>
        </Form>
      )}
    </Formik>
  );
}

// UPDATER FORM
export function Update({ action, callback, payload }) {
  const initialValues = {
    email: payload?.email || "",
    admin: payload?.isAdmin || false,
  };
  return (
    <Formik
      initialValues={initialValues}
      // validate={(values) => {}}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let { data } = await action(values);
          handleResponse(data && data?.status, () => callback(data));
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
            <Form.Label as="strong">Email address</Form.Label>
            <Form.Text>
              <strong className="text-primary">{initialValues?.email}</strong>
            </Form.Text>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <strong>Administrator </strong>
              <Switch
                name="admin"
                checked={values?.admin}
                defaultValue={values?.admin}
                onChange={handleChange}
              />
            </Form.Label>
          </Form.Group>
          <Button variant="primary" disabled={isSubmitting} block type="submit">
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

// REMOVAL FORM
export function Remove({ action, callback, payload: initialValues = {} }) {
  return (
    <Formik
      initialValues={{
        force: initialValues?.force || false,
        confirm: false,
      }}
      validate={(values) => { }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const { force } = values;
          let { success } = await action({ force });
          success && callback && callback();
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
          <div
            style={{
              display: "flex",
              marginBottom: 20,
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
              color: "#d33",
            }}
          >
            <span className="simple-trash" style={{ fontSize: 45 }}></span>
          </div>
          <strong className="d-block text-center ">
            You are about to delete the user with the following email address
          </strong>

          <ul className="d-block text-center">
            <li className="badge badge-default text-white">
              {initialValues?.email}
            </li>
          </ul>

          <strong className="d-block text-danger text-center my-1">
            {values?.force && "This is an irreversible action!"}
          </strong>
          <Form.Group className="mt-3 mb-1">
            <Checkbox id="confirm_del" name="confirm" onChange={handleChange} />
            <Form.Label htmlFor="confirm_del">
              I understand the implications of my action
            </Form.Label>
          </Form.Group>

          <Button
            variant="danger"
            disabled={isSubmitting || !values?.confirm}
            block
            type="submit"
          >
            {isSubmitting ? "Processing..." : "Confirm"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}


export default Object.assign(Create, {
  Remove,
  Update,
});

/**
 * @function handleResponse
 * @param {Boolean} response
 * @param {Function} callback
 */
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
