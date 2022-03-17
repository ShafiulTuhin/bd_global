import React, { useEffect, useState } from "react";
import _constants from "../../../../_constants";
import useQuery from "../../../../_hooks/query.hook";
import { useTranslation } from "react-i18next";
import { routeMap } from "../../routes";

// HOOKS
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import AuthForm from "../../components/form/auth.form";
import { notify } from "../../../../_helpers/notify";
import { isWithinInterval } from "date-fns";

export default function () {
  const { session, history } = useServiceContextHook();

  const query = useQuery();

  useEffect(() => {
    if (session?.user) history.push(routeMap?.home);
  }, [session]);

  useEffect(() => {
    if (query && query?.email) setShowFeedback(true);
  }, [query]);

  const [showFeedback, setShowFeedback] = useState(false);

  return showFeedback ? (
    <Feedback></Feedback>
  ) : (
    <AuthForm.Register></AuthForm.Register>
  );
}

function Feedback() {
  const {
    services: { auth },
  } = useServiceContextHook();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();

  async function resendConfirmationMail() {
    try {
      setIsLoading(true);
      const response = await auth.resendConfirmationMail({
        email: query?.email,
      });

      const { data, error, message } = response;
      if (!data) throw new Error(error.message || message);
      else if (!data.status) throw new Error(`Could not send mail. Try again`);
      notify(data?.message || `Mail sent to ${query?.email}`);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsLoading(!true);
    }
  }

  return (
    <div className="top_mast">
      {" "}
      <div
        style={{
          minHeight: "35vh",
          maxWidth: "50vh",
          margin: "0 auto",
          padding: "10px 30px",
          background: "#fff",
          display: "flex",
          flex: '1 auto',
          justifyContent: "center",
          gap: 10,
          flexDirection: "column",
        }}
      >
        <header className="text-center">
          <h2 className="h3 font-weight-bold">{t("Confirm Account")}</h2>
        </header>
        <p className="text-muted text-center">
          {t(`An account confirmation mail has been sent to`)}{" "}
          <strong className="font-weight-bold">{query?.email}</strong>.{" "}
          {t(`Click on the confirmation link to complete your registration`)}
        </p>
        <button
          disabled={isLoading}
          type="button"
          className="btn btn-primary"
          onClick={() => resendConfirmationMail(query?.email)}
        >
          {t(isLoading ? "Sending..." : "Resend email")}
        </button>
      </div>
    </div>
  );
}
