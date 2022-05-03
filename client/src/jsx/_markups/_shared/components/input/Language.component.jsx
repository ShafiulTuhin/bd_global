import SelectInput from "./Select.component";
import i18next from "i18next";
import cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const languages = {
  en: "English (en)",
  ko: "Korean (코)",
};

export default function LanguageSelector({ attributes, data }) {
  // const currentLanguage = cookies.get("i18next") || "en";
  const { i18n, ready } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  function onChangeLanguage(language) {
    i18next.changeLanguage(language);
    
  }

  useEffect(() => {
    setLanguage(i18n.language || "en");
  }, [i18n]);

  return ready ? (
    <SelectInput
      onChange={onChangeLanguage}
      attributes={{
        name: "choose-language",
        id: "choose-language",
        ...attributes,
        defaultValue: language,
      }}
      data={languages}
    />
  ) : (
    "loading..."
  );
}
