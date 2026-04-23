"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { changeLanguage } from "@/app/store/slices/languageSlice";
import { useTranslation } from "react-i18next";

export default function useLanguage() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const language = useSelector((state) => state.language.language);

  // Sync with i18n
  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
      localStorage.setItem("language", language);
    }
  }, [language, i18n]);

  // Load saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved && saved !== language) {
      dispatch(changeLanguage(saved));
    }
  }, [dispatch, language]);

  const setLanguage = (lang) => {
    dispatch(changeLanguage(lang));
  };

  return { language, setLanguage };
}