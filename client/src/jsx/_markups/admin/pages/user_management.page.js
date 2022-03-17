import { Row, Col, Button } from "react-bootstrap";
import { useEffect, useState, Suspense, lazy } from "react";
import Moment from "react-moment";
import moment from "moment";
import { toast } from "react-toastify";
import { Popper } from "@mui/material";
// COMPONENTS
import TableGenerator from "../components/tableGenerator.component";
import { ModalForm } from "../components/modalForm.component.jsx";
import useToggler from "../../../_hooks/toggler.hook";
import UserForm from "../forms/user.form";

// CONSTANTS
import { SERVICE } from "../../../_constants";
import { useTranslation } from "react-i18next";
import { notify } from "../../../_helpers/notify";
const reset_passcode = "p@55w0rd";
function UserManagement({ services, useService }) {
  const { user, auth } = services;

  const { t } = useTranslation();
  // register services
  let service = useService({
    [SERVICE?.FIND]: user?.find,
    [SERVICE?.CREATE]: user?.create,
    [SERVICE?.FINDBYID]: user?.findByID,
    [SERVICE?.UPDATEBYID]: user?.updateByID,
    [SERVICE?.REMOVEBYID]: user?.removeByID,
  });

  const { dispatchRequest, retryDispatch, serviceMap } = service;

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        order: JSON.stringify([
          ["createdAt", "DESC"],
          ["updatedAt", "DESC"],
        ]),
        sudo: true,
        // fake: true,
        paranoid: false,
      },
      toast: { success: notify, error: (mesg) => notify(mesg, "error") },
    });
  }, []);

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
    toggledPayload: modalPayload,
  } = useToggler();

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.keyCode === 8) {
      // setParams((prev) => ({ ...prev, q: "" }));
    }
  };

  /**
   *
   * @param {String} id
   * @param {Object} changes
   * @returns
   */
  async function onUpdateUser(id, changes) {
    try {
      if (id && changes) {
        const action = serviceMap[SERVICE?.UPDATEBYID];
        let { data, error } = await action(id, changes);
        if (error) throw new Error(error);
        data && data?.status
          ? notify("Done")
          : notify("Could not complete operation", "error");
        retryDispatch(SERVICE?.FIND);
      }
      return null;
    } catch (err) {
      notify(err.message, "error");
    }
  }

  /**
   *
   * @param {Object} changes
   * @returns
   */
  async function onResetPassword(changes) {
    try {
      if (changes) {
        let { data, error } = await auth.changePassword(changes);
        // console.log(data, error);
        if (error) throw new Error(error);
        data && data?.status
          ? notify(`Operation done. password reset to '${reset_passcode}'`)
          : notify("Could not complete operation", "error");
        // dispatchRetry(SERVICE?.FIND);
      }
      return null;
    } catch (err) {
      notify(err.message, "error");
    }
  }

  /**
   * @function useFormRenderer
   * @param {Object} formData
   * @param {String} formData.type
   * @param {Object} formData.payload
   * @returns
   */
  function useFormRenderer(formData = { type: null, payload: null }) {
    // const UserForm = lazy(()=>import('../forms/user'))
    const [title, form] = (() => {
      const action = serviceMap[formData?.type];

      try {
        switch (formData?.type) {
          case SERVICE?.CREATE: {
            return [
              t("Create new User"),
              <UserForm
                action={action}
                payload={formData?.payload}
                callback={onModalClose}
              />,
            ];
          }
          case SERVICE?.UPDATE: {
            return [
              "Update User",
              <UserForm.Update
                action={action}
                payload={formData?.payload}
                callback={onModalClose}
              />,
            ];
          }

          case SERVICE?.REMOVE: {
            return [
              "Delete User",
              <UserForm.Remove
                action={action}
                payload={formData?.payload}
                callback={onModalClose}
              />,
            ];
          }
          default:
            return [null, null];
        }
      } catch (error) {
        console.error(
          "Must pass in method and payload key to the formData argument"
        );
      }
    })();
    return [
      title,
      <Row>
        <Col>{form}</Col>
      </Row>,
    ];
  }

  return (
    <>
      <Row style={{ marginBottom: 20 }}>
        <Col>
          <div className="input-group search-area right d-lg-inline-flex d-none">
            {/*   <input
              value={params.q}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              type="text"
              className="form-control"
              placeholder="Find user here..."
            /> */}
            {/* <div className="input-group-append">
              <span className="input-group-text">
                <Link to={"#"}>
                  <i className="simple-magnifier"></i>
                </Link>
              </span>
            </div> */}
          </div>
        </Col>
        <Col sm="auto">
          <div className="" style={{ padding: 0, display: "flex", gap: 10 }}>
            <button className="btn" onClick={() => retryDispatch(SERVICE.FIND)}>
              {t("Refresh")}
            </button>
            <Button onClick={() => onOpenModal({ type: SERVICE?.CREATE })}>
              <i className="fa fa-plus"></i> {t("Add User")}
            </Button>
          </div>
        </Col>
      </Row>

      <ModalForm
        useFormRenderer={useFormRenderer}
        formData={modalPayload}
        isOpen={isModalOpen}
        onClose={onModalClose}
      ></ModalForm>

      <Row>
        <Col>
          <TableGenerator
            {...{ service }}
            mapping={{ created_at: "registration_date" }}
            omit="*"
            extras={[
              "email",
              "name",
              "registration_date",
              "kyc_status",
              "status",
              "action",
              "reset_password",
            ]}
            transformers={{
              name: ({ row }) => row?.profile?.pname,
              registration_date: ({ row }) => {
                let time = moment(row?.createdAt);
                return time.isValid() ? (
                  <Moment format="MMM Do, Y, hh:mm A">{time}</Moment>
                ) : (
                  "unknown"
                );
              },

              email: ({ row }) => row?.email,
              status: ({ row }) =>
                row?.active ? (
                  <span className="badge light badge-success">
                    <i className="fa fa-circle text-success mr-1" />
                    {t("Active")}
                  </span>
                ) : (
                  <span className="badge light badge-danger">
                    <i className="fa fa-circle text-danger mr-1" />
                    {t("Inactive")}
                  </span>
                ),
              action: ({ row }) => {
                return (
                  <select
                    value={row?.active}
                    onChange={({ target }) =>
                      onUpdateUser(row?.id, { active: target?.value })
                    }
                  >
                    <option disabled={row?.active} value={true}>
                      {t("Activate")}
                    </option>
                    <option disabled={!row?.active} value={false}>
                      {t("Deactivate")}
                    </option>
                  </select>
                );
              },
              reset_password: ({ row }) => {
                return (
                  <button
                    type="button"
                    onClick={() =>
                      onResetPassword({
                        id: row?.id,
                        new_password: reset_passcode,
                        token: "",
                      })
                    }
                    className="btn btn-danger btn-xs"
                  >
                    {t("Reset password")}
                  </button>
                );
              },
              reset_password: ({ row }) => {
                return (
                  <button type="button" className="btn btn-danger btn-xs">
                    Reset password
                  </button>
                );
              },
              kyc_status: ({ row }) => {
                let role = row?.isAdmin ? "Administrator" : "Regular";
                const checkKYC = (kyc) => {
                  if (kyc) {
                    return Object.keys(kyc).some(
                      (item) => item.status == "ACCEPTED"
                    )
                      ? false
                      : true;
                  }
                  return false;
                };

                let status = row?.isAdmin ? (
                  <small className="badge badge-success text-white">
                    <i className="fa fa-check-circle text-white mr-2" />
                    {t("completed")}
                  </small>
                ) : checkKYC(row?.kyc) ? (
                  <small className="badge badge-success text-white">
                    <i className="fa fa-check-circle text-white mr-2" />
                    {t("completed")}
                  </small>
                ) : (
                  <small className="badge badge-default text-white">
                    {t("pending")}
                  </small>
                );

                return status;
              },

              _action: function Action({ row }) {
                const {
                  isOpen,
                  onOpen: onPopoverOpen,
                  onClose: onPopoverClose,
                  toggledPayload: popOverTarget,
                } = useToggler();
                const handleClick = (event) => {
                  // onPopoverOpen(popOverTarget ? null : event.currentTarget);
                  // onPopoverOpen(popOverTarget ? null : event.target);
                };

                /* const handleClose = () => {
                    onPopoverClose(null);
                  }; */

                const open = Boolean(popOverTarget);
                const id = open ? row?.id : undefined;

                return (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <button
                      style={{
                        appearance: "none",
                        border: "none",
                        background: "none",
                        fontSize: 12,
                      }}
                      onClick={() =>
                        onOpenModal({ method: SERVICE?.UPDATE, payload: row })
                      }
                    >
                      <span className="themify-glyph-29"></span> {t("Edit")}
                    </button>
                    {/* TODO: Delete user */}
                    <button
                      style={{
                        appearance: "none",
                        border: "none",
                        background: "none",
                        position: "relative",
                        fontSize: 12,
                      }}
                      aria-describedby={id}
                      variant="contained"
                      onClick={handleClick}
                    >
                      <span className="themify-glyph-165"></span> {t("Delete")}
                    </button>

                    {id && (
                      <Popper id={id} open={isOpen} anchorEl={popOverTarget}>
                        <ul
                          className="bg-white shadow"
                          style={{
                            padding: 10,
                          }}
                        >
                          <li>
                            <a
                              href="#"
                              onClick={() =>
                                onOpenModal({
                                  method: SERVICE?.REMOVE,
                                  payload: { ...row, force: false },
                                })
                              }
                            >
                              <small>{t("Delete")}</small>
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              onClick={() =>
                                onOpenModal({
                                  method: SERVICE?.REMOVE,
                                  payload: { ...row, force: true },
                                })
                              }
                            >
                              <small>{t("Permanently delete")}</small>
                            </a>
                          </li>
                        </ul>
                      </Popper>
                    )}
                  </div>
                );
              },
            }}
          />
        </Col>
      </Row>
    </>
  );
}

export default UserManagement;
