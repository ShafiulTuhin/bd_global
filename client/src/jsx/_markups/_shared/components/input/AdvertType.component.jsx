import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";

export default function AdvertType({ onChange, attributes }) {
  const {
    session: { user },
  } = useServiceContextHook();
  const [advertTypes, setAdvertTypes] = useState({ "": "All" });

  useEffect(() => {
    (async () => {
      try {
        let data = {
          ...(user && {
            [user?.id]: "Personal",
          }),
        };
        if (data) setAdvertTypes((state) => ({ ...state, ...data }));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user]);

  return (
    <SelectInput
      onChange={onChange}
      attributes={{
        name: "payment-methods",
        id: "payment-methods",
        ...attributes,
      }}
      data={advertTypes}
    />
  );
}
