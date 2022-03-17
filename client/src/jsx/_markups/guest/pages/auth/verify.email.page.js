import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import qs from "qs";
import _constants from "../../../../_constants";
import { useDispatch, useSelector } from "react-redux";
import { routeMap } from "../../routes";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import useQuery from "../../../../_hooks/query.hook";
import { notify } from "../../../../_helpers/notify";

// CONSTANTS
const { NOTICE, SESSION } = _constants;

export default function VerifyEmailByLink() {
  const {
    services: { auth },
    session,
    history,
  } = useServiceContextHook();
  const { search } = useLocation();
  const [status, setStatus] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (session?.user) history.push(routeMap?.me);
  }, [session]);

  useEffect(() => {
    async function confirmRequest(payload) {
      try {
        setIsConfirming(true);

        let response = await auth.verifyEmailByLink(payload);
        const { data, error, message } = response;
        if (error) throw new Error(message);

        if (data) {
          setStatus(true);
          dispatch(log({ type: SESSION.LOGIN, data }));
        }
      } catch (err) {
        setError(err?.message);
        setStatus(false);
      } finally {
        setIsConfirming(false);
      }
    }

    if (search) {
      let { email, token } = qs.parse(search.substring(1));
      confirmRequest({ email, token });
    }
  }, [search]);
  return <Feedback isConfirming={isConfirming} error={error} status={status} />;
}

function Feedback({ isConfirming, status = false, error }) {
  const {
    services: { auth },
  } = useServiceContextHook();
  const { email, token } = useQuery();

  
  return (
    <div
      className="top_mast"
      style={{
        minHeight: "50vh",
        padding: 10,
        marginTop: 100,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {isConfirming ? (
        "Confirming..."
      ) : (
        <header className="text-center" style={{ position: "relative" }}>
          <h2 className="h3 font-weight-bold">Status</h2>
          <div>
            {status ? (
              <>
                <p className="text-success">Success</p>
                <Link
                  to={routeMap?.me}
                  className="d-block"
                  href="/me"
                  aria-label="Navigate to user dashboard"
                  title="Click to go to your dashboard"
                >
                  Go to dashboard
                </Link>
              </>
            ) : (
              <>
                <p>Error! Operation was not successful</p>
                <pre className="text-danger">{error}</pre>
                {email && (
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      auth
                        .resendConfirmationMail({ email })
                        .then(({ data, error, message }) => {
                          if (!data)
                            throw new Error(
                              error.message ||
                                message ||
                                "Cannot sent mail at the moment!"
                            );
                          notify(data?.message);
                        })
                        .catch((err) => notify(err, "error"))
                    }
                  >
                    Resend Confirmation mail
                  </button>
                )}
              </>
            )}
          </div>
        </header>
      )}
    </div>
  );
}
function log({ type = NOTICE.INFO, data = null }) {
  return { type, data };
}
