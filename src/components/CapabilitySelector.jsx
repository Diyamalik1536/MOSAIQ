import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./CapabilitySelector.css";

const capabilities = [
  {
    key: "discoverTalent",
    id: "matching",
    target: "/#matching"
  },
  {
    key: "exploreProjects",
    id: "projects",
    target: "/#projects"
  },
  {
    key: "buildTogether",
    id: "builders",
    target: "/#builders"
  }
];

export default function CapabilitySelector() {
  const { t } = useTranslation("landing");
  const [activeSection, setActiveSection] = useState("matching");

  useEffect(() => {
    const sections = capabilities
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    const observeSections = () => {
      observer?.disconnect();
      const activationStart = Math.round(window.innerHeight * 0.36);
      const activationEnd = Math.round(window.innerHeight * 0.46);
      observer = new IntersectionObserver(
        () => {
          const activationLine = window.innerHeight * 0.41;
          const active = capabilities.filter(({ id }) => {
            const section = document.getElementById(id);
            if (!section) return false;
            const bounds = section.getBoundingClientRect();
            return bounds.top <= activationLine && bounds.bottom > activationLine;
          });

          if (active.length) {
            setActiveSection(active[active.length - 1].id);
          }
        },
        {
          rootMargin: `-${activationStart}px 0px -${Math.max(
            0,
            window.innerHeight - activationEnd
          )}px 0px`
        }
      );

      sections.forEach((section) => observer.observe(section));
    };

    let observer;
    observeSections();
    window.addEventListener("resize", observeSections);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeSections);
    };
  }, []);

  return (
    <>
      <section
        className="tf-capability-selector"
        aria-labelledby="tf-capability-heading"
      >
        <div className="tf-capability-content">
          <p className="tf-capability-eyebrow">{t("capabilitySelector.eyebrow")}</p>
          <h2 className="tf-capability-heading" id="tf-capability-heading">
            {t("capabilitySelector.heading")}
          </h2>
          <p className="tf-capability-description">
            {t("capabilitySelector.description")}
          </p>
        </div>
      </section>

      <nav className="tf-capability-nav" aria-label="MOSAIQ sections">
        {capabilities.map(({ key, id, target }) => (
          <Link
            key={id}
            className={`tf-capability-link${
              activeSection === id ? " is-active" : ""
            }`}
            to={target}
            aria-current={activeSection === id ? "location" : undefined}
          >
            {t(`capabilitySelector.capabilities.${key}.label`)}
          </Link>
        ))}
      </nav>
    </>
  );
}
