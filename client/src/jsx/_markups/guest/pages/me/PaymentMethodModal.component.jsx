import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import {
  Radio,
  FormControl,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { BankTransferForm } from "./BankTransferForm.component";
import { WechatForm } from "./WechatForm.component";
import { AlipayForm } from "./AlipayForm.component";
import FeedbackComponent from "../../../_shared/components/Feedback.component";

export default function PaymentMethodModal({
  isOpen,
  onClose,
  payload = { type: null, data: {}, onUpdate: () => null },
}) {
  const [method, setMethod] = useState(null);

  useEffect(() => {
    setMethod(payload?.type || "bank_transfer");
  }, [payload]);

  function onChangeMethod({ target }) {
    setMethod(target?.value);
  }

  return method ? (
    <>
      <Modal show={isOpen} onHide={onClose}>
        <Modal.Header>
          <h3 className="lead">Payment method</h3>
        </Modal.Header>
        <Modal.Body style={{ padding: 0, paddingBottom: 20 }}>
          <FormControl
            component="fieldset"
            style={{ paddingLeft: 20, paddingTop: 10 }}
          >
            <RadioGroup
              row
              aria-label="payment_method"
              name="payment_method"
              value={method}
              onChange={onChangeMethod}
            >
              <FormControlLabel
                value="bank_transfer"
                control={<Radio />}
                label="Bank transfer"
              />
              <FormControlLabel
                value="wechat"
                control={<Radio />}
                label="Wechat"
              />

              <FormControlLabel
                value="alipay"
                control={<Radio />}
                label="Alipay"
              />
            </RadioGroup>
          </FormControl>
          <hr />
          <div>
            {method == "bank_transfer" ? (
              <BankTransferForm {...payload} />
            ) : null}
            {method == "wechat" ? <WechatForm {...payload} /> : null}
            {method == "alipay" ? <AlipayForm {...payload} /> : null}
          </div>
        </Modal.Body>
      </Modal>
    </>
  ) : (
    <FeedbackComponent.Loading />
  );
}
