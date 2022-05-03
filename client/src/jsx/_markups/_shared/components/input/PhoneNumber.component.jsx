// import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState, forwardRef } from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";

const PhoneNumberInputGroup = styled.div`
  display: flex;
  flex: 1 auto;
  width: 100%;
  /* height: calc(1.5em + 0.75rem + 2px); */
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  &:focus,
  &:focus-within {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  input {
    /* padding: 8px; */
    border: none;
    &:focus,
    &:focus-within {
      border: none;
      box-shadow: none;
      outline: none;
    }
  }
  .dial-code-field {
    max-width: 80px;
    flex: 0;
    /* border-right: 1px solid #acacac; */
  }
  .number-field {
    flex: auto;
  }
  select {
  }
`;
const PhoneNumber = forwardRef(
  ({ onChange, onError, defaultValue = "", altTitle = "Code" }, ref) => {
    const {
      services: { type },
    } = useServiceContextHook();

    const [dialCodes, setDialCodes] = useState();
    const [phoneNumber, setPhoneNumber] = useState({
      dial_code: "",
      number: "",
    });
    const [errors, setErrors] = useState({});

    function handleChange({ target: { name, value } }) {
      console.log("handleChange   : " + name + "   " + value)
      console.log("phoneNumber")
      console.log(phoneNumber);
      let newEntry = { ...phoneNumber, [name]: String(value).trim() };
      console.log(newEntry);
      setPhoneNumber(newEntry);
      validate(newEntry)

      onChange(Object.values(newEntry)?.join(""));
      // console.log(phoneNumber)
      // if (/[+\(\)0-9]+/.test(value)) {
      //   setPhoneNumber(newEntry);
      //   onChange(Object.values(newEntry)?.join(" "));
      // }
    }

    function validate(values) {
      const errors = {};
      if (!/^[0-9]{8,12}$/g.test(values.number)) {
        errors.number = "Only numeric characters (8 - 12) characters long, are allowed";
      }

      if (!(values.dial_code.replace(/[()]/g, '') in dialCodes)) {
        
        errors.dial_code =  `Invalid dial code. Adjust dial code`
        // setErrors({
        //   dial_code: `Invalid dial code. Adjust dial code`,
        // });
      }

      setErrors(errors)
      return errors;
    }
    useEffect(() => {
      onError && onError(errors);
    }, [errors]);

    useEffect(() => {
      (async () => {
        try {
          let { data } = await type.findByName("dial_codes");
          let dial_codes = {};
          data.forEach(({ name, code, dial_code }) => {
            dial_codes[dial_code] = `${code} (${dial_code})`;
          });
          if (dial_codes)
            setDialCodes((state) => ({ ...state, ...dial_codes }));
        } catch (err) {
          console.error(err);
        }
      })();
    }, []);

    // useEffect(() => {
    //   if (dialCodes && defaultValue) { 
    //     // console.log("defaultValue  :"+defaultValue )
    //     let a = String(defaultValue);
    //     let b = a.match(/^(\W{0,1}[+]\d{1,4}\W{0,1})/);
    //     // console.log("a  "+a)
    //     // console.log("b   "+b)

    //     if (b) {
    //       b = String(b[0]).trim();
    //       let newEntry = {
    //         dial_code: b,
    //         number: String(a.substring(b.length)).trim(),
    //       };
    //       validate(newEntry);

    //       if (!(b.replace(/[()]/g, '') in dialCodes)) {
    //         setErrors({
    //           dial_code: `Invalid dial code. Adjust dial code`,
    //         });
    //       }

    //       setPhoneNumber(newEntry);
    //     } else {
    //       setErrors({
    //         number: `Phone number is not in the correct format`,
    //       });
    //     }
    //   }
    // }, [defaultValue, dialCodes]);

    return (
      <>
        <PhoneNumberInputGroup>
          <datalist id="dial_codes">
            {dialCodes &&
              Object.entries(dialCodes).map(([value, key], idx) => (
                <option key={idx} value={`${value}`}>
                  {key}
                </option>
              ))}
          </datalist>
          {/* Dial codes */}
          <input
            list="dial_codes"
            name="dial_code"
            maxLength={8}
            value={phoneNumber?.dial_code}
            className="dial-code-field"
            placeholder="Dial code"
            ref={ref}
            onChange={handleChange}
          />
          {/* Number field */}
          <input
            pattern="^^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$"
            type="number"
            name="number"
            value={phoneNumber?.number}
            className="number-field"
            onChange={handleChange}
            placeholder="Phone number"
          />
        </PhoneNumberInputGroup>

        <div style={{}}>
          <small className="dial_code_error text-danger">
            {errors && errors.dial_code}
          </small>
          <small className="number_error text-danger">
            {errors && errors.number}
          </small>
        </div>
      </>
    );
  }
);

export default PhoneNumber;
