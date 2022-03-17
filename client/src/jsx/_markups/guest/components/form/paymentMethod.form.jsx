import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import Checkbox from "@mui/material/Checkbox";
import useServiceContextHook from "../../../_hooks/service.context.hook";
import { useEffect } from "react";
// import country_list from "country-list";
import { SERVICE } from "../../../_constants";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
/**
 * @function Remove - Bank detail removal form
 * @param {Object} params
 * @returns
 */
export function Remove({ action, callback, payload = {} }) {
  const { t } = useTranslation();
  return <>Delete method</>;
}

/**
 * @function Update - Bank detail modifier form
 * @param {Object} param0
 * @returns
 */
export function Update({ action, services, callback, payload }) {
  const initialValues = {};

  return (
    <Formik
      {...{ initialValues }}
      validate={validateInput}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let { data, error } = await action(values?.id, values);
          handleResponse(!!data, () => callback(data));
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
      }) =>
        initialValues?.id ? (
          <Form onSubmit={handleSubmit}>
            <Button
              variant="primary"
              disabled={!hasChanges || isSubmitting}
              block
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </Form>
        ) : (
          "Detail ID not provided"
        )
      }
    </Formik>
  );
}

/**
 * @function Create - Bank detail Creator form
 * @param {Object} param0
 * @returns
 */
export function Create({ action, services, callback }) {
  const { t } = useTranslation();
  const {
    services: { profile },
    useService,
    session,
  } = useServiceContextHook();

  /*  useEffect(() => {
    currencyService.dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        "filter[type]": "FIAT",
      },
    });
  }, []); */

  return (
    <Formik
      initialValues={{}}
      validate={validateInput}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let { data, error } = await action(values);
          handleResponse(!!data, () => callback(data));
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
          <Button variant="primary" disabled={isSubmitting} block type="submit">
            {isSubmitting ? "Saving..." : "Save"}
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

/**
 * @function validateInput
 * @param {Object} values
 * @returns
 */
function validateInput(values) {
  const errors = {};

  if (!values?.account_no) {
    errors.account_no = "Account number is required";
  }
  if (!values?.bank_name) {
    errors.bank_name = "Bank name is required";
  }
  if (!values?.currency) {
    errors.currency = "Currency is required";
  }

  if (!values?.bank_code) {
    errors.bank_code = "Bank code is required";
  }
  return errors;
}

function hasChanges(old, changes) {
  old = Object.values(old)?.join("");
  changes = Object.values(changes).join("");
  return old !== changes;
}
