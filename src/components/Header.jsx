import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import "./Header.css";

const defaultMenuContent = {
  Explore: {
    eyebrow: "EXPLORE MOSAIQ",
    columns: [
      {
        title: "DISCOVER",
        items: [
          ["Browse Students", "Discover students and their skills."],
          ["Explore Skills", "Find people with complementary strengths."],
          ["Student Network", "Meet people across your campus."]
        ]
      },
      {
        title: "CONNECT",
        items: [
          ["Find Collaborators", "Build your next idea with others."],
          ["Discover Interests", "Find people who share your interests."]
        ]
      },
      {
        title: "GET STARTED",
        items: [
          ["Create Your Profile", "Introduce yourself to the community."],
          ["Join MOSAIQ", "Start discovering your campus network."]
        ]
      }
    ]
  },
  Projects: {
    eyebrow: "BUILD SOMETHING TOGETHER",
    columns: [
      {
        title: "PROJECTS",
        items: [
          ["Explore Projects", "Discover projects and new ideas."],
          ["Create a Project", "Share an idea with potential teammates."],
          ["My Listings", "Keep track of your project listings."]
        ]
      },
      {
        title: "COLLABORATE",
        items: [
          ["Find Teammates", "Meet students with useful skills."],
          ["Skill Collaboration", "Bring different strengths together."]
        ]
      },
      {
        title: "YOUR WORKSPACE",
        items: [
          ["My Projects", "Keep your work organized."],
          ["Project Community", "Connect around shared ideas."]
        ]
      }
    ]
  },
  Mentors: {
    eyebrow: "LEARN AND GROW",
    columns: [
      {
        title: "GUIDANCE",
        items: [
          ["Mentor Feedback", "Learn from constructive feedback."],
          ["Project Reviews", "Improve your work through review."]
        ]
      },
      {
        title: "DEVELOPMENT",
        items: [
          ["Skill Development", "Identify areas to improve."],
          ["Learning Journey", "Keep building your experience."]
        ]
      },
      {
        title: "MENTORING",
        items: [
          ["Mentor Community", "Explore mentorship opportunities."],
          ["Getting Started", "Learn about MOSAIQ mentoring."]
        ]
      }
    ]
  },
  Resources: {
    eyebrow: "YOUR MOSAIQ GUIDE",
    columns: [
      {
        title: "GET STARTED",
        items: [
          ["Platform Guide", "Understand the main features."],
          ["Student Guide", "Make the most of your profile."]
        ]
      },
      {
        title: "COLLABORATION",
        items: [
          ["Project Guide", "Learn how to approach projects."],
          ["Community Tips", "Make collaboration more effective."]
        ]
      },
      {
        title: "HELP",
        items: [
          ["Frequently Asked Questions", "Find answers to common questions."],
          ["Support", "Get help using the platform."]
        ]
      }
    ]
  }
};

const navigationKeys = {
  Explore: "explore",
  Projects: "projects",
  Mentors: "mentors",
  Resources: "resources"
};

const categoryIconMap = {
  Explore: [
    ["students", "skills", "network"],
    ["collaborators", "interests"],
    ["profile", "join"]
  ],
  Projects: [
    ["projects", "create-project", "listings"],
    ["teammates", "collab"],
    ["my-projects", "community"]
  ],
  Mentors: [
    ["feedback", "reviews"],
    ["development", "journey"],
    ["mentor-community", "getting-started"]
  ],
  Resources: [
    ["platform-guide", "student-guide"],
    ["project-guide", "community-tips"],
    ["faq", "support"]
  ]
};

function Logo({ onLogoClick, ariaLabel }) {
  return (
    <a className="tf-brand" href="/" onClick={onLogoClick} aria-label={ariaLabel}>
      <svg className="tf-logo" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 3 2 15l22 12 22-12L24 3Z" fill="#5035ff" />
        <path d="M9 20v12l15 9 15-9V20L24 29 9 20Z" fill="#3920e8" />
        <path
          d="m24 12 2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1 2-4Z"
          fill="white"
        />
      </svg>
      <span className="tf-brand-word">
        Talent<span>Forge</span>
      </span>
    </a>
  );
}

function Chevron({ isExpanded }) {
  return (
    <svg
      className={`tf-chevron ${isExpanded ? "is-expanded" : ""}`}
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
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
      <path
        d="M4 13v-2a8 8 0 0 1 16 0v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="3" y="12" width="4" height="7" rx="1.5"
        stroke="currentColor" strokeWidth="1.8" />
      <rect x="17" y="12" width="4" height="7" rx="1.5"
        stroke="currentColor" strokeWidth="1.8" />
      <path d="M17 20h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ItemIcon({ category, colIndex, itemIndex }) {
  const iconKey = categoryIconMap[category]?.[colIndex]?.[itemIndex];
  switch (iconKey) {
    case "students":
    case "teammates":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "skills":
    case "collab":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "network":
    case "community":
    case "mentor-community":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "collaborators":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M23 11h-6m3-3v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "interests":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M15 8h2m-2 4h2M7 16h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "join":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="currentColor" strokeWidth="1.8" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="15" cy="9" r="1.5" fill="currentColor" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "create-project":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "listings":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "my-projects":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "feedback":
    case "reviews":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" />
          <path d="m9 10 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "development":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="16 7 22 7 22 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "journey":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="8" y1="2" x2="8" y2="18" stroke="currentColor" strokeWidth="1.8" />
          <line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "getting-started":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    case "platform-guide":
    case "student-guide":
    case "project-guide":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "community-tips":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M9 18h6m-4 4h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "faq":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m0 3.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" stroke="currentColor" strokeWidth="1.8" />
          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.8" />
          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="1.8" />
          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M5 5h14v14H5zM9 9h6M9 12h6M9 15h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function MegaMenu({ menu, content, footerData, onNavigate, onItemClick, onMouseEnter, onMouseLeave, navigationLabel }) {
  const isOpen = Boolean(menu);

  return (
    <div
      className={`tf-mega-panel ${isOpen ? "is-open" : ""}`}
      id="tf-mega-panel"
      role="region"
      aria-label={navigationLabel}
      aria-hidden={!isOpen}
      inert={!isOpen}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="tf-mega-card">
        {content && (
          <>
            <div className="tf-mega-header">
              <span className="tf-mega-eyebrow">{content.eyebrow}</span>
            </div>

            <div className="tf-mega-grid">
              {content.columns.map((column, colIdx) => (
                <section className="tf-mega-column" key={column.title || colIdx}>
                  <h3 className="tf-column-heading">{column.title}</h3>
                  <div className="tf-column-items">
                    {column.items.map(([title, description], itemIdx) => {
                      const targetHref = menu === "Projects"
                        ? "/#projects"
                        : menu === "Resources" && colIdx === 2 && itemIdx === 0
                          ? "/#faq"
                          : "/#matching";
                      return (
                        <a
                          className="tf-mega-link"
                          href={targetHref}
                          key={title}
                          onClick={(e) => {
                            if (onItemClick) {
                              onItemClick(e, menu, colIdx, itemIdx);
                            } else {
                              onNavigate();
                            }
                          }}
                        >
                          <span className="tf-mega-icon" aria-hidden="true">
                            <ItemIcon category={menu} colIndex={colIdx} itemIndex={itemIdx} />
                          </span>
                          <span className="tf-mega-copy">
                            <strong>{title}</strong>
                            <span>{description}</span>
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="tf-mega-footer">
              <span className="tf-footer-tagline">
                {footerData?.tagline || "MOSAIQ · Find your people. Build together."}
              </span>
              <a className="tf-footer-link" href="/#faq" onClick={onNavigate}>
                <span>{footerData?.help || "Need help?"}</span>
                <ArrowRight />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Header() {
  const { t } = useTranslation("common");

  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState(null);

  const closeTimerRef = useRef(null);
  const headerRef = useRef(null);

  // Read localized mega-menu content from active language translations
  const localizedMegaMenu = t("megaMenu", { returnObjects: true });
  const megaMenuData = (localizedMegaMenu && typeof localizedMegaMenu === "object")
    ? localizedMegaMenu
    : defaultMenuContent;

  const activeMenuContent = activeMenu
    ? megaMenuData[activeMenu] || defaultMenuContent[activeMenu]
    : null;

  const footerData = megaMenuData?.footer;

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeMenus = useCallback(() => {
    clearCloseTimer();
    setActiveMenu(null);
    setMobileOpen(false);
    setMobileCategory(null);
  }, [clearCloseTimer]);

  const navigate = useNavigate();

  const handleLogoClick = useCallback((e) => {
    e.preventDefault();
    closeMenus();
    navigate("/");
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
  }, [closeMenus, navigate]);

  const handleItemNavigation = useCallback((e, category, colIndex, itemIndex) => {
    e.preventDefault();
    closeMenus();

    if (category === "Projects") {
      navigate("/#projects");
    } else if (category === "Explore") {
      navigate("/#matching");
    } else if (category === "Resources" && colIndex === 2 && itemIndex === 0) {
      navigate("/#faq");
    } else {
      navigate("/projects");
    }
  }, [closeMenus, navigate]);

  const navigateToSection = useCallback((sectionId) => {
    closeMenus();
    navigate(`/#${sectionId}`);
  }, [closeMenus, navigate]);

  // Outside click closes open desktop menu or mobile drawer
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeMenus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [closeMenus]);

  const handleMouseEnterTrigger = useCallback((name) => {
    if (window.matchMedia("(hover: hover) and (min-width: 961px)").matches) {
      clearCloseTimer();
      setActiveMenu(name);
    }
  }, [clearCloseTimer]);

  const handleMouseLeaveTriggerOrPanel = useCallback(() => {
    if (window.matchMedia("(hover: hover) and (min-width: 961px)").matches) {
      clearCloseTimer();
      closeTimerRef.current = setTimeout(() => {
        setActiveMenu(null);
      }, 140);
    }
  }, [clearCloseTimer]);

  function handleTriggerClick(name) {
    clearCloseTimer();
    setActiveMenu((current) => (current === name ? null : name));
  }

  function handleMobileCategoryToggle(name) {
    setMobileCategory((current) => (current === name ? null : name));
  }

  function handleHeaderKeyDown(event) {
    if (event.key === "Escape") {
      closeMenus();
    }
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  return (
    <header
      className="tf-header"
      ref={headerRef}
      onKeyDown={handleHeaderKeyDown}
    >
      <div className="tf-header-inner">
        <div
          onMouseEnter={() => {
            clearCloseTimer();
            setActiveMenu(null);
          }}
        >
          <Logo onLogoClick={handleLogoClick} ariaLabel={t("navigation.home")} />
        </div>

        <button
          className={`tf-mobile-toggle ${mobileOpen ? "is-open" : ""}`}
          type="button"
          aria-label={t(mobileOpen ? "navigation.closeNavigation" : "navigation.openNavigation")}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Desktop & Mobile Navigation Container */}
        <nav
          className={`tf-navigation ${mobileOpen ? "is-open" : ""}`}
          aria-label={t("navigation.label", "Main navigation")}
        >
          <div className="tf-nav-main">
            {Object.keys(defaultMenuContent).map((name) => {
              const isOpen = activeMenu === name;
              const isMobileExpanded = mobileCategory === name;
              const categoryColumns = megaMenuData[name]?.columns || defaultMenuContent[name].columns;

              return (
                <div className="tf-nav-item" key={name}>
                  <button
                    type="button"
                    className={`tf-nav-link ${isOpen ? "is-active" : ""}`}
                    aria-expanded={isOpen}
                    aria-controls="tf-mega-panel"
                    aria-label={t(isOpen ? "navigation.closeMenu" : "navigation.openMenu", {
                      name: t(`navigation.${navigationKeys[name]}`, name),
                    })}
                    onMouseEnter={() => handleMouseEnterTrigger(name)}
                    onMouseLeave={handleMouseLeaveTriggerOrPanel}
                    onFocus={() => handleMouseEnterTrigger(name)}
                    onClick={() => {
                      if (window.innerWidth <= 960) {
                        handleMobileCategoryToggle(name);
                      } else if (name === "Explore") {
                        navigateToSection("matching");
                      } else if (name === "Projects") {
                        navigateToSection("projects");
                      } else {
                        handleTriggerClick(name);
                      }
                    }}
                  >
                    <span>{t(`navigation.${navigationKeys[name]}`, name)}</span>
                    <Chevron isExpanded={window.innerWidth <= 960 ? isMobileExpanded : isOpen} />
                  </button>

                  {/* Mobile accordion submenu rendered directly beneath item */}
                  {mobileOpen && (
                    <div className={`tf-mobile-accordion ${isMobileExpanded ? "is-expanded" : ""}`}>
                      <div className="tf-mobile-accordion-inner">
                        {categoryColumns.map((col, colIdx) => (
                          <div className="tf-mobile-col" key={col.title || colIdx}>
                            <h4 className="tf-mobile-col-title">{col.title}</h4>
                            <div className="tf-mobile-col-links">
                              {col.items.map(([title, description], itemIdx) => {
                                const targetHref = name === "Projects"
                                  ? "/#projects"
                                  : name === "Resources" && colIdx === 2 && itemIdx === 0
                                    ? "/#faq"
                                    : "/#matching";
                                return (
                                  <a
                                    key={title}
                                    href={targetHref}
                                    className="tf-mobile-link"
                                    onClick={(e) => handleItemNavigation(e, name, colIdx, itemIdx)}
                                  >
                                    <span className="tf-mobile-link-icon" aria-hidden="true">
                                      <ItemIcon category={name} colIndex={colIdx} itemIndex={itemIdx} />
                                    </span>
                                    <span className="tf-mobile-link-text">
                                      <strong>{title}</strong>
                                      <span>{description}</span>
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="tf-nav-item">
              <a
                className="tf-nav-link tf-pricing-link"
                href="#pricing"
                onMouseEnter={() => {
                  clearCloseTimer();
                  setActiveMenu(null);
                }}
                onClick={closeMenus}
              >
                <span>{t("navigation.pricing", "Pricing")}</span>
              </a>
            </div>
          </div>

          <div
            className="tf-nav-actions"
            onMouseEnter={() => {
              clearCloseTimer();
              setActiveMenu(null);
            }}
          >
            <a
              className="tf-support-link"
              href="/#faq"
              onClick={closeMenus}
            >
              <HeadsetIcon />
              <span>{t("navigation.support", "Support")}</span>
            </a>

            <div className="tf-language-container">
              <LanguageSelector />
            </div>

            <div className="tf-auth-actions">
              <a
                className="tf-login-btn"
                href="/roles"
                onClick={closeMenus}
              >
                {t("navigation.login", "Log in")}
              </a>

              <a
                className="tf-get-started-btn"
                href="/roles"
                onClick={closeMenus}
              >
                <span>{t("navigation.getStarted", "Get Started")}</span>
                <ArrowRight />
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Desktop Floating Mega-Menu */}
      <MegaMenu
        menu={activeMenu}
        content={activeMenuContent}
        footerData={footerData}
        onNavigate={closeMenus}
        onItemClick={handleItemNavigation}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={handleMouseLeaveTriggerOrPanel}
        navigationLabel={t("navigation.label")}
      />
    </header>
  );
}
