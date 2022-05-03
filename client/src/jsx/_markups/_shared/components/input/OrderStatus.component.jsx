import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";

export default function OrderStatus({ onChange, attributes }) {
  const {
    services: { type },
  } = useServiceContextHook();
  const [statuses, setStatuses] = useState({ "": "All" });

  useEffect(async () => {
    try {
      let { data } = await type.findByName("ORDER_STATUSES");
      if (data) setStatuses((state) => ({ ...state, ...data }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <SelectInput
      onChange={onChange}
      attributes={{
        name: "order-statuses",
        id: "order-statuses",
        ...attributes,
      }}
      data={statuses}
    />
  );
}
