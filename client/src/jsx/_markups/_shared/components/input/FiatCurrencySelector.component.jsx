import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";

export default function FiatCurrency({
  onChange,
  attributes,
  all = false,
  onlySymbol = false,
  altTitle = "Fiat",
}) {
  const {
    services: { type },
  } = useServiceContextHook();
  const [currencies, setCurrencies] = useState({ "": altTitle });

  useEffect(async () => {
    try {
      let { data } = await type.findByName(`supported_fiat`);
      if (!data) throw new Error("Error fetching fiat currencies");

     /*  let obj = {};
      data.result.forEach((value) => {
        obj[value?.iso_code] = value?.name;
      }); */
      setCurrencies((state) => ({ ...state, ...data }));
    } catch (err) {
      console.error(err);
    }
  }, []);
  return (
    <SelectInput
      onChange={onChange}
      attributes={{
        ...{
          name: "fiat-currencies",
          id: "fiat-currencies",
          ...attributes,
        },
      }}
      transformValue={(key, value) => {
        return onlySymbol
          ? String(key)?.toUpperCase()
          : `${String(value)[0]?.toUpperCase() + value?.substring(1)} ${
              key && `(${key})`
            }`;
      }}
      data={currencies}
    />
  );
}
