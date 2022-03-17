import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { AddOnButton } from "../../_shared/components/styled.component";

export function NumbericInput({
  onChange = null,
  allowNegative = false,
  stepValue = 1,
  minValue = null,
  maxValue = null,
  defaultValue = undefined,
  attributes = { placeholder: "Enter a number" },
}) {
  const [value, setValue] = useState(defaultValue);
  const inputStyle = {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "textfield",
    padding: "4px 8px",
    border: "none",
    flex: "1",
    width: 0,
    background: "transparent",
    borderRadius: "inherit",
    margin: 0,
  };

  function setValues(val) {
    setValue(val ?? "");
    onChange(val ?? "");
  }
  function increment() {
    if (maxValue && value == maxValue) return;
    let val = numeral(value).value() + stepValue;
    setValues(val);
  }

  function decrement() {
    if (!allowNegative && value === 0) return;
    if (minValue && value == minValue) return;
    let val = numeral(value).value() - stepValue;
    setValues(val);
  }

  function onChangeValue({ target }) {
    let val = numeral(target.value).value();
    setValues(val);
  }

  useEffect(() => {
    if (defaultValue) setValue(numeral(defaultValue).value());
  }, [defaultValue]);

  return (
    <div
      style={{
        display: "flex",
        width: "auto",
        flex: "auto",
        borderRadius: 4 /* overflow: 'hidden', */,
      }}
    >
      <input
        style={inputStyle}
        {...{ ...attributes, onChange: onChangeValue }}
        type="number"
        value={value}
      />
      <AddOnButton
        type="button"
        disabled={!allowNegative && value === 0}
        onClick={decrement}
      >
        <span className="fas fa-minus"></span>
      </AddOnButton>
      <AddOnButton type="button" onClick={increment}>
        <span className="fas fa-plus"></span>
      </AddOnButton>
    </div>
  );
}
