import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";
/* const currencies = {
  ALL: null,
  USDT: "usdt",
  BTC: "btc",
  EOS: "eos",
  ETH: "eth",
  XRP: "xrp",
};
 */
export default function CryptoCurrencySelector({
  onChange,
  attributes,
  all = false,
  onlySymbol = false,
  altTitle = "Crypto",
}) {
  const {
    services: { type },
  } = useServiceContextHook();
  const [currencies, setCurrencies] = useState({
    ...(!all && { "": altTitle }),
  });

  useEffect(async () => {
    try {
      let { data } = await type.findByName(`supported_tokens`);
      if (!data) throw new Error("Error fetching crypto currencies");

      /* let obj = {};
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
          name: "crypto-currencies",
          id: "crypto-currencies",
          ...attributes,
        },
      }}
      transformValue={(key, value) => {
        return onlySymbol
          ? String(value)?.toUpperCase().replace(/[-_]/, " ")
          : `${
              String(value)[0]?.toUpperCase() +
              value?.substring(1).replace(/[-_]/g, " ")
            } ${key && `(${key})`}`;
      }}
      data={currencies}
    />
  );
}
