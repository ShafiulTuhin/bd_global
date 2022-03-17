import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";
// CONSTANTS
import { SERVICE } from "../../../_constants";

// COMPONENTS
import PageTitle from "../layouts/PageTitle";
import TableGenerator from "../components/tableGenerator.component";
import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";
function Support() {
  const {
    services: { support_ticket },
    useService,
  } = useServiceContextHook();

  const { t } = useTranslation();

  let service = useService({
    [SERVICE?.BULK_RETRIEVE]: support_ticket.find,
  });

  const { dispatchRequest, isFetching } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.BULK_RETRIEVE,
      payload: {
        // fake: true,
        sudo: true,
      },
    });
  }, []);

  return (
    <>
      <PageTitle activeMenu="Support" motherMenu="Support management" />
      <header className="mb-4">
        <h3>{t("Support Tickets")}</h3>
      </header>
      <div style={{ marginBottom: 60 }}>
        <TableGenerator
          {...{ service }}
          omit="*"
          extras={["user_id", "email", "subject", "status" /* , "action" */]}
          transformers={{
            user_id: ({ row }) => <>{row?.user_id}</>,
            email: ({ row }) => <>{row?.user?.email}</>,
            subject: ({ row }) => <>{row?.subject}</>,
            status: ({ row }) => {
              const status = String(row?.status)?.toLowerCase();
              switch (status) {
                case "open": {
                  return (
                    <Badge variant="warning" className="text-white">
                      {status}
                    </Badge>
                  );
                }
                case "close": {
                  return (
                    <Badge variant="success" className="text-white">
                      {status}
                    </Badge>
                  );
                }
                default: {
                  return <Badge>{status}</Badge>;
                }
              }
            },
            action: ({ key, value }) => (
              <div className="d-flex" style={{ gap: 20 }}>
                <Link to="">
                  <span className="themify-glyph-29"></span> Edit
                </Link>
                <Link to="">
                  <span className="themify-glyph-165"></span> Delete
                </Link>
              </div>
            ),
          }}
        />
      </div>
    </>
  );
}
export default Support;
