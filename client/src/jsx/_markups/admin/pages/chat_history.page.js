import { useEffect } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageTitle from "../layouts/PageTitle";
import Moment from "react-moment";

// CONSTANTS
import { SERVICE } from "../../../_constants";
// COMPONENTS
import TableGenerator from "../components/tableGenerator.component";

import { useTranslation } from "react-i18next";
import useServiceContextHook from "../../../_hooks/service.context.hook";
function ChatHistory() {
  const {
    services: { user, chat },
    useService,
  } = useServiceContextHook();

  const { t } = useTranslation();

  let service = useService({
    [SERVICE?.BULK_RETRIEVE]: chat.find,
  });

  const { data, dispatchRequest, isFetching } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE.BULK_RETRIEVE,
      payload: { /* fake: true, */ sudo: true },
    });
  }, []);

  return (
    <>
      <PageTitle activeMenu="History" motherMenu="Chat management" />
      <header className="mb-4">
        <h3>{t("Chat History")}</h3>
      </header>
      <Row style={{ marginBottom: 20, width: "100%" }}>
        <Col>
          {isFetching ? (
            t("Loading...")
          ) : data?.results?.length ? (
            <div className="input-group search-area right d-lg-inline-flex d-none">
              <input
                type="text"
                className="form-control"
                placeholder="Filter in record"
              />
              <div className="input-group-append">
                <span className="input-group-text">
                  <Link to={"#"}>
                    <i className="themify-glyph-162"></i>
                  </Link>
                </span>
              </div>
            </div>
          ) : null}
        </Col>
        <Col sm="auto" style={{ padding: 0 }}></Col>
      </Row>

      <div style={{ marginBottom: 60 }}>
        <TableGenerator
          {...{ service }}
          mapping={{}}
          omit="*"
          extras={[
            "creation_date",
            "visitor_email",
            "country",
            "browser",
            "duration",
            /* "action", */
          ]}
          transformers={{
            creation_date: ({ row }) => (
              <Moment format="YYYY/MM/DD" date={row?.createdAt} />
            ),
            visitor_email: ({ row }) => row?.visitor_email,
            country: ({ row }) => row?.country,
            browser: ({ row }) => row?.browser,
            duration: ({ row }) => {
              return (
                <Moment to={row?.ended_at} duration from={row?.started_at} />
              );
            },
            action: ({ key, value }) => (
              <>
                <span className="themify-glyph-165"></span> Delete
              </>
            ),
          }}
        />
      </div>
    </>
  );
}

export default ChatHistory;
