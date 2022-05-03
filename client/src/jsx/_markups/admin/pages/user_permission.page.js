import { useEffect, useState } from "react";
import Moment from "react-moment";
import "moment-timezone";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Switch } from "@mui/material";
// CONSTANTS
import { SERVICE } from "../../../_constants";

// HOOKS
import useServiceContextHook from "../../../_hooks/service.context.hook";

// COMPONENTS
import PageTitle from "../layouts/PageTitle";
import _components from "../components";
import TableGenerator from "../components/tableGenerator.component";
import { useTranslation } from "react-i18next";
const { IdenticonAvatar } = _components;
const SuitabilityRating = styled.div`
  ul.star-rating > li i {
    color: #089248;
  }
`;

function UserPermission(props) {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle activeMenu="Users information" motherMenu="User Management" />
      <div style={{ marginBottom: 60 }}>
        <header className="mb-4">
          <h3>{t("Permissions")}</h3>
        </header>
        <UsersPermissionTable {...props} />
      </div>

      {/* Permissions */}
      <div style={{ marginBottom: 60 }}>
        <header className="mb-4">
          <h3>{t("User membership information")}</h3>
        </header>
        <UsersMembershipTable {...props} />
      </div>
    </>
  );
}
export default UserPermission;

function UsersPermissionTable({ services, useService }) {
  const { user } = services;

  let service = useService({
    [SERVICE?.FINDBYID]: user.findByID,
    [SERVICE?.UPDATEBYID]: user.updateByID,
    [SERVICE?.REMOVEBYID]: user.removeByID,
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
        // fake: true,
        sudo: true,
        include: ["profile", "addresses"],
      },
      toast: { success: notifySuccess, error: notifyError },
    });
  }, []);

  return (
    <>
      <TableGenerator
        {...{ service }}
        mapping={{
          id: "USER ID",
          createdAt: "joined",
        }}
        omit="*"
        extras={[
          "name",
          "id",
          "phone_number",
          "country",
          "joined",
          // "permission",
        ]}
        transformers={{
          name: ({ key, value, row }) => {
            return (
              // <Link to="/to_user_information">
                <div className=" d-flex align-items-center">
                  <div
                    className="avatar avatar-lg mr-4 rounded-circle"
                    style={{ border: "1px solid #ededed" }}
                  >
                    <div
                      className=" img-fluid overflow-hidden"
                      style={{ maxWidth: 50, borderRadius: "100%" }}
                    >
                      <IdenticonAvatar size={30} alt="" id={row.id} />
                    </div>
                  </div>
                  <div className="media-body">
                    <strong className="mb-0  d-block">
                      {row?.profile?.pname || row?.profile?.lname || "Untitled"}
                    </strong>
                    <small className="text-muted">
                      Last updated:{" "}
                      <Moment format="MMM Do, Y, hh:mm A">{row?.updatedAt}</Moment>
                    </small>
                  </div>
                </div>
              // </Link>
            );
          },
          id: ({ row }) => {
            return <>{row?.id}</>;
          },
          permission: Permit,
          joined: ({ row }) => {
            return <Moment format="MMM Do, Y" date={row?.createdAt} />;
          },
          phone_number: ({ row }) => {
            return row?.profile?.phone ? (
              <Link to={`tel:${row?.profile?.phone}`}>{row?.profile?.phone}</Link>
            ) : (
              "--"
            );
          },
          country: ({ row }) => {
            return <>{row?.address?.country || "--"}</>;
          },
        }}
      />
    </>
  );
}

function UsersMembershipTable({ useService, services }) {
  const { user } = services;

  let service = useService({
    [SERVICE?.FIND]: user.find,
  });

  const { dispatchRequest } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: { sudo: true, include: ["profile", "address"] },
    });
  }, []);

  return (
    <>
      <TableGenerator
        {...{ service }}
        omit="*"
        extras={["name", "role", "suitability", "relationship"]}
        transformers={{
          name: ({ row }) => {
            return (
              // <Link to="/to_user_information">
                <div className=" d-flex align-items-center">
                  <div
                    className="avatar avatar-lg mr-4 rounded-circle"
                    style={{ border: "1px solid #ededed" }}
                  >
                    <div
                      className=" img-fluid overflow-hidden"
                      style={{ maxWidth: 50, borderRadius: "100%" }}
                    >
                      <IdenticonAvatar size={30} alt="" id={row.id} />
                    </div>
                  </div>
                  <div className="media-body">
                    <strong className="mb-0  d-block">
                      {row?.profile?.pname || row?.profile?.lname || "Untitled"}
                    </strong>
                    <small className="text-muted">
                      Last updated:{" "}
                      <Moment format="MMM Do, Y, hh:mm A">{row?.updatedAt}</Moment>
                    </small>
                  </div>
                </div>
              // </Link>
            );
          },
          role: ({ row }) => {
            return (
              <div className="py-2 d-flex justify-content-center flex-column">
                <i className="fa fa-users d-block" aria-hidden="true"></i>
                <Link to="mailto:ricky@example.com" className="text-capitalize">
                  {row?.isAdmin ? "Administrator" : "Regular"}
                </Link>
              </div>
            );
          },
          suitability({ row }) {
            let suitability = Number.isNaN(row?.profile?.suitability)
              ? row?.profile?.suitability
              : 0;
            let progress = (suitability / 5) * 100;

            return (
              <SuitabilityRating>
                <ul className="star-rating">
                  {Array(5)
                    .fill(false)
                    .fill(true, 0, suitability)
                    .map((val, idx) => {
                      return (
                        <li key={idx}>
                          <i className={`fa fa-star${!val ? "-1" : ""}`} />
                        </li>
                      );
                    })}
                </ul>
                <small>{progress}% Progress</small>
              </SuitabilityRating>
            );
          },
          relationship: () => (
            <>
              <ul>
                <li style={{fontSize: 12}}>Message(9)</li>
                <li style={{fontSize: 12}}>Phone(3)</li>
                <li style={{fontSize: 12}}>Live meeting(1)</li>
                <li style={{fontSize: 12}}>Notes(7)</li>
              </ul>
            </>
          ),
          joined: ({ row }) => {
            return (
              <Moment format="MMM Do, Y" date={row?.profile?.createdAt} />
            );
          },
          phone_number: ({ row }) => {
            return row?.profile?.phone ? (
              <Link to={`tel:${row?.profile?.phone}`}>{row?.profile?.phone}</Link>
            ) : (
              "Not specified"
            );
          },
          country: ({ row }) => {
            return <>{row?.address?.country || "Not specified"}</>;
          },
        }}
      />
    </>
  );
}

function notifySuccess() {
  toast.success("Success !", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}

function notifyError(error) {
  toast.error(error || "Request Error!", {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}

function Permit({ key, row }) {
  const [permission, setPermission] = useState(row?.permission);
  const { services } = useServiceContextHook();
  const { user } = services;

  function handleChange(e, value) {
    let { data } = user?.updateByID(row?.id, { permission: !permission });
    if (data?.status) setPermission(value);
  }
  return (
    <small className="d-flex" style={{ gap: 10, alignItems: "center" }}>
      <strong
        className="text-danger"
        style={{ opacity: !permission ? 1 : 0.5 }}
      >
        Block
      </strong>
      <Switch
        color={"default"}
        name={row?.id}
        onChange={handleChange}
        checked={permission}
      />
      <strong
        className="text-success"
        style={{ opacity: permission ? 1 : 0.5 }}
      >
        Allow
      </strong>
    </small>
  );
}
