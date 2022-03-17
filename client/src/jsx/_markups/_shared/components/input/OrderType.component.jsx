import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";

export default function OrderType({ onChange, attributes }) {
  const {
    services: { type },
  } = useServiceContextHook();
  const [orderTypes, setOrderTypes] = useState({ "": "All" });

  useEffect(async () => {
    try {
      let { data } = await type.findByName("TRADE_TYPES");
      if (data) setOrderTypes((state) => ({ ...state, ...data }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <SelectInput
      onChange={onChange}
      attributes={{
        ...{ name: "order-type", id: "order-type", ...attributes },
      }}
      data={orderTypes}
    />
  );
}
