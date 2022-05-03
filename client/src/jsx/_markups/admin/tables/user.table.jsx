import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Table } from "react-bootstrap";
import pt from "prop-types";
import { LinearProgress, TablePagination } from "@material-ui/core";
import ActionButton from "../../_shared_component/ActionButton";
import useToggler from "../../../_hooks/toggler.hook";
import EmptyRecord from "../components/Empty.Component";
import useTableSelector from "../../../_hooks/table.select.hook";
import UserForm from "../forms/user.form";
import usePaginator from "../../../_hooks/paginator.hook.js";

function UsersTable({ params, setParams, service }) {
  const {
    // isOpen: isModalOpen,
    onOpen: onOpenModal,
    // onClose: onCloseModal,
  } = useToggler();

  let { data, error, isFetching, dispatchRetry, dispatchRequest } = service;
  const { pageCount, rowLimit, onSetPageCount, offset } = usePaginator({
    offset: 10,
  });

  const { selected, toggleSelect, checkedAll } = useTableSelector(
    data?.results
  );

  useEffect(() => {
    let payload = { ...params, limit: rowLimit, offset: offset * pageCount };
    dispatchRequest({
      type: "get",
      payload,
    });
  }, [pageCount]);

  const singleCheck = (id) => (
    <div className={`custom-control custom-checkbox ml-2`}>
      <input
        type="checkbox"
        className="custom-control-input "
        id={`check_user_record_${id}`}
        required=""
        checked={selected.includes(id)}
        onChange={() => toggleSelect(id)}
      />
      <label
        className="custom-control-label"
        htmlFor={`check_user_record_${id}`}
      ></label>
    </div>
  );

  const actOn = (_item) => (
    <div className="d-flex" style={{ gap: 20 }}>
      {/* <ModifierForm isOpen={isModalOpen} data={_item} onClose={onCloseModal}> */}
      {/* {Object.values(_item).join(", ")} */}
      <a onClick={onOpenModal}>
        <span className="themify-glyph-29"></span> Edit
      </a>
      {/* </ModifierForm> */}
      <Link to="">
        <span className="themify-glyph-165"></span> Delete
      </Link>
    </div>
  );

  const onPageChange = (event, newPage) => {
    onSetPageCount(newPage);
  };

  const onChangeRowsPerPage = (event) => {
    // onSetPerPage(parseInt(event.target.value, ));
    onSetPageCount(0);
  };

  /**
   *
   * @param {Object} args
   */
  const onDeleteRow =
    ({ id }) =>
    async () => {
      const data = await dispatchRequest("drop", {
        data: {
          data: [id],
          soft: true,
        },
      });

      dispatchRequest({
        type: "get",
        payload: {
          ...params,
          limit: rowLimit,
          offset: rowLimit * pageCount,
        },
      });
      // await refreshList({
      //   ...params,
      //   limit: rowsPerPage,
      //   offset: rowsPerPage * page,
      // });

      return data;
    };

  /**
   *
   * @param {Object} args
   */
  const onEditRow = async (args) => {};

  /*   const refreshList = (params) => {
    return api.Admin.User.list({ params })
      .then((data) => {
        setList(data);

        console.log(data);
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
  }; */

  return (
    <>
      {isFetching && <LinearProgress color="primary" />}
      <Table responsive>
        <thead>
          <tr>
            <th className="customer_shop">
              <div className="custom-control custom-checkbox mx-2">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="check_all_record"
                  disabled={!data?.results?.length}
                  checked={checkedAll}
                  onChange={() => toggleSelect()}
                />
                <label
                  className="custom-control-label"
                  htmlFor="check_all_record"
                ></label>
              </div>
            </th>
            <th>User ID</th>
            <th>Email</th>
            <th>KYC Status</th>
            <th className="pl-5 width200">Status</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="uesr_mgmt">
          {data?.results?.length ? (
            data?.results.map((item, key) => (
              <tr key={item.id} className="btn-reveal-trigger">
                <td>{singleCheck(item.id)}</td>
                <td className="py-3">
                  <Link to="">
                    <div className="media d-flex align-items-center">
                      <div className="media-body">
                        <h5 className="mb-0 fs--1">{item.id}</h5>
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="py-2">
                  <Link to={`mailto:${item.email}`}>{item.email}</Link>
                </td>
                <td className="py-2">
                  <Link to="tel:2012001851">Not verified</Link>
                </td>
                <td className="py-2 pl-5 wspace-no">Active</td>
                <td className="py-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 text-right">
                  {/* <div className="d-flex" style={{ gap: 20 }}>
                    <ActionButton
                      type="edit"
                      action={editItem}
                      actionTitle="edit"
                      title="edit user"
                    />
                    <ActionButton
                      type="delete"
                      action={deleteItem({ id: item.id })}
                      actionTitle="delete"
                      title={`delete ${item.email}?`}
                    />
                  </div> */}
                  {actOn(item)}
                </td>
              </tr>
            ))
          ) : (
            <EmptyRecord.Table cols={7} />
          )}
        </tbody>
      </Table>

      <TablePagination
        component="div"
        count={data?.count || 0}
        page={pageCount}
        onPageChange={onPageChange}
        rowsPerPage={rowLimit}
        onRowsPerPageChange={onChangeRowsPerPage}
      />
    </>
  );
}

function ModifierForm({ children, data: _data = {}, isOpen, onClose }) {
  return (
    <>
      {children}
      <UserForm.Modify />
    </>
  );
}
UsersTable.defaultProps = {
  params: {},
};

UsersTable.propTypes = {
  params: pt.object,
};

export default Object.assign(UsersTable, {});
