import React from "react";
import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import { TextField } from "@mui/material";

export function WechatForm({ data = {}, onUpdate = () => null }) {
  const { wechat = {} } = data || {};

  const initialValues = {
    wechat_id: wechat?.wechat_id || "",
  };
  return (
    <Formik
      {...{ initialValues }}
      // validate={(values) => {}}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          onUpdate({ wechat: values });
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
            id="wechat_id"
            label="Wechat ID"
            onChange={handleChange}
            defaultValue={values?.wechat_id} />

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving" : "Save"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
