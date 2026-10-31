
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Hero from "../components/Hero";
import CapabilitySelector from "../components/CapabilitySelector";
import StudentMatching from "../components/StudentMatching";
import TalentStream from "../components/TalentStream";
import FAQ from "../components/FAQ";
import BrowseProjects from "./BrowseProjects";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const behavior = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
      ? "instant"
      : "smooth";

    if (hash) {
      const element = document.querySelector(hash);

      if (element) {
        element.scrollIntoView({ behavior });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}

export default function LandingPage() {
  const { t } = useTranslation("site");

  return (
    <>
      <ScrollManager />

      <main id="main-content">
        <Hero />

        <div className="tf-stack-experience">
          <CapabilitySelector />

          <div className="tf-stack-panel tf-stack-panel-matching">
            <StudentMatching />
          </div>

          <section
            id="projects"
            className="tf-stack-panel tf-stack-panel-projects tf-projects-anchor"
            aria-label={t("projects.gallery")}
          >
            <BrowseProjects />
          </section>

          <div className="tf-stack-panel tf-stack-panel-builders">
            <TalentStream />
          </div>
        </div>

        <FAQ />
      </main>
    </>
  );
}
