import { Selector } from "../styled.component";
export default function SelectInput({
  onChange = () => null,
  attributes,
  data,
  transformValue = (key, value) => String(value).replace(/[-_]/gi, " "),
}) {
  return (
    <Selector onChange={(e) => onChange(e.target?.value)} {...attributes}>
      {typeof data == "object" && Array?.isArray(data)
        ? data?.map((item, index) => (
          <option
            key={index}
            value={item}
            style={{ textTransform: "capitalize" }}
       
          >
            {transformValue(index, item)}
          </option>
        ))
        : Object.entries(data)?.map(([key, value]) => (
          <option
            key={key}
            value={key || ""}
            style={{ textTransform: "capitalize" }}
          >
            {transformValue(key, value)}
          </option>
        ))}
    </Selector>
  );
}