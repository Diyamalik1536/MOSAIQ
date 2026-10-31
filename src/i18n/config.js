import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "../locales/en/common.json";
import hiCommon from "../locales/hi/common.json";
import paCommon from "../locales/pa/common.json";

import enLanding from "../locales/en/landing.json";
import hiLanding from "../locales/hi/landing.json";
import paLanding from "../locales/pa/landing.json";

import enSite from "../locales/en/site.json";
import hiSite from "../locales/hi/site.json";
import paSite from "../locales/pa/site.json";

import enApp from "../locales/en/app.json";
import hiApp from "../locales/hi/app.json";
import paApp from "../locales/pa/app.json";

const supportedLanguages = ["en", "hi", "pa"];

const resources = {
  en: { common: enCommon, landing: enLanding, site: enSite, app: enApp },
  hi: { common: hiCommon, landing: hiLanding, site: hiSite, app: hiApp },
  pa: { common: paCommon, landing: paLanding, site: paSite, app: paApp }
};

function getInitialLanguage() {
  try {
    const savedLanguage = localStorage.getItem("talentforge-language");

    return supportedLanguages.includes(savedLanguage)
      ? savedLanguage
      : "en";
  } catch (error) {
    console.warn("Unable to read the saved MOSAIQ language preference:", error);
    return "en";
  }
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    defaultNS: "app",
    ns: ["app", "common", "landing", "site"],
    fallbackNS: ["app", "common"],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });
}

function updateDocumentLanguage(language) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }

  try {
    localStorage.setItem("talentforge-language", language);
  } catch (error) {
    console.warn("Unable to persist the MOSAIQ language preference:", error);
  }
}

i18n.on("languageChanged", updateDocumentLanguage);

if (i18n.isInitialized) {
  updateDocumentLanguage(i18n.language);
}

export default i18n;
