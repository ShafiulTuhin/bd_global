import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";

export default function CountrySelector({
  onChange,
  attributes,
  altTitle = "Countries",
}) {
  const {
    services: { type },
  } = useServiceContextHook();
  const [countries, setCountries] = useState({ "": altTitle });

  useEffect(async () => {
    try {
      let { data } = await type.findByName("countries");
      if (data) setCountries((state) => ({ ...state, ...data }));
    } catch (err) {
      console.error(err);
    }
  }, []);
  return (
    <SelectInput
      onChange={onChange}
      attributes={{
        ...{
          name: "countries",
          id: "countries",
          ...attributes,
        },
      }}
      data={countries}
    />
  );
}
