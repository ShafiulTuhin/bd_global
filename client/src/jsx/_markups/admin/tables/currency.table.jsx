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
import useTableMapper from "../../../_hooks/table.generator";

function CurrenciesTable({
  data = [],
  actions = {},
  mapping = {
    id: "Currency ID",
    iso_code: "symbol",
  },
  omit = [
    "archived_at",
    "created_by",
    "createdAt",
    "updatedAt",
    "updated_at",
    "created_at",
  ],
}) {
  const { selected, toggleSelect, checkedAll } = useTableSelector();
  const [tableData, setTableData] = useState({ rows: [], cols: [] });

  useEffect(() => {
    const getMapping = (data) => [
      data.map((obj) =>
        Object.keys(obj)
          .filter((key) => !omit.includes(key))
          .map((key) => obj[key])
      ),
      Object.keys(data[0])
        .filter((itm) => !omit.includes(itm))
        .map(
          (key) => (
            console.log(key in mapping, { key, mapping }, mapping[key]),
            key in mapping ? mapping[key] : key
          )
        ),
    ];

    if (data?.length) {
      const [rows, cols] = getMapping(data);
      console.table(rows, cols);
      console.log(rows, cols);
      setTableData({ rows, cols });
    }
  }, [data]);

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useToggler();

  const singleSelect = (id) => (
    <div className={`custom-control custom-checkbox ml-2`}>
      <input
        type="checkbox"
        className="custom-control-input "
        id={`check_currency_record_${id}`}
        required=""
        checked={selected.includes(id)}
        onChange={() => toggleSelect(id)}
      />
      <label
        className="custom-control-label"
        htmlFor={`check_currency_record_${id}`}
      ></label>
    </div>
  );

  return tableData.rows.length ? (
    <Table responsive hover size="sm">
      <thead>
        <tr>
          <th>#</th>
          {tableData.cols.map((col, key) => (
            <th key={key}>{col.replace(/[_]/, " ")}</th>
          ))}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {tableData.rows.map((row, key) => (
          <tr key={key}>
            <td>1</td>
            {row.map((value, idx) => (
              <td key={idx}>{value}</td>
            ))}
            <td></td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <EmptyRecord />
  );
}

CurrenciesTable.defaultProps = {
  rows: [["7ed28ecc-b1ef-4967-9306-4ec1f20639e6", "eth", "ethereum", "crypto"]],
  cols: ["currency_id", "symbol", "full_name", "type"],
  actions: {
    get: () => "Gets the table data",
    post: () => "Creates table record",
    put: () => "Updates table record",
    drop: () => "Deletes table record",
  },
};

CurrenciesTable.propTypes = {
  params: pt.object,
};

export default Object.assign(CurrenciesTable, {});
