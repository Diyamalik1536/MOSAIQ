import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSelector.css";

const languages = [
  { code: "en", flag: "🇮🇳", key: "english", label: "EN", name: "English" },
  { code: "hi", flag: "🇮🇳", key: "hindi", label: "HI", name: "हिन्दी" },
  { code: "pa", flag: "🇮🇳", key: "punjabi", label: "PA", name: "ਪੰਜਾਬੀ" }
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentCode = ["en", "hi", "pa"].includes(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : "en";

  const currentLang = languages.find((l) => l.code === currentCode) || languages[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  function handleSelect(code) {
    i18n.changeLanguage(code);
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div
      className="tf-language-selector"
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={`tf-language-btn ${isOpen ? "is-active" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("language.label", "Language selection")}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="tf-language-flag" aria-hidden="true">{currentLang.flag}</span>
        <span className="tf-language-code">{currentLang.label}</span>
        <svg
          className={`tf-language-chevron ${isOpen ? "is-rotated" : ""}`}
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          className="tf-language-menu"
          role="listbox"
          aria-label={t("language.label", "Select Language")}
        >
          {languages.map((lang) => {
            const isSelected = lang.code === currentCode;
            return (
              <li
                key={lang.code}
                role="option"
                aria-selected={isSelected}
              >
                <button
                  type="button"
                  className={`tf-language-option ${isSelected ? "is-selected" : ""}`}
                  onClick={() => handleSelect(lang.code)}
                >
                  <span className="tf-option-flag" aria-hidden="true">{lang.flag}</span>
                  <span className="tf-option-name">{lang.name}</span>
                  {isSelected && (
                    <svg
                      className="tf-option-check"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M20 6 9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
