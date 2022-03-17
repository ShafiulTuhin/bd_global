import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import Checkbox from "@mui/material/Checkbox";
import { useEffect } from "react";
import useServiceContextHook from "../../../_hooks/service.context.hook";
// import country_list from "country-list";
import { SERVICE } from "../../../_constants";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
import { notify } from "../../../_helpers/notify";
import { deepObjectStringify } from "../../../_helpers";
/**
 * @function Remove - Bank detail removal form
 * @param {Object} params
 * @returns
 */
export function Remove({ action, callback, payload = {} }) {
  const { t } = useTranslation();
  return (
    <Formik
      initialValues={{
        confirm: false,
        id: payload?.id || null,
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let { data, error, message } = await action(values?.id, {
            force: values?.force,
          });
          if (error) throw new Error(message || "Request error");
          handleResponse(!!data, () => callback(data));
        } catch (error) {
          toast.error("Error! Cannot complete operation");
          // console.error(error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, isSubmitting, handleSubmit, handleChange }) =>
        values?.id !== null ? (
          <Form onSubmit={handleSubmit}>
            <strong className="text-danger text-center d-block">
              This operation will permanently delete this item. Continue?
            </strong>
            <Form.Group className="mt-3 mb-1">
              <Checkbox
                id="delete_bankdetail"
                name="confirm"
                onChange={handleChange}
              />
              <Form.Label htmlFor="delete_bankdetail">
                I understand the implications of my action
              </Form.Label>
            </Form.Group>

            <Button
              variant="primary"
              disabled={isSubmitting || !values?.confirm}
              block
              type="submit"
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </Form>
        ) : (
          <>No ID provided</>
        )
      }
    </Formik>
  );
}

/**
 * @function Update - Bank detail modifier form
 * @param {Object} param0
 * @returns
 */
export function Update({ action, services, callback, payload }) {
  const initialValues = {
    id: payload?.id,
    // account_no: payload?.account_no || "",
    bank_name: payload?.bank_name || "",
    // currency: payload?.currency || "",
    swift_code: payload?.swift_code,
  };
  const {
    services: { currency },
    useService,
  } = useServiceContextHook();

  const currencyService = useService({
    [SERVICE?.FIND]: currency.find,
  });

  useEffect(() => {
    currencyService.dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        "filter[type]": "FIAT",
      },
    });
  }, []);

  return (
    <Formik
      {...{ initialValues }}
      validate={validateInput}
      onSubmit={async (values, { setSubmitting }) => {
        const actual = {
          bank_name: values?.bank_name,
          swift_code: values?.swift_code,
        };

        try {
          let { data, error } = await action(values?.id, actual);

          console.log(error);

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
            {/* <Form.Group className="mb-4" controlId="account_number">
              <Form.Label>Account number</Form.Label>
              <Form.Control
                type="text"
                name="account_no"
                required
                pattern="^\w{1,17}$"
                maxLength="17"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.account_no}
                placeholder="Account Number"
              />
              <small className="text-danger">
                {errors.account_no && touched.account_no && errors.account_no}
              </small>
            </Form.Group> */}

            <Form.Group className="mb-4" controlId="bank_name">
              <Form.Label>Bank name</Form.Label>
              <Form.Control
                type="text"
                name="bank_name"
                required
                minLength="3"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.bank_name}
                placeholder="Bank Name"
              />
              <small className="text-danger">
                {errors.bank_name && touched.bank_name && errors.bank_name}
              </small>
            </Form.Group>
            {/* 
            <Form.Group className="mb-4" controlId="currency">
              <Form.Label>Currency</Form.Label>
              <Form.Control
                as="select"
                type="text"
                name="currency"
                required
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.currency}
                placeholder="Currency"
              >
                <option>Select currency</option>
                {currencyService &&
                  currencyService?.data?.result.map((data, key) => {
                    return (
                      <option value={data?.iso_code} key={key}>
                        {data?.name} ({data?.iso_code?.toUpperCase()})
                      </option>
                    );
                  })}
              </Form.Control>

              <small className="text-danger">
                {errors.currency && touched.currency && errors.currency}
              </small>
            </Form.Group> */}

            <Form.Group className="mb-4" controlId="swift_code">
              <Form.Label>Swift Code</Form.Label>
              <Form.Control
                type="text"
                name="swift_code"
                required
                pattern="^[A-Za-z0-9]{8,11}$"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.swift_code}
                placeholder="Swift Code"
              />
              <small className="text-danger">
                {errors.swift_code && touched.swift_code && errors.swift_code}
              </small>
            </Form.Group>

            <Button
              variant="primary"
              disabled={!hasChanges(initialValues, values) || isSubmitting}
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
  const { bank_detail } = services;

  const { t } = useTranslation();
  const {
    services: { currency },
    useService,
    session,
  } = useServiceContextHook();

  const currencyService = useService({
    [SERVICE?.FIND]: currency.find,
  });

  useEffect(() => {
    currencyService.dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        filter: {
          type: "FIAT",
        },
      },
    });
  }, []);

  return (
    <Formik
      initialValues={{
        bank_name: "",
        swift_code: "",
        // currency: "",
      }}
      validate={validateInput}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          let {
            data,
            error,
            message = "Error while creating bank detail. Try again later",
          } = await action(values);

          if (!data) {
            throw new Error(error?.message || message);
          }

          handleResponse(!!data, () => callback(data));
        } catch (err) {
          // console.error(err);
          notify(err.message, "error");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        errors,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        touched,
      }) => (
        <form onSubmit={handleSubmit}>
          {/* <Form.Group className="mb-4" controlId="account_number">
            <Form.Label>Swift Code</Form.Label>
            <Form.Control
              type="text"
              name="account_no"
              required
              pattern="^\w{1,17}$"
              maxLength="17"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.account_no}
              placeholder="Swift Code"
            />
            <small className="text-danger">
              {errors.account_no && touched.account_no && errors.account_no}
            </small>
          </Form.Group> */}

          <Form.Group className="mb-4" controlId="bank_name">
            <Form.Label>Bank name</Form.Label>
            <Form.Control
              type="text"
              name="bank_name"
              required
              minLength="3"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.bank_name}
              placeholder="Bank Name"
            />
            <small className="text-danger">
              {errors.bank_name && touched.bank_name && errors.bank_name}
            </small>
          </Form.Group>

          {/* <Form.Group className="mb-4" controlId="currency">
            <Form.Label>Currency</Form.Label>
            <Form.Control
              as="select"
              type="text"
              name="currency"
              required
              onChange={handleChange}
              onBlur={handleBlur}
              defaultValue={values.currency}
              placeholder="Currency"
            >
              <option>Select currency</option>
              {currencyService &&
                currencyService?.data?.result?.length &&
                currencyService?.data?.result.map((data, key) => {
                  return (
                    <option value={data?.iso_code} key={key}>
                      {data?.name} ({data?.iso_code?.toUpperCase()})
                    </option>
                  );
                })}
            </Form.Control>
            <small className="text-danger">
              {errors.currency && touched.currency && errors.currency}
            </small>
          </Form.Group> */}

          <Form.Group className="mb-4" controlId="swift_code">
            <Form.Label>Swift Code</Form.Label>
            <Form.Control
              type="text"
              name="swift_code"
              required
              onChange={handleChange}
              onBlur={handleBlur}
              defaultValue={values.swift_code}
              placeholder="Swift Code"
            />
            <small className="text-danger">
              {errors.swift_code && touched.swift_code && errors.swift_code}
            </small>
          </Form.Group>

          <Button variant="primary" disabled={isSubmitting} block type="submit">
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
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

  // if (!values?.account_no) {
  //   errors.account_no = "Account number is required";
  // }
  if (!values?.bank_name) {
    errors.bank_name = "Bank name is required";
  }
  // if (!values?.currency) {
  //   errors.currency = "Currency is required";
  // }

  if (!values?.swift_code) {
    errors.swift_code = "Swift code is required";
  }
  return errors;
}

function hasChanges(old, changes) {
  old = deepObjectStringify(old);
  changes = deepObjectStringify(changes);
  return old !== changes;
}
