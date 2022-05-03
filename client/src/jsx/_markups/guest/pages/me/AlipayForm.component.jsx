import React from "react";
import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import { TextField } from "@mui/material";

export function AlipayForm({ data = {}, onUpdate = () => null }) {
  const { alipay = {} } = data || {};

  const initialValues = {
    client_id: alipay?.client_id || "",
  };

  return (
    <Formik
      {...{ initialValues }}
      // validate={(values) => {}}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          onUpdate({ alipay: values });
        } catch (error) {
          console.error(error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values, errors, isSubmitting, handleSubmit, handleChange, handleBlur, touched,
      }) => (
        <Form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "column",
            padding: "10px 20px",
            gap: 20,
            justifyContent: "center",
          }}
        >
          <TextField
            size="small"
            variant="outlined"
            id="client_id"
            label="Alipay client ID"
            onChange={handleChange}
            defaultValue={values?.client_id} />

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving" : "Save"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
