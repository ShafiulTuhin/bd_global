import SelectInput from "./Select.component";
import useServiceContextHook from "../../../../_hooks/service.context.hook";
import { useEffect, useState } from "react";

export default function NetworkSelector({
  onChange,
  attributes,
  filter,
  altTitle = "Select network",
}) {
  const {
    services: { type },
  } = useServiceContextHook();
  const [networks, setNetworks] = useState({
    [altTitle]: "",
  });

  useEffect(async () => {
    try {
      let {
        data,
        error,
        message = "Could not fetch supported network",
      } = await type.findByName("SUPPORTED_NETWORKS");

      if (!data) throw new Error(error?.message || message);
      let obj = {};
      Array.isArray(data) &&
        data?.map(({ name, assets }, idx) => {
          obj[name] = assets;
        });
      setNetworks((state) => ({ ...state, ...obj }));
    } catch (err) {
      console.error(err);
    }
  }, []);
  return (
    networks && (
      <SelectInput
        onChange={onChange}
        attributes={{
          ...{
            name: "supported-networks",
            id: "supported-networks",
            ...attributes,
          },
        }}
        /*  transformValue={(key, value) => {
        return onlySymbol
          ? String(value)?.toUpperCase()
          : `${String(value)[0]?.toUpperCase() + value?.substring(1)} ${
              key && `(${key})`
            }`;
      }} */
        data={
          filter
            ? Object.keys(networks).filter((name) => {
                return networks[name].includes(String(filter)?.toUpperCase());
              })
            : Object.keys(networks)
        }
      />
    )
  );
}
