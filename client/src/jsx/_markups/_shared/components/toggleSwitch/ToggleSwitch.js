import React, { Component } from 'react';
import './ToggleSwitch.scss';
const ToggleSwitch = ({ id, name, checked, onChange, optionLabels, small, disabled }) => {
console.log(optionLabels)
    return (
      <div className={"toggle-switch" + (small ? " small-switch" : "")}>
        <input
          type="checkbox"
          name={name}
          className="toggle-switch-checkbox"
          id={id}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          />
          {id ? (
            <label className="toggle-switch-label" htmlFor={id}>
              <span
                className={
                  disabled
                    ? "toggle-switch-inner toggle-switch-disabled"
                    : "toggle-switch-inner"
                }
                data-yes={optionLabels[0]}
                data-no={optionLabels[1]}
              />
              <span
                className={
                disabled
                  ? "toggle-switch-switch toggle-switch-disabled"
                  : "toggle-switch-switch"
                }
              />
            </label>
          ) : null}
        </div>
      );
  }
  
  // Set optionLabels for rendering.
  ToggleSwitch.defaultProps = {
    optionLabels:  ["Yes", "No"],
  };
export default ToggleSwitch;