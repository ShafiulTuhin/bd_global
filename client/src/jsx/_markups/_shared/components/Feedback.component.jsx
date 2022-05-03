import { useTranslation } from "react-i18next";
import { Children } from "react";
import Loader from "./Loader.component";

const sharedStyles = {
  padding: 20,
  width: "100%",
  textAlign: "center",

  height: 200,
  display: "flex",
  gap: 10,
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const HeadlineStyle = {
  fontSize: 20,
  fontWeight: 600,
};

export function Empty({ children, text = "No records found here!" }) {
  const { t } = useTranslation();
  return Children.count(children) ? (
    Children.toArray(children).map((item) => item)
  ) : (
    <div style={sharedStyles}>
      <h3 style={HeadlineStyle}>{t(text)}</h3>
    </div>
  );
}

export function Table({ cols = 1 }) {
  const { t } = useTranslation();
  return (
    <tr>
      <td colSpan={cols} className="">
        <div style={sharedStyles}>{t("No records found!")}</div>
      </td>
    </tr>
  );
}
export function Chat() {
  const { t } = useTranslation();
  return (
    <div style={{ ...sharedStyles, height: "100%" }}>
      <h3 style={HeadlineStyle}>{t("No Message yet!")}</h3>
    </div>
  );
}
export function Loading({ placeholder = "Loading data..." }) {
  const { t } = useTranslation();
  return (
    <div style={{ ...sharedStyles, height: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <Loader />
        <small className="text-muted">{placeholder}</small>
      </div>
    </div>
  );
}

export default Object.assign(Empty, {
  Table,
  Loading,
  Chat,
});
