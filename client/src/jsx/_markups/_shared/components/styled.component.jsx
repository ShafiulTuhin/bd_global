import styled from "styled-components";
import UIColors from "./colors";
import { Switch } from "@mui/material";

export const FieldGroup = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  /* box-shadow: 0 0 0px 1px #acacac; */
  border: 1px solid #acacac;
  overflow: hidden;
  border-radius: 4px;
  .field__input {
    flex: auto;
    padding: 8px 12px;
    min-width: 0;
    user-select: none;
    &:focus {
      outline: none;
      border: none;
      box-shadow: none;
    }
  }
  .field__addon {
    display: inline-flex;
    padding: 8px;
    color: #464444;
  }
`;

export const Selector = styled("select")`
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 9px;
  border: 1px solid transparent;
  align-items: center;
  cursor: pointer;
  /* padding: 0 10px; */
  box-sizing: border-box;
  display: block;
  width: 100%;
  /* max-width: 300px; */
  @media screen and (max-width: 500px) {
    max-width: 100%;
  }
`;

export const StyledSelector = styled("div")`
  select {
    ${Selector}
    appearance: none;
    width: 100%;
    max-width: 100%;
    display: block;
    background-color: transparent;
    box-shadow: 0 0 0px 1px rgba(0, 0, 0, 15%);
    border-radius: 4px;
    &:focus {
    }
  }
`;

export const MiscContainer = styled("div")`
  max-height: 250px;
  overflow-y: auto;
  &:not(:empty) {
    padding: 15px;
  }
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 10px 1px #d6d6d655;
  border-radius: 9px;
  font-size: 14px;
  .misc {
    background: white;
    .header {
      padding: 8px;
      border-bottom: 1px solid #ededed;
      .title {
        font-weight: bold;
        line-height: 1;
      }
    }
    .description {
      padding: 8px;
    }
  }
`;

export const StyledSection = styled.section`
  ${(props) => !props.plain && "box-shadow: 0 0 1px 0 #888"};
  border-radius: 8px;
  padding: 15px;
`;

export const DecimalList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 15px;

  list-style-type: decimal;
  list-style-position: inside;
  li {
    list-style-type: inherit;
  }
`;

export const WizardForm = styled.form`
  // padding: 30px 0;
  max-width: 769px;
  width: 100%;
  flex: 1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Cage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* padding: 8px 0; */
`;

export const StyledSwitch = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: inset 0 0 20px -10px rgb(0 0 0 / 15%), 0 0 0 1px #eee;
  border-radius: 10px;
  /* overflow: hidden; */
  /* width: 100%; */
  padding: 0;
  /* border-bottom: 1px solid #ededed; */
  .switch-part {
    cursor: pointer;
    flex-grow: 1;
    display: inline-flex;
    justify-content: center;
    position: relative;
    padding: 8px;
    border-radius: inherit;
    input[type="radio"] {
      position: absolute;
      display: block;
      text-align: center;
      opacity: 0;
      ~ span {
        opacity: 0.5;
        padding: 16px 20px;
        display: inline-flex;
        justify-content: center;
        width: 100%;
        border-radius: inherit;
        transition: all 0.25s ease-in-out;
        user-select: none;
      }
      &:checked ~ span {
        font-weight: bold;
        background: white;
      }
      &:checked:not(:disabled) {
        ~ span {
          color: #0059ff;
          opacity: 1;
          box-shadow: 0 5px 20px -1px rgba(0, 0, 0, 15%), 0 0 1px 1px #0059ff75;
          &:active {
            transform: scale(0.75);
          }
        }
      }
      &:disabled {
        ~ span {
          cursor: not-allowed;
        }
      }
    }
  }
`;

export const StyledPriceInput = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 15%);
  overflow: hidden;

  /* &:focus,
  &:focus-within {
    box-shadow: 0 0 2px 3px rgba(89, 89, 89, 30%);
  } */
  /* padding-left: 8px; */
  > input {
    display: block;
    flex: 1 auto;
    width: auto;
    min-width: 0;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 8px;
    box-sizing: border-box;
    /* max-width: 70%; */

    &:focus {
      border: none;
      box-shadow: none;
      outline: none;
    }
    &:invalid {
      box-shadow: inset 0 0 2px 3px rgba(255, 89, 89, 30%);
    }
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin: 0;
  }
  > button {
    padding: 8px 20px;
    display: block;
    border: none;
    font-size: 18px;
    &:active {
      background: #ededed;
    }
  }
  > .buttons {
    display: flex;
    /* flex: 1 auto; */
    position: relative;
    overflow: hidden;
    border-left: 1px solid rgba(0, 0, 0, 15%);
  }
`;

export const StyleInput = styled.input`
  // display: block;
  // flex: 1 auto;
  // width: auto;
  // min-width: 0;
  // padding-top: 6px;
  // padding-bottom: 6px;
  // padding-left: 8px;
  // box-sizing: border-box;
`;

export const StyledTabParent = styled("section")`
  border: none !important;
  padding: 0 !important;
`;

export const NumberInput = styled("div")`
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin: 0;
  }
`;

export const StyledCard = styled.section`
  box-shadow: 0 2px 10px -2px #a1a1a197;
  border-radius: 8px;
  background: white;
`;

export const StyledTable = styled.table`
  width: 100%;
  // border-top: 1px solid ${UIColors.gray};
  thead {
    border-bottom: 1px solid ${UIColors.gray};
  }
  tr {
    th,
    td {
      padding: 10px;
      min-width: 250px;
    }
    &:hover{
      background: #eee;
    }
  }
`;

export const StyledIcon = styled.figure`
  width: ${(props) => (props.small ? "20px" : "30px")};
`;

export const StyledTabButton = styled.button`
  border: none;
  padding: 10px 12px;
  border-radius: 8px;
  :disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
  &.on {
    color: ${UIColors?.primary};
    font-weight: bold;
  }
`;
export const AuthButtonContainer = styled.div`
  button {
    display: flex;
    width: 100%;
    justify-content: center;
    box-shadow: rgba(0, 0, 0, 0.14) 0px 0px 2px 0,
      rgba(0, 0, 0, 0.14) 0px 0px 1px 0px !important;
  }
`;

export const AuthCard = styled.div`
  box-shadow: 0 5px 20px -10px #9b9b9b;
  border-radius: 8px;
  margin: 60px auto 60px;
  max-width: 500px;
  display: block;
  position: relative;
  background: #fff;
  > .auth-card__header {
    padding: 30px;
    border-bottom: 1px solid #ededed;
  }

  > .auth-card__content {
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`;

export const LogoContainer = styled.figure`
  padding: 15px;
  text-align: center;
  display: block;
  img {
    object-position: center;
    object-fit: contain;
    width: 100%;
    displat: inline-block;
    max-width: 120px;
    margin: 0 auto;
  }
`;

export const AntSwitch = styled(Switch)(({ theme }) => ({
  width: "100%",
  height: 16,
  padding: 0,
  display: "flex",
  position: "relative",
  justifyContent: "center",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    // padding: 2,
    top: 4,
    "&.Mui-checked": {
      transform: "translateX(85%)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor:
          theme?.palette?.mode === "dark" ? "#177ddc" : "#1890ff",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme?.transitions?.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme?.palette?.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));

export const AddOnButton = styled.button`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
  padding: 4px 8px;
  border: none;
  transition: transform 0.25s ease-in-out;
  background: #f0f0f0;

  &:active {
    transform: scale(0.75);
  }
  &:disabled {
    opacity: 0.35;
  }
`;
