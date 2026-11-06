import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import sw from "./locales/sw.json";

/**
 * i18n setup.
 *  - English is the launch language and the fallback for anything not yet translated.
 *  - Kiswahili: add strings to locales/sw.json (missing keys fall back to English),
 *    then add "sw" to SUPPORTED_LANGUAGES below to show it in the language picker.
 *  - Use in components:  const { t } = useTranslation();  t("common.loading")
 */
export const SUPPORTED_LANGUAGES = ["en"] as const; // add "sw" when translations are reviewed
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const stored = (() => {
  try { return localStorage.getItem("akili_lang"); } catch { return null; }
})();

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sw: { translation: sw } },
  lng: stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored) ? stored : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

export const setLanguage = (lng: AppLanguage) => {
  try { localStorage.setItem("akili_lang", lng); } catch { /* storage unavailable: ignore */ }
  document.documentElement.lang = lng;
  return i18n.changeLanguage(lng);
};

document.documentElement.lang = i18n.language;

export default i18n;
