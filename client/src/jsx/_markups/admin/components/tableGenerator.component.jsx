import { Table, Card } from "react-bootstrap";
import pt from "prop-types";
import React, { useState, useEffect } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { TablePagination, Skeleton } from "@mui/material";
import styled from "styled-components";

// HELPERS
import { keysToLowerCase } from "../../../_helpers/utils.helper";
// COMPONENTS
import Empty from "../../_shared/components/Feedback.component";
// CONSTANTS
import { SERVICE } from "../../../_constants";
// HOOKS
import useTableSelector from "../../../_hooks/table.select.hook";

import { useTranslation } from "react-i18next";

const StyledPagination = styled(TablePagination)`
  p {
    margin: 0 auto;
    color: #a3a3a3;
  }
`;

const BulkActionSelector = styled("div")`
  padding: 10px 12px;
  margin: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 0 2px 1px #5c5c5c33;
`;

/**
 *
 * @param {Object} props
 * @param {Object} props.service
 * @param {Object} [props.transformers]
 * @param {Array} [props.mapping]
 * @param {Array} [props.extras]
 * @param {Array} props.omit
 * @param {Array | undefined} [props.intermediaryCallback]
 * @returns
 */
function TableGenerator({
  service = {},
  transformers = {},
  mapping = {},
  extras = [],
  omit = [],
  bulkActions = false,
  showSearch = false,
  intermediaryCallback,
  sendDataToParent,
  is_selected,
  checkchange
}) {
  const { data, _fromStack, retryDispatch, isFetching, dispatchRequest } =
    service;

  const uuid = nanoid(10);
  const [tableData, setTableData] = useState({
    rows: [],
    fullRows: [],
    fullCols: [],
    cols: [],
    icb: [],
  });
  const { selected, toggleSelect, bulkSelect, setSelected } = useTableSelector();
  const [count, setCount] = useState(data?.count || 0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(data?.limit || 10);
 
  useEffect(() => {
    if(is_selected){
      is_selected && setSelected([])
      checkchange(false)
    }
  },[is_selected])
  

  useEffect(() => {
    if (
      sendDataToParent &&
      typeof (sendDataToParent === "function")
    ) {
      sendDataToParent(selected);
    }
  }, [selected])

  useEffect(() => {
    if (data) {
      /**
       * @function getMapping - Returns a row/col mapping of the table data
       * @returns {[]}
       */
      function getMapping(result = []) {
        let icb = [];
        let allRows = result?.map((obj) => {
          if (
            intermediaryCallback &&
            typeof (intermediaryCallback === "function")
          )
            icb.push(intermediaryCallback(obj));
          let _obj = {};
          Object.entries(keysToLowerCase(obj)).forEach(
            ([key, value]) => (_obj[key] = value)
          );
          return _obj;
        });

        let allCols = Object.keys(result?.length && result[0]).map((key) =>
          key in mapping ? mapping[key] : key
        );

        return [
          result?.map((obj) => {
            let _obj = {};
            let valid_entries = Object.entries(obj).filter(
              ([key, value]) => !omit.includes(key)
            );
            // console.log({ valid_entries });
            valid_entries.forEach((entry) => (_obj[entry[0]] = entry[1]));
            return _obj;
          }),
          Object.keys(result[0])
            .filter((itm) => !omit.includes(itm))
            .map((key) =>
              // console.log(key in mapping, { key, mapping }, mapping[key]),
              key in mapping ? mapping[key] : key
            ),
          allRows,
          allCols,
          icb,
        ];
      }

      if (data?.result?.length > 0) {
        const [rows, cols, fullRows, fullCols, icb] = getMapping(data?.result);

        setTableData({ rows, cols, fullRows, fullCols, icb });
        setCount(data?.count);
        setLimit(data?.limit);
      } else {
        const [rows, cols, fullRows, fullCols, icb] = [[], [], [], [], []];
        setTableData({ rows, cols, fullRows, fullCols, icb });
      }

    }
  }, [data]);

  function onRowsPerPageChange(e, { props }) {
    setLimit(props.value);
    let payload = {
      ...(() => _fromStack[SERVICE.FIND]?.payload || {})(),
      limit: props.value,
      offset: page * limit || 0,
    };
    let toast = {
      ...(() => _fromStack[SERVICE.FIND]?.toast || {})(),
    };
    dispatchRequest({
      type: SERVICE.FIND,
      payload,
      toast,
      overwrite: false,
    });
  }

  /**
   * @function onPageChange
   * @param {Object} e
   * @param {Number} newPage
   */
  function onPageChange(e, newPage) {
    setPage(newPage);
    let payload = {
      ...(() => _fromStack[SERVICE.FIND]?.payload || {})(),
      limit,
      offset: newPage * limit || 0,
    };
    let toast = {
      ...(() => _fromStack[SERVICE.FIND]?.toast || {})(),
    };
    dispatchRequest({
      type: SERVICE.FIND,
      payload,
      toast,
    });
  }

  /**
   * @function transformValue - Transforms column value using the transformer if specified
   * @param {Object} modifiers
   * @param {String} modifiers.key
   * @param {String} modifiers.value
   * @param {Object} modifiers.state
   * @returns
   */
  function TransformValue({ item, value = "", idx, state, ...rest }) {
    if (String(item).toLowerCase() in transformers) {
      return transformers[item]({ item, value, ...rest }) || null;
    }
    return String(value);
  }

  /**
   * @function singleSelect - Singularly selects a checkbox
   * @param {String} id
   * @returns
   */
  function singleSelect(id) {
    // console.log(selected);
    return (
      <div className={`custom-control custom-checkbox ml-2`}>
        <input
          disabled={!bulkActions}
          type="checkbox"
          className="custom-control-input "
          id={`select_table_record_${id}_${uuid}`}
          required=""
          checked={selected.includes(id)}
          onChange={() => toggleSelect(id)}
        />
        <label
          className="custom-control-label"
          htmlFor={`select_table_record_${id}_${uuid}`}
        ></label>
      </div>
    );
  }

  function onSearch(opts) {
    retryDispatch(SERVICE.FIND, {
      ...(() => _fromStack[SERVICE.FIND]?.payload || {})(),
      ...opts,
    });
  }

  const { t } = useTranslation();
  return (
    <>
      {showSearch && (
        <div className="" style={{ maxWidth: 500 }}>
          <TableSearch {...{ isFetching, onSearch }} />
        </div>
      )}
      <Card style={{ position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>

          {
            tableData.rows.length ? (
              <>
                <Table
                  key={uuid}
                  style={{ flexGrow: "auto", margin: 0 }}
                  responsive
                  hover
                  size="sm"
                >
                  <thead>
                    <tr>
                      <th>
                        <div className="custom-control custom-checkbox mx-2">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`select_all_table_record#${uuid}`}
                            disabled={!bulkActions || !tableData.rows.length}
                            checked={selected?.length === tableData.rows?.length}
                            onChange={() => bulkSelect(tableData.rows)}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor={`select_all_table_record#${uuid}`}
                          ></label>
                        </div>
                      </th>
                      {String(omit) !== "*" &&
                        tableData?.cols?.map((col, key) => (
                          <th key={key}>{String(col)?.replace(/[_]/g, " ")}</th>
                        ))}
                      {extras?.map((extra, key) => (
                        <th key={key}>
                          {String(t(extra))?.replace(/[_]/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, key) => {
                      return (
                        <tr key={key}>
                          {/* <td> {singleSelect(row?.id ?? key)}</td> */}
                          <td> {singleSelect(row?.user_id ?? key)}</td>
                          {String(omit) !== "*" &&
                            Object.entries(row).map(([item, value], idx) => (
                              <td key={idx}>
                                <TransformValue
                                  {...{ item, value, row, state: tableData, idx }}
                                />
                              </td>
                            ))}
                          {extras?.map((item, idx) => (
                            <td key={idx}>
                              <TransformValue
                                {...{
                                  item,
                                  value: "",
                                  row,
                                  state: tableData,
                                  idx,
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {/* Pagination */}
                <div
                  style={{
                    borderTop: "1px solid #ededed",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {selected?.length > 1 ? (
                      <BulkActionSelector>Bulk actions</BulkActionSelector>
                    ) : null}
                  </div>
                  <StyledPagination
                    style={{ alignItems: "center" }}
                    component="div"
                    count={count}
                    page={page}
                    onPageChange={onPageChange}
                    rowsPerPage={limit || 10}
                    onRowsPerPageChange={onRowsPerPageChange}
                  />
                </div>
              </>
            ) : (
              <Empty />
            )}
        </div>
        {isFetching && (
          <div
            style={{
              padding: "10px 70px 70px",
              position: "absolute",
              overflow: "hidden",
              top: 0,
              width: "100%",
              left: 0,
              height: "100%",
              background: "#ffffffed",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Skeleton style={{ width: "100%", paddingTop: "5%" }} />
            <Skeleton style={{ width: "100%" }} animation="wave" />
            <Skeleton style={{ width: "100%" }} animation={false} />
            <Skeleton style={{ width: "100%" }} animation={"wave"} />
            <Skeleton style={{ width: "100%" }} animation={false} />
            <Skeleton style={{ width: "100%", paddingTop: "5%" }} />
          </div>
        )}
      </Card>
    </>
  );
}

export default TableGenerator;

function TableSearch({ onSearch, isFetching }) {
  let [keyword, setKeyword] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    onSearch({
      q: keyword,
    });
  }
  return (
    <form
      onSubmit={onSubmit}
      style={{ padding: "15px 0", display: "flex", gap: 10, flexWrap: "wrap" }}
    >
      <div>
        <input
          type="text"
          value={keyword}
          onChange={(ev) => setKeyword(ev.target?.value)}
          placeholder="Enter search term here"
          className="form-control"
          disabled={isFetching}
        />
      </div>
      <button
        disabled={isFetching}
        className="btn btn-primary btn-sm"
        type="submit"
      >
        {isFetching ? "Loading..." : "Search"}
      </button>
    </form>
  );
}

TableGenerator.propTypes = {
  // data: pt.object,
  service: pt.object,
  mapping: pt.object,
  omit: pt.any,
  extras: pt.array,
  transformers: pt.object,
  intermediaryCallback: pt.func,
};

TableGenerator.defaultProps = {
  intermediaryCallback: null,
};
