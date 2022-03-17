import { useState } from "react";
import props from "prop-types";
import { TablePagination, Skeleton } from "@mui/material";
import styled from "styled-components";

const StyledPagination = styled(TablePagination)`
    border-bottom: none;
    flex: auto;
  p {
    margin: 0 auto;
    color: #a3a3a3;
  }
`;

function usePaginator(opts) {
  const [count, setCount] = useState(opts?.count || 0);
  const [page, setPage] = useState(opts?.page || 0);
  const [limit, setLimit] = useState(opts?.limit || 10);

  function onRowsPerPageChange(e, { props }) {
    setLimit(props.value);
    let payload = {
      limit: props.value,
      offset: page * limit || 0,
    };
  }

  /**
   * @function onPageChange
   * @param {Object} e
   * @param {Number} newPage
   */
  function onPageChange(e, newPage) {
    setPage(newPage);
    let payload = {
      limit,
      offset: newPage * limit || 0,
    };   
  }
  return {
    count,
    page,
    limit,
    setLimit,
    setCount,
    setPage,
    onRowsPerPageChange,
    onPageChange,
    StyledPagination,
    Skeleton,
  };
}

usePaginator.defaultprops = {
  count: 0,
  page: 0,
  limit: 10,
};
usePaginator.defaultName = "usePaginator";

usePaginator.propTypes = {
  count: props.number,
  page: props.number,
  limit: props.number,
};

export default usePaginator;
