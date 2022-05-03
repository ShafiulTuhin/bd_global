import { Form, Formik } from "formik";

function BankTransfer() {
  return (
    <Formik>
      {({
        values,
        isSubmitting,
        handleSubmit,
        handleChange,
        handleBlur,
        touched,
        errors,
      }) => <Form></Form>}
    </Formik>
  );
}
export default Object.assign(BankTransfer, {});
