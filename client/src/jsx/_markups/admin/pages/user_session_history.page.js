import { useEffect } from "react";
import Moment from "react-moment";
import moment from "moment";
import { isBefore, parseISO } from "date-fns";
// CONSTANTS
import { SERVICE } from "../../../_constants";
// COMPONENTS
import PageTitle from "../layouts/PageTitle";
import TableGenerator from "../components/tableGenerator.component";
import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";

function UserSessionHistory(props) {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle activeMenu="Session History" motherMenu="User Management" />
      <div style={{ marginBottom: 60 }}>
        <header className="mb-4">
          <h3>{t("User session history")}</h3>
        </header>
        <UserSessionHistoryTable {...props} />
      </div>
    </>
  );
}
function UserSessionHistoryTable() {
  const {
    useService,
    services: { user },
  } = useServiceContextHook();
  let service = useService({
    [SERVICE?.FIND]: user.find,
  });
  const { dispatchRequest } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        order: JSON.stringify([
          ["created_at", "DESC"],
          ["updated_at", "DESC"],
        ]),
        sudo: true,
        // fake: true,
      },
    });
  }, []);

  return (
    <>
      <TableGenerator
        {...{ service }}
        omit="*"
        extras={["username", "duration", "login", "last_seen", "login_status"]}
        transformers={{
          username: ({ row }) => {
            const now = moment();
            const login_at = moment(row?.login_at);
            const status = now.minutes() - login_at.minutes();
            console.log({
              status,
              loginAtDayOfTheYear: login_at.dayOfYear(),
              nowDayOfYear: now.dayOfYear(),
            });

            // if same day, then calculate by hours and minute

            // if not the same day, then depend on the online status
            return (
              <div className="d-flex align-items-center" style={{ gap: 10 }}>
                <span
                  className={`fa fa-circle ${
                    row?.online ? "text-success" : "text-danger"
                  }`}
                  style={{ fontSize: 12 }}
                ></span>{" "}
                <div className="media d-flex align-items-center">
                  <div className="media-body">
                    <div className="mb-0 fs--1">
                      {row?.profile?.pname || row?.profile?.lname || "Untitled"}
                    </div>
                  </div>
                </div>
              </div>
            );
          },
          duration: ({ row }) => {
            let login_time = moment(row?.login_at);
            return (
              <small>
                {login_time.isValid() ? (
                  <Moment duration={login_time} trim ></Moment>
                ) : (
                  "--"
                )}
              </small>
            );
          },
          last_seen: ({ row }) => (
            <small>
              {(row?.last_seen && (
                <Moment
                  format="MMM Do, Y hh:m A"
                  date={row?.last_seen}
                  trim
                ></Moment>
              )) ||
                "--"}
            </small>
          ),
          login: ({ row }) => {
            let login_time = moment(row?.login_at);
            return (
              <small>
                {login_time.isValid() ? (
                  <Moment withTitle format="MMM Do, Y hh:m A" trim>
                    {login_time}
                  </Moment>
                ) : (
                  "--"
                )}
              </small>
            );
          },

          login_status: ({ row }) => {
            let now = moment();
            let login_at = row?.login_at;
            let last_seen = row?.last_seen;
            let status = "--";
            if (moment(login_at).isValid()) {
              status = isBefore(parseISO(last_seen), parseISO(login_at))
                ? "logged In"
                : "logged out";
            }
            return <small>{status}</small>;
          },
        }}
      />
    </>
  );
}

export default UserSessionHistory;
