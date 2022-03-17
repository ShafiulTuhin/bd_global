import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";

export default function OrderScope({ onChange, attributes }) {
  const { session: user } = useServiceContextHook();
  const [statuses, setStatuses] = useState({ "": "All orders" });

  useEffect(async () => {
    user && setStatuses((state) => ({ ...state, [user?.id]: "My orders", [{$not: user?.id}]:"Received orders" }));
  }, [user]);

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
