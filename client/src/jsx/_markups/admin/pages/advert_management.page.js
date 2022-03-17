import { Row, Col, Badge } from "react-bootstrap";
import PageTitle from "../layouts/PageTitle";
// CONSTANTS
import { SERVICE } from "../../../_constants";
import { useEffect, useState } from "react";
import TableGenerator from "../components/tableGenerator.component";
import Moment from "react-moment";
import useToggler from "../../../_hooks/toggler.hook";
// import { Popper } from "@mui/core";
import { useTranslation } from "react-i18next";
import { ModalForm } from "../components/modalForm.component.jsx";
import { notify } from "../../../_helpers/notify";
import { AntSwitch } from "../../_shared/components/styled.component";
import useServiceContextHook from "../../../_hooks/service.context.hook";
import FeedbackComponent from "../../_shared/components/Feedback.component";

function AdvertsManagement({ services, useService }) {
  const { t } = useTranslation();
  const { user, advert } = services;
  const [state, setstate] = useState(null)

  let service = useService({
    [SERVICE?.RETRIEVE]: advert.findByID,
    [SERVICE?.FIND]: advert.find,
    [SERVICE?.UPDATE]: advert.updateByID,
    [SERVICE?.DROP]: advert.removeByID,
    [SERVICE?.CREATE]: advert.create,
  });

  const { dispatchRequest, retryDispatch, serviceMap } = service;

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onModalClose,
    toggledPayload: modalPayload,
  } = useToggler();

  function useFormRenderer(formData = { type: null, payload: null }) {
    const [title, form] = (() => {
      const action = serviceMap[formData?.type];

      try {
        switch (formData?.type) {
          case "DEACTIVATE":
            return [
              t("Deactivate advert"),
              // <div className="modal-dialog modal-confirm">
              <DeactivateAdvert
                {...{
                  payload: formData?.payload,
                  onModalClose,
                  callback: () => retryDispatch(SERVICE?.FIND),
                }}
                close={onModalClose}
              />,
            ];

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

  useEffect(() => {
    dispatchRequest({
      type: SERVICE?.FIND,
      payload: {
        // fake: true,
        sudo: true,
      },
      toast: { success: notify, error: (mesg) => notify(mesg, "error") },
    });
  },[]);


  function AdvertRemoveByID(props) {
    const { action, callback, payload = {}, close } = props;
    async function onDeActive() {
      try {
        let { data, error } = await action(payload.id,{
            "published": payload.published?false:true,
        });
        // handleResponse(!!data, () => callback(data));
        if(data.status){
          retryDispatch(SERVICE?.BULK_RETRIEVE,{sudo:true});
        }
      }catch(err){
        console.log(err)
      } finally {
        // setSubmitting(false);
      }
    }

    return (<>
      <div className="">
        <div className=" flex-column">
          {/* <div className="icon-box">
      <i className="material-icons">&#xE5CD;</i>
    </div> */}
          <h4 className="modal-title w-100">Are you sure?</h4>
          {/* <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button> */}
        </div>
        <div >
          <p>Do you really want to deactive these records?</p>
        </div>
        <div className="modal-footer justify-content-center">
          <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { close() }}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={() => { onDeActive() }}> {payload.published?"Deactive":"Active"} </button>
        </div>
      </div>
    </>)
  }


  return (
    <>
      <PageTitle activeMenu="" motherMenu="Advert management" />
      <header className="mb-4">
        <h3>{t("Advertisements")}</h3>
      </header>

      <ModalForm
        useFormRenderer={useFormRenderer}
        formData={modalPayload}
        isOpen={isModalOpen}
        onClose={onModalClose}
      ></ModalForm>

      <div style={{ marginBottom: 60 }}>
        <TableGenerator
          {...{ service }}
          omit="*"
          extras={[
            "creation_date",
            "id",
            "username",
            "trade_type",
            "currency_pair",
            "price_set",
            "order_limit",
            "action",
          ]}
          transformers={{
            creation_date: ({ row }) => {
              return row?.createdAt ? (
                <Moment format="MMM Do, Y" date={row?.createdAt} />
              ) : (
                ""
              );
            },
            id: ({ row }) => row?.id,
            username: ({ row }) =>
              row?.user ? row?.user?.profile?.pname : "Unknown",
            trade_type: ({ row }) =>
              row?.type === "buy" ? (
                <Badge variant="success" className="text-white px-4">
                  {row?.type}
                </Badge>
              ) : (
                <Badge variant="danger" className="px-4">
                  {row?.type}
                </Badge>
              ),
            currency_pair: ({ row }) => {
              return `${row?.crypto}/${row?.fiat}`;
            },
            price_set: ({ row }) => (
              <span>
                {row?.price} <small>{row?.fiat}</small>
              </span>
            ),
            order_limit: ({ row }) => (
              <span>
                {row?.min_order_qty} <small>{row?.fiat}</small> -{" "}
                {row?.max_order_qty} <small>{row?.fiat}</small>
              </span>
            ),
            action: function Action({ row }) {
              const [rowData, setRowData] = useState(row);
              const [isWorking, setIsWorking] = useState(false);
              const {
                services: { advert },
              } = useServiceContextHook();

              function finishAction(status) {
                setRowData((state) => ({
                  ...state,
                  published: status,
                }));
              }

              function handleChange() {
                if (checkStatus())
                  onOpenModal({
                    type: "DEACTIVATE",
                    payload: { row, setRowData: finishAction },
                  });
                else activate();
              }

              async function activate() {
                try {
                  setIsWorking(true);
                  let {
                    data,
                    error,
                    message = "Encountered error trying to activating advert",
                  } = await advert.updateByID(rowData?.id, { published: true });
                  if (!data) throw new Error(error?.message || message);
                  if (data?.status) {
                    finishAction(true);
                    notify(
                      <p>
                        Activated advert{" "}
                        <code className="px-2">{rowData?.id}</code>
                      </p>
                    );
                  } else {
                    finishAction();
                    notify(
                      <>
                        Record <code>{rowData?.id}</code> not updated
                      </>,
                      "error"
                    );
                  }
                } catch (err) {
                  // console.error(err);
                  notify(err.message, "error");
                } finally {
                  setIsWorking(false);
                }
              }

              function checkStatus() {
                return Boolean(rowData.published);
              }
              /* const {
                isOpen,
                onOpen: onPopoverOpen,
                onClose: onPopoverClose,
                toggledPayload: popOverTarget,
              } = useToggler(); */

              /* const handleClick = (event) => {
                console.log(event.target);
                console.log(popOverTarget);
                // alert("Gomand");
                // onPopoverOpen(popOverTarge?t ? null : event.currentTarget);
                onPopoverOpen(popOverTarget ? null : event.target);
              }; */

              /* const handleClose = () => {
                        onPopoverClose(null);
                      }; 
              const open = Boolean(popOverTarget);
              const id = open ? row?.id : undefined;
 */
              return !rowData ? (
                <>No Data</>
              ) : isWorking ? (
                <FeedbackComponent.Loading />
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
                  {/* <button
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
                    <span className="themify-glyph-29"></span> Edit
                  </button> */}
                  {/* TODO: Delete  */}
                  <small>
                    <AntSwitch
                      color={checkStatus() ? "primary" : "default"}
                      name={rowData?.id}
                      onChange={handleChange}
                      inputProps={{ "aria-label": "controlled" }}
                      checked={checkStatus()}
                    />
                    <span
                      className={`fas  ${
                        checkStatus()
                          ? "fa-check-circle text-success"
                          : "fa-times-circle text-danger"
                      }`}
                    ></span>
                  </small>

                  {/*   {id && (
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
                                type: SERVICE?.CREATE,
                                // method: SERVICE?.REMOVE,
                                // payload: { ...row, force: false },
                              })
                            }
                          >
                            <small>Delete</small>
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
                            <small>Permanently delete</small>
                          </a>
                        </li>
                      </ul>
                    </Popper>
                  )} */}
                </div>
              );
            },
          }}
        />
      </div>
    </>
  );
}


/**
 * @function handleResponse
 * @param {Boolean} response
 * @param {Function} callback
 */
// function handleResponse(response, callback) {
//   toast[response ? "success" : "error"](
//     response ? "Done" : "Operation not completed.",
//     {
//       position: "top-right",
//       autoClose: 3000,
//       hideProgressBar: true,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//     }
//   );
//   // response && callback();
// }


export default AdvertsManagement;

function DeactivateAdvert({
  payload = { row: null, setRowData: () => null },
  onModalClose,
  callback,
}) {
  const {
    services: { advert },
  } = useServiceContextHook();
  const [isWorking, setIsWorking] = useState(false);

  async function onDeactivate() {
    try {
      setIsWorking(true);
      let {
        data,
        error,
        message = "Encountered error trying to deactivate advert",
      } = await advert.updateByID(payload?.row?.id, { published: false });
      if (!data) throw new Error(error?.message || message);
      if (data?.status) {
        notify(
          <p>
            Deactivated advert <code className="px-2">{payload?.row?.id}</code>
          </p>
        );
        payload.setRowData(false);
      } else {
        notify(
          <>
            Record <code>{payload?.row?.id}</code> not updated!
          </>,
          "error"
        );
      }
    } catch (err) {
      // console.error(err);
      notify(err.message, "error");
    } finally {
      // callback && callback();
      setIsWorking(false);
      onModalClose();
    }
  }
  return payload?.row?.id ? (
    <div className="">
      <div className="">
        <h4 className="modal-title">Are you sure?</h4>
        <p>Do you really want to deactivate this records?</p>
      </div>
      <div className="modal-footer d-flex justify-content-between">
        <button
          disabled={isWorking}
          type="button"
          className="btn btn-default btn-sm"
          data-dismiss="modal"
          onClick={onModalClose}
        >
          Cancel
        </button>
        <button
          disabled={isWorking}
          type="button"
          onClick={onDeactivate}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      </div>
    </div>
  ) : (
    <>Missing ID</>
  );
}
