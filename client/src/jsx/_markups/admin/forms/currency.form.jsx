import { Form, Button } from "react-bootstrap";
import { Switch } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { Formik } from "formik";
import { toast } from "react-toastify";
import FiatCurrencySelector from "../../_shared/components/input/FiatCurrencySelector.component";

import { useTranslation } from "react-i18next";
/**
 * @function Create - currency creation form
 * @param {Object} params
 * @param {Object} params.action
 * @param {Object} params.callback
 * @param {Object} params.payload
 * @returns
 */
function Create({ action, callback }) {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{
        iso_code: "",
        name: "",
        type: "",
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          values = { ...values, iso_code: values?.iso_code?.toUpperCase() };
          let response = await action(values);
          handleResponse(response, callback, {
            success: "Currency added",
            error: "Error adding currency",
          });
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
        setFieldValue,
      }) => (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formCurrencyCode">
            <Form.Label>
              <strong>{t("Currency Symbol")}</strong>
            </Form.Label>

            <FiatCurrencySelector
              all
              onlySymbol
              altTitle="Select currency"
              onChange={(v) => setFieldValue("iso_code", v)}
            />
            <Form.Text className="mt-2 text-muted">
              {t("ISO Code or Short name or Symbol")}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCurrencyName">
            <Form.Label>
              <strong>{t("Full name")}</strong>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              defaultValue={values?.name}
              onChange={handleChange}
              placeholder={t("Currency name")}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCurrencyType">
            <Form.Label>
              <strong>{t("Type")}</strong>
            </Form.Label>
            <Form.Control
              as="select"
              name="type"
              defaultValue={values?.type?.toLowerCase()}
              onChange={handleChange}
              aria-label={t("Select currency type")}
            >
              <option>{t("Select currency type")}</option>
              <option value="fiat">{t("Fiat")}</option>
              <option value="crypto">{t("Crypto")}</option>
            </Form.Control>
          </Form.Group>

          <Button
            variant="primary"
            disabled={isSubmitting && Object.values(values).length}
            block
            type="submit"
          >
            {isSubmitting ? t("Processing...") : t("Finish")}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

function hasChanges(old, changes) {
  old = Object.values(old)?.join("");
  changes = Object.values(changes).join("");
  return old !== changes;
}
/**
 * @function Update - Update currecny form
 * @param {Object} params
 * @param {Object} params.action
 * @param {Object} params.callback
 * @param {Object} params.payload
 * @returns
 */
function Edit(props) {
  const { action, callback, payload = {} } = props;
  const initialValues = {
    iso_code: payload?.iso_code || null,
    id: payload?.id || null,
    name: payload?.name || null,
    type: payload?.type || null,
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const { id, ...others } = values;
          let response = await action(id, values);
          handleResponse(response, callback);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, isSubmitting, handleSubmit, handleChange }) => (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formCurrencyCode">
            <Form.Label>
              <strong>Code</strong>
            </Form.Label>
            <Form.Control
              type="text"
              autoCapitalize="characters"
              name="iso_code"
              defaultValue={values?.iso_code}
              placeholder="Currency symbol"
              onChange={handleChange}
            />

            <Form.Text className="mt-2 text-muted">
              ISO Code or Short name or Symbol
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCurrencyName">
            <Form.Label>
              <strong>Full name</strong>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              defaultValue={values?.name}
              onChange={handleChange}
              placeholder="Currency name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCurrencyType">
            <Form.Label>
              <strong>Type</strong>
            </Form.Label>
            <Form.Control
              as="select"
              name="type"
              value={values?.type?.toLowerCase()}
              defaultValue={values?.type?.toLowerCase()}
              onChange={handleChange}
              aria-label="Select currency type"
            >
              <option>Select currency type</option>
              <option value="fiat">Fiat</option>
              <option value="crypto">Crypto</option>
            </Form.Control>
          </Form.Group>
          <Button
            variant="primary"
            disabled={isSubmitting || !hasChanges(initialValues, values)}
            block
            type="submit"
          >
            {isSubmitting ? "Processing..." : "Finish"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

/**
 * @function Remove - Currency removal from
 * @param {Object} params
 * @param {Function} params.action
 * @param {Function} params.callback
 * @param {Object} params.payload
 * @returns
 */
export function Remove(props) {
  const { action, callback, payload = { id } } = props;
  const id = payload?.id;
  return id ? (
    <Formik
      initialValues={{
        confirm: false,
        force: false,
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let { force } = values;
          let response = await action(id, { force });
          handleResponse(response, callback);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, isSubmitting, handleSubmit, handleChange }) => (
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
            <span className="simple-trash" style={{ fontSize: 70 }}></span>
          </div>
          <p className="">Are you sure you wish to proceed with this action?</p>

          <Form.Text controlId="delete_type" className="mt-3 mb-3">
            <label>
              <Checkbox name="confirm" onChange={handleChange} />I understand
              the implications of my action
            </label>
          </Form.Text>

          <Button
            variant="danger"
            disabled={isSubmitting || !values?.confirm}
            block
            type="submit"
          >
            {isSubmitting ? "Processing..." : "Confirm"}
          </Button>

          {/* <Form.Text controlId="delete_type" className="text-muted mt-3 ">
            <label
              htmlFor="force_remove"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Permanently delete</span>
              <Switch
                onChange={handleChange}
                name="force"
                id="force_remove"
                size="small"
                checked={values?.force}
              />
            </label>
          </Form.Text> */}
        </Form>
      )}
    </Formik>
  ) : (
    "Please provide valid ID"
  );
}

export default Object.assign(Create, {
  Remove,
  Edit,
});

/**
 * @function handleResponse
 * @param {Boolean} response
 * @param {Function} callback
 */
function handleResponse(
  response,
  callback,
  messages = {
    error: "Operation failed",
    success: "Operation completed successfully",
  }
) {
  let { data, error, message } = response;
  let options = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    closeButton: false,
  };
  if (!data)
    return toast.error(error?.message || message || messages?.error, options);
  else if (data?.status === undefined && !data?.status)
    return toast.error(messages?.error, options);

  toast.success(messages.success, options);
  callback(data);
}
