import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "ko"],
    fallbackLng: "en",
    debug: false,
    // Options for language detector
    detection: {
      order: ["path", "cookie", "htmlTag"],
      caches: ["cookie"],
    },
    // react: { useSuspense: false },
    backend: {
      loadPath: "/assets/locales/{{lng}}/translation.json",
    },
  });

export default i18n;