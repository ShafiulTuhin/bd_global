import { useEffect } from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import { toast } from "react-toastify";
import TableGenerator from "../components/tableGenerator.component";
import Moment from "react-moment";
import moment from "moment";

import { useTranslation } from "react-i18next";

function UserReferralMgmt({ services, useService }) {
  const { t } = useTranslation();
  const { affiliate } = services;

  let service = useService({
    [SERVICE?.FIND]: affiliate.find,
  });

  const { dispatchRequest } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        // fake: true,
        sudo: true,
        paranoid: false,
      },
      toast: { success: notifySuccess, error: notifyError },
    });
  }, []);

  return (
    <>
      {
        <div style={{ marginBottom: 60 }}>
          <header className="mb-4">
            <h3>{t("User affiliates")}</h3>
          </header>
          <TableGenerator
            {...{ service }}
            omit="*"
            extras={[
              "referrer_email",
              "referrer_code",
              "total",
              // "commission quantity",
            ]}
            transformers={{
              date: ({ row }) => {
                let time = moment(row?.createdAt);
                return time.isValid() ? (
                  <Moment format="MMM Do, Y, hh:mm A">{time}</Moment>
                ) : (
                  "unknown"
                );
              },
              referrer_email: ({ row }) => (console.log(row), row?.user?.email),
              referrer_code: ({ row }) =>
                row?.user?.profile?.invite_code || "Unknown",
              total: ({ row }) => row?.total,
            }}
          />
        </div>
      }
    </>
  );
}


// to hget user re

function UserReferralsTable() {
  const chackbox = document.querySelectorAll(".user_permission_single input");
  const motherChackBox = document.querySelector(".user_permission input");
  // console.log(document.querySelectorAll(".publish_review input")[0].checked);
  const chackboxFun = (type) => {
    for (let i = 0; i < chackbox.length; i++) {
      const element = chackbox[i];
      if (type === "all") {
        if (motherChackBox.checked) {
          element.checked = true;
        } else {
          element.checked = false;
        }
      } else {
        if (!element.checked) {
          motherChackBox.checked = false;
          break;
        } else {
          motherChackBox.checked = true;
        }
      }
    }
  };

  const check = (i) => (
    <div className={`custom-control custom-checkbox ml-2`}>
      <input
        type="checkbox"
        className="custom-control-input "
        id={`checkAll_user_permission_${i}`}
        required=""
        onClick={() => chackboxFun()}
      />
      <label
        className="custom-control-label"
        htmlFor={`checkAll_user_permission_${i}`}
      ></label>
    </div>
  );
  return (
    <>
      <Table responsive hover size="sm">
        <thead>
          <tr>
            <th className="user_permission">
              <div className="custom-control custom-checkbox mx-2">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="checkAll_user_permission_all"
                  onClick={() => chackboxFun("all")}
                />
                <label
                  className="custom-control-label"
                  htmlFor="checkAll_user_permission_all"
                ></label>
              </div>
            </th>
            <th>Date</th>
            <th className="">Referrer ID</th>
            <th>Referree ID</th>
            <th>Commision (%)</th>
          </tr>
        </thead>
        <tbody id="customers">
          <tr className="btn-reveal-trigger">
            <td className="user_permission_single">{check(1)}</td>
            <td className="py-3">22/08/2020</td>

            <td className="py-2">
              <Link to=""> KD13wewsd</Link>
            </td>
            <td className="py-2">
              <Link to="">HG3esfms</Link>
            </td>
            <td className="py-2 ">10</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

export default UserReferralMgmt;

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
