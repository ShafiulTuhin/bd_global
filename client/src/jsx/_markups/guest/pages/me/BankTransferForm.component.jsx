import React, { useEffect, useState, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import { TextField } from "@mui/material";
import FiatCurrencySelector from "../../../_shared/components/input/FiatCurrencySelector.component";
import FeedBack from "../../../_shared/components/Feedback.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";

export function BankTransferForm({ data = {}, onUpdate = () => null }) {
  const {
    services: { bank_detail },
  } = useServiceContextHook();
  const inputRef = useRef();
  const { bank_transfer = {} } = data || {};

  const initialValues = {
    bank_name: bank_transfer?.bank_name || "",
    bank_code: bank_transfer?.bank_code || "",
    account_name: bank_transfer?.account_name || "",
    account_number: bank_transfer?.account_number || "",
    currency: bank_transfer?.currency || "USD",
  };
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [bankListData, setBankListData] = useState([]);
  const [activeFilterChar, setActiveFilterChar] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResultData, setFilterResultData] = useState([]);

  const onBankSelect = (bank, swift_code) => {
    setShowBankList(false);
    setSelectedBank(bank);
    setSelectedBankCode(swift_code);
  };

  // LOAD BANK DETAILS
  useEffect(async () => {
    const params = { fake: false };
    try {
      const response = await bank_detail.find(params);
      const { data } = response;
      const { result } = data;
      setBankListData(result);
    } catch (e) {
      console.log(e);
    }

    return bank_detail.abort;
  }, []);

  // RUN FILTER WHENEVER THE SEARCH TERM IS UPDATED
  useEffect(() => {
    let result = bankListData;
    if (searchTerm && Array.isArray(bankListData) && bankListData?.length) {
      result = bankListData.filter((item) => {
        let sorted = String(item.bank_name + item.swift_code)
          .trim()
          .match(new RegExp(`(${searchTerm})`, "gi"));
        return sorted;
        // .toLowerCase()
        // .includes(searchTerm.toLowerCase());
      });
    }
    setFilterResultData(result || bankListData);
  }, [searchTerm, bankListData]);

  // HANDLE BANK NAME CONTROLLED INPUT
  useEffect(() => {
    if (inputRef.current) {
      const ref = inputRef.current;
      ref.value = selectedBank;
    }
  }, [selectedBank, showBankList]);

  // FILTER BY ALPHABET CHARACTER
  const filterbyAlpha = (char) => {
    const result = bankListData.filter((item) => {
      return Object.values(item.bank_name)
        .join(" ")
        .toLowerCase()
        .startsWith(char.toLowerCase());
    });
    setActiveFilterChar(char);
    setFilterResultData(result);
  };
  const alphabetCodes = Array.from(Array(26)).map((e, i) => i + 65);
  const alphabetStrings = alphabetCodes.map((x) => String.fromCharCode(x));

  return (
    <Formik
      // {...{ initialValues }}
      initialValues={{ bank_code: selectedBankCode, bank_name: selectedBank }}
      // validate={(values) => {}}

      validate={(values) => {
        const errors = {};
        if (!values.account_number) {
          errors.account_number = "Account number is required";
        }
        if (!values.account_name) {
          errors.account_name = "Account name is required";
        }
        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const actVal = {
            bank_code: selectedBankCode,
            bank_name: selectedBank,
            account_name: values?.account_name,
            account_number: values?.account_number,
            currency: values.currency,
          };
          onUpdate({ bank_transfer: actVal });
        } catch (error) {
          console.error(error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        errors,
        isSubmitting,
        handleSubmit,
        handleChange,
        setFieldValue,
        handleBlur,
        touched,
      }) => (
        <Form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "column",
            padding: "10px 20px",
            gap: 20,
            justifyContent: "center",
          }}
        >
          <div>
            <label htmlFor="">Bank name</label>
            <input
              ref={inputRef}
              onFocus={() => setShowBankList(true)}
              id="bank_name"
              // value={selectedBank}
              className="field__input form-control"
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              defaultValue={values?.bank_name}
            />
          </div>

          {showBankList ? (
            <div className="alpha-search__container">
              <header></header>

              <div className="alpha-search__picker">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setFilterResultData(bankListData);
                    setActiveFilterChar(null);
                  }}
                >
                  ALL
                </button>
                <ul className="alpha-search__links">
                  {alphabetStrings.map((item, idx) => (
                    <li
                      key={idx}
                      className={`alpha__link ${activeFilterChar === item ? "active" : ""
                        }`}
                      onClick={() => {
                        filterbyAlpha(item);
                      }}
                    >
                      {item}{" "}
                    </li>
                  ))}
                </ul>
              </div>

              <section>
                {!filterResultData.length ? (
                  <FeedBack text="Found no result" />
                ) : (
                  filterResultData.map((item, key) => {
                    const ColorArray = [
                      "orange",
                      "light-green",
                      "dark-green",
                      "dark-green",
                      "red",
                      "green",
                      "green",
                      "blue",
                      "green",
                      "red",
                    ];
                    const random = Math.floor(
                      Math.random() * ColorArray.length
                    );
                    // debugger;
                    return (
                      <div
                        key={key}
                        className={`position-relative cursor-pointer card p-2 mb-2 `}
                        style={{
                          borderLeft: `2px solid ${ColorArray[random]}`,
                        }}
                        onClick={() => {
                          onBankSelect(item.bank_name, item.swift_code);
                        }}
                      >
                        <p className="lead">
                          {String(item.bank_name).replace(/_/, " ")}
                        </p>
                        <small className="text-muted">{item.swift_code}</small>
                      </div>
                    );
                  })
                )}
              </section>

              <Button
                className="d-block w-100"
                style={{ fontWeight: 600, padding: ".75rem 1rem" }}
                onClick={() => setShowBankList(false)}
                disabled={values?.bank_name && !selectedBank}
                type="submit"
              >
                Finish
              </Button>
            </div>
          ) : (
            <>
              {/* Account number */}
              <div>
                <label htmlFor="bank_code">Bank code</label>
                <input
                  id="bank_code"
                  onChange={handleChange}
                  value={selectedBankCode}
                  className="form-control"
                  pattern="^[A-Za-z0-9]{8,11}$"
                  minLength={8}
                  maxLength={11}
                />
              </div>

              {/* Account name */}
              <div>
                <label htmlFor="account_name">Account name</label>
                <input
                  id="account_name"
                  className="form-control"
                  onChange={handleChange}
                  defaultValue={values?.account_name}
                />

                <small className="text-danger">
                  {errors.account_name &&
                    touched.account_name &&
                    errors.account_name}
                </small>
              </div>

              {/* Account number */}
              <div>
                <label htmlFor="account_number">Account number / IBAN</label>
                <input
                  id="account_number"
                  onChange={handleChange}
                  defaultValue={values?.account_number}
                  className="form-control"
                  pattern="^[A-Za-z0-9-]{1,17}$"
                  maxLength={15}
                />

                <small className="text-danger">
                  {errors.account_number &&
                    touched.account_number &&
                    errors.account_number}
                </small>
              </div>

              <div>
                <label htmlFor="">Account currency</label>
                <FiatCurrencySelector
                  all={false}
                  attributes={{
                    value: values?.currency,
                    style: {
                      padding: 10,
                      backgroundColor: "white",
                      boxShadow: "rgba(78, 77, 77, 50%) 0px 0px 0px 1px",
                      borderRadius: 4,
                    },
                  }}
                  onChange={(val) => setFieldValue("currency", val)}
                />
              </div>
              <Button
                disabled={isSubmitting}
                type="submit"
                className="d-block w-100"
                style={{ fontWeight: 600, padding: ".75rem 1rem" }}
              >
                {isSubmitting ? "Saving" : "Save"}
              </Button>
            </>
          )}
        </Form>
      )}
    </Formik>
  );
}
