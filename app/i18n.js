"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./utils/en.json";
import hi from "./utils/hi.json";
import mr from "./utils/mr.json";

i18n
  .use(initReactI18next) 
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;