import React, { Children, useState } from "react";
import { toast } from "react-toastify";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { notify } from "../../../_helpers/notify";

const CopyText = ({ data, children }) => {
  // console.log(data)
  async function copyClick() {
    await navigator.clipboard.writeText(data.data);
    toast.info("Invite code copied!", { hideProgressBar: true });
  }

  return (
    <>
      <div className="d-flex flex-row">
        <div className="d-sm-inline-flex">
          <input
            style={{ border: 0, backgroundColor: "#fff" }}
            type="text"
            className="form-control"
            value={data.data}
            disabled
          />
        </div>
        {/* <div className="input-group-prepend"> */}
        {/* <div className="input-group-text btn-sm" id="btnGroupAddon" onClick={copyClick} >copy</div> */}
        {/* <button
            style={{ backgroundColor: "#fff" }}
            type="button"
            class="btn btn-light"
            onClick={copyClick}
          > */}
        <CopyToClipboard text={data} onCopy={() => notify("Copied")}>
          {!Children.count(children) ? (
            <i className="fal fa-copy" />
          ) : (
            Children.toArray(children).map((item) => item)
          )}
        </CopyToClipboard>
        {/* </button> */}
        {/* </div> */}
      </div>
    </>
  );
};

export default CopyText;
