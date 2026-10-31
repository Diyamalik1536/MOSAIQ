import {
  useState,
  useMemo,
  useEffect,
  useRef,
  lazy,
  Suspense
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  projectsData,
  PROJECT_CATEGORIES,
  POPULAR_TECH_TAGS,
  getProjectLead,
  getProjectContributors
} from "../data/projects";
import { studentData } from "../data/students";
import ProjectGraphic from "../components/ProjectGraphic";
import ProjectDetailModal from "../components/ProjectDetailModal";
import StudentModal from "../components/StudentModal";
import RevealOnScroll from "../components/RevealOnScroll";
import "./BrowseProjects.css";

const ProjectConstellation = lazy(
  () => import("../components/ProjectConstellation")
);

function ConstellationLoadingFallback() {
  return (
    <div className="tf-constellation-canvas" aria-hidden="true">
      <svg
        className="tf-constellation-fallback"
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M80 260C300 80 520 80 720 260S1140 440 1360 260" />
        <path d="M130 350C360 500 530 20 760 175S1110 430 1310 120" />
        <path d="M160 100C450 390 950 390 1280 120" />
      </svg>
    </div>
  );
}

export default function BrowseProjects() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("site");
  const numberLocale = i18n.resolvedLanguage === "en"
    ? "en-IN"
    : `${i18n.resolvedLanguage || "en"}-IN`;
  const formatNumber = (value) => new Intl.NumberFormat(numberLocale).format(value);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTech, setSelectedTech] = useState("All Tech");
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);

  // Quick Modal inspection state
  const [activeProject, setActiveProject] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [sceneMode, setSceneMode] = useState({
    compact: false,
    narrow: false,
    reducedMotion: false,
    finePointer: false
  });
  const pointerRef = useRef({ x: 0, y: 0 });
  const activeProjectRef = useRef(-1);
  const invalidateRef = useRef(null);

  // Filtered projects computation
  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      // 1. Category filter
      if (selectedCategory !== "All" && project.category !== selectedCategory) {
        return false;
      }

      // 2. Tech tag filter
      if (selectedTech !== "All Tech") {
        const hasTech = project.stack.some(
          (t) => t.toLowerCase() === selectedTech.toLowerCase()
        );
        if (!hasTech) return false;
      }

      // 3. Recruiting filter
      if (onlyRecruiting && project.status !== "Looking for Collaborators") {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesTagline = project.tagline.toLowerCase().includes(query);
        const matchesDesc = project.description.toLowerCase().includes(query);
        const matchesCategory = project.category.toLowerCase().includes(query);
        const matchesStack = project.stack.some((tech) =>
          tech.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesTagline && !matchesDesc && !matchesCategory && !matchesStack) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedTech, onlyRecruiting]);

  const previewProjects = useMemo(() => {
    const featured = filteredProjects.find((project) => project.featured);
    const supportingProjects = featured
      ? filteredProjects.filter((project) => project !== featured)
      : filteredProjects;
    const orderedProjects = featured
      ? [
          supportingProjects[0],
          featured,
          ...supportingProjects.slice(1)
        ].filter(Boolean)
      : filteredProjects;
    return orderedProjects.slice(0, 3);
  }, [filteredProjects]);

  const constellationStudents = useMemo(() => {
    const contributorIds = [
      ...new Set(
        previewProjects.flatMap((project) => project.contributorIds || [])
      )
    ];
    return contributorIds
      .map((studentId) => studentData.find((student) => student.id === studentId))
      .filter(Boolean)
      .slice(0, 4);
  }, [previewProjects]);

  const openRoleCount = projectsData.reduce(
    (total, project) => total + (project.openRoles?.length || 0),
    0
  );

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const updateSceneMode = () => {
      setSceneMode({
        compact: window.innerWidth <= 760,
        narrow: window.innerWidth <= 560,
        reducedMotion: reducedMotionQuery.matches,
        finePointer: finePointerQuery.matches
      });
    };

    updateSceneMode();
    window.addEventListener("resize", updateSceneMode);
    reducedMotionQuery.addEventListener("change", updateSceneMode);
    finePointerQuery.addEventListener("change", updateSceneMode);

    return () => {
      window.removeEventListener("resize", updateSceneMode);
      reducedMotionQuery.removeEventListener("change", updateSceneMode);
      finePointerQuery.removeEventListener("change", updateSceneMode);
    };
  }, []);

  // Check if any filter is active
  const isFiltered =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "All" ||
    selectedTech !== "All Tech" ||
    onlyRecruiting;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedTech("All Tech");
    setOnlyRecruiting(false);
  };

  const scrollToGallery = () => {
    document.getElementById("project-gallery")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const navigateToMatching = () => {
    navigate("/#matching");
  };

  const navigateToCaseStudy = (project) => {
    navigate(`/projects/${project.slug || project.id}`);
  };

  const handleScenePointerMove = (event) => {
    if (
      !sceneMode.finePointer ||
      sceneMode.compact ||
      sceneMode.reducedMotion
    ) {
      return;
    }

    pointerRef.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: (event.clientY / window.innerHeight) * 2 - 1
    };
    invalidateRef.current?.();
  };

  const resetScenePointer = () => {
    pointerRef.current = { x: 0, y: 0 };
    invalidateRef.current?.();
  };

  const focusConstellationProject = (index) => {
    activeProjectRef.current = index;
    invalidateRef.current?.();
  };

  const clearConstellationProject = () => {
    activeProjectRef.current = -1;
    invalidateRef.current?.();
  };

  const handleProjectCardPointerMove = (event) => {
    if (
      event.pointerType !== "mouse" ||
      !sceneMode.finePointer ||
      sceneMode.compact ||
      sceneMode.reducedMotion
    ) {
      return;
    }

    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const tiltX = Math.max(-5, Math.min(5, (0.5 - y) * 10));
    const tiltY = Math.max(-7, Math.min(7, (x - 0.5) * 14));

    card.style.setProperty("--card-tilt-x", `${tiltX}deg`);
    card.style.setProperty("--card-tilt-y", `${tiltY}deg`);
    card.style.setProperty("--pointer-light-x", `${x * 100}%`);
    card.style.setProperty("--pointer-light-y", `${y * 100}%`);
  };

  const resetProjectCardPointer = (event) => {
    event.currentTarget.style.setProperty("--card-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--card-tilt-y", "0deg");
    event.currentTarget.style.setProperty("--pointer-light-x", "50%");
    event.currentTarget.style.setProperty("--pointer-light-y", "20%");
    if (!event.currentTarget.contains(document.activeElement)) {
      clearConstellationProject();
    }
  };

  return (
    <div className="tf-browse-page">
      {/* ===================================================================
          1. EDITORIAL PAGE OPENING (NOT GENERIC HERO)
          =================================================================== */}
      <section
        className="tf-editorial-intro"
        aria-label={t("projects.pageIntroduction")}
        onPointerMove={handleScenePointerMove}
        onPointerLeave={resetScenePointer}
      >
        <Suspense fallback={<ConstellationLoadingFallback />}>
          <ProjectConstellation
            compact={sceneMode.compact}
            narrow={sceneMode.narrow}
            reducedMotion={sceneMode.reducedMotion}
            pointerRef={pointerRef}
            activeProjectRef={activeProjectRef}
            invalidateRef={invalidateRef}
          />
        </Suspense>
        <div className="tf-editorial-inner">
          <div className="tf-editorial-badge">
            <span className="tf-badge-dot" aria-hidden="true" />
            <span>{t("projects.directoryEyebrow")}</span>
          </div>

          <h1 className="tf-editorial-title">
            <span className="tf-editorial-title-line">
              {t("projects.titleLineOne")}
            </span>
            <span className="tf-editorial-title-line tf-editorial-gradient">
              {t("projects.titleLineTwo")}
            </span>
          </h1>

          <p className="tf-editorial-lead">
            {t("projects.description")}
          </p>

          <div className="tf-editorial-actions">
            <button
              type="button"
              className="tf-editorial-primary-btn"
              onClick={scrollToGallery}
            >
              <span>{t("projects.explore")}</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M12 5v14m7-7-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              className="tf-editorial-secondary-btn"
              onClick={navigateToMatching}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t("projects.findCollaborators")}</span>
            </button>
          </div>

          <div className="tf-discovery-toolbar tf-hero-discovery-controls">
            <div className="tf-search-wrapper">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="tf-search-icon"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path
                  d="m21 21-4.35-4.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="search"
                className="tf-search-input"
                placeholder={t("projects.searchPlaceholder")}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label={t("projects.searchLabel")}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="tf-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label={t("projects.clearSearch")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="tf-category-strip-wrapper">
              <div
                className="tf-category-pills"
                role="radiogroup"
                aria-label={t("projects.categories")}
              >
                {PROJECT_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`tf-category-pill ${selectedCategory === category ? "is-active" : ""}`}
                    onClick={() => setSelectedCategory(category)}
                    role="radio"
                    aria-checked={selectedCategory === category}
                  >
                    <span>{t(`matching.categoryLabels.${category}`)}</span>
                    {selectedCategory === category && (
                      <span
                        className="tf-category-active-dot"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="tf-secondary-filters">
              <div className="tf-tech-scroll" aria-label={t("projects.technologies")}>
                {POPULAR_TECH_TAGS.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    className={`tf-tech-chip ${selectedTech === tech ? "is-active" : ""}`}
                    onClick={() => setSelectedTech(tech)}
                  >
                    {tech === "All Tech" ? t("matching.allTechnologies") : tech}
                  </button>
                ))}
              </div>

              <label className="tf-recruiting-toggle">
                <input
                  type="checkbox"
                  checked={onlyRecruiting}
                  onChange={(event) => setOnlyRecruiting(event.target.checked)}
                />
                <span className="tf-toggle-label">{t("projects.recruitingOnly")}</span>
              </label>
            </div>
          </div>

          <div className="tf-editorial-stats">
            <div className="tf-stat-item">
              <span className="tf-stat-value">{formatNumber(projectsData.length)}</span>
              <span className="tf-stat-label">{t("projects.studentProjects")}</span>
            </div>
            <div className="tf-stat-divider" aria-hidden="true" />
            <div className="tf-stat-item">
              <span className="tf-stat-value">{formatNumber(studentData.length)}</span>
              <span className="tf-stat-label">{t("projects.campusBuilders")}</span>
            </div>
            <div className="tf-stat-divider" aria-hidden="true" />
            <div className="tf-stat-item">
              <span className="tf-stat-value">{formatNumber(openRoleCount)}</span>
              <span className="tf-stat-label">{t("projects.openRoles")}</span>
            </div>
            <div className="tf-stat-divider" aria-hidden="true" />
            <div className="tf-stat-item">
              <span className="tf-stat-value">
                {formatNumber(PROJECT_CATEGORIES.filter((category) => category !== "All").length)}
              </span>
              <span className="tf-stat-label">{t("projects.categoryCount")}</span>
            </div>
          </div>
        </div>

        <div className="tf-browse-container tf-project-constellation-stage">
          <div className="tf-constellation-avatar-nodes" aria-hidden="true">
            {constellationStudents.map((student, index) => (
              <img
                key={student.id}
                className={`tf-constellation-avatar-node tf-constellation-avatar-node--${index + 1}`}
                src={student.avatar}
                alt=""
              />
            ))}
          </div>
          <div className="tf-constellation-labels" aria-hidden="true">
            <span>{t("projects.connectedIdeas")}</span>
            <span>{t("projects.studentBuiltProjects")}</span>
          </div>
          <div className="tf-constellation-projects">
            {previewProjects.map((project, index) => {
              const contributors = getProjectContributors(
                project.contributorIds
              ).slice(0, 3);
              const isPrimary =
                project.featured || previewProjects.length === 1;

              return (
                <article
                  key={project.id}
                  className={`tf-constellation-project ${isPrimary ? "is-primary" : ""}`}
                  style={{ "--card-index": index }}
                  onPointerEnter={() => focusConstellationProject(index)}
                  onPointerMove={handleProjectCardPointerMove}
                  onPointerLeave={resetProjectCardPointer}
                  onFocus={() => focusConstellationProject(index)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      clearConstellationProject();
                    }
                  }}
                >
                  <Link
                    to={`/projects/${project.slug || project.id}`}
                    className="tf-constellation-card-main"
                    aria-label={t("projects.openCaseStudy", { title: project.title })}
                  >
                    <div className="tf-constellation-artwork">
                      <ProjectGraphic project={project} variant="card" />
                      <span className="tf-constellation-status">
                        {project.status}
                      </span>
                    </div>
                    <div className="tf-constellation-card-content">
                      <h2>{project.title}</h2>
                      <p>{project.tagline}</p>
                    </div>
                  </Link>
                  <div className="tf-constellation-card-footer">
                    <div
                      className="tf-constellation-contributors"
                      aria-label={t("projects.contributors", { count: formatNumber(contributors.length) })}
                    >
                      {contributors.map((student) => (
                        <img
                          key={student.id}
                          src={student.avatar}
                          alt={student.name}
                          title={student.name}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="tf-constellation-preview"
                      onClick={() => setActiveProject(project)}
                    >
                      Quick preview
                    </button>
                    <Link
                      className="tf-constellation-link"
                      to={`/projects/${project.slug || project.id}`}
                    >
                      View project <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. EDITORIAL SHOWCASE HEADER (PART 5 TRANSITION)
          =================================================================== */}
      <section className="tf-showcase-transition-section" aria-label={t("projects.showcaseIntroduction")}>
        <div className="tf-browse-container">
          <RevealOnScroll className="tf-showcase-header-content">
            <span className="tf-showcase-kicker">{t("projects.showcaseKicker")}</span>
            <h2 className="tf-showcase-headline">{t("projects.showcaseTitle")}</h2>
            <p className="tf-showcase-subtitle">
              {t("projects.showcaseDescription")}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ===================================================================
          4. DISCOVERY & FILTER TOOLBAR (AWAKE AGENCY INTERACTION)
          =================================================================== */}
      <section
        id="project-gallery"
        className="tf-discovery-section"
        aria-label={t("projects.gallery")}
      >
        <div className="tf-browse-container">
          <div className="tf-results-status" aria-live="polite">
            <span className="tf-results-count">
              {t("projects.showing", {
                count: formatNumber(filteredProjects.length),
                item: t(filteredProjects.length === 1 ? "projects.project" : "projects.projects")
              })}
              {selectedCategory !== "All" && ` ${t("projects.inCategory", {
                category: t(`matching.categoryLabels.${selectedCategory}`)
              })}`}
              {selectedTech !== "All Tech" && ` ${t("projects.withTechnology", {
                technology: selectedTech
              })}`}
            </span>

            {isFiltered && (
              <button
                type="button"
                className="tf-reset-filters-btn"
                onClick={resetFilters}
              >
                {t("projects.resetFilters")} ✕
              </button>
            )}
          </div>

          {/* ===================================================================
              5. EDITORIAL GALLERY GRID (RHYTHMIC ASYMMETRIC LAYOUT)
              =================================================================== */}
          {filteredProjects.length === 0 ? (
            <div className="tf-empty-state">
              <div className="tf-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
                  <path d="M12 8v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="tf-empty-title">{t("projects.emptyTitle")}</h3>
              <p className="tf-empty-desc">
                {t("projects.emptyDescription")}
              </p>
              <button
                type="button"
                className="tf-empty-reset-btn"
                onClick={resetFilters}
              >
                {t("projects.resetAll")}
              </button>
            </div>
          ) : (
            <div className="tf-editorial-grid">
              {filteredProjects.map((project, index) => {
                const lead = getProjectLead(project.leadId);
                const contributors = getProjectContributors(project.contributorIds);

                return (
                  <RevealOnScroll
                    as="article"
                    key={project.id}
                    className={`tf-project-card ${project.featured && !isFiltered ? "tf-project-card--highlighted" : ""}`}
                    onClick={() => navigateToCaseStudy(project)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigateToCaseStudy(project);
                      }
                    }}
                    aria-label={t("projects.caseStudyLabel", { title: project.title })}
                    style={{ "--reveal-delay": `${index * 45}ms` }}
                  >
                    {/* Visual Preview */}
                    <div className="tf-card-visual">
                      <ProjectGraphic project={project} variant="card" />
                      <div className="tf-card-hover-overlay">
                        <span className="tf-hover-badge">
                          <span>{t("projects.exploreCaseStudy")}</span>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="tf-card-body">
                      <div className="tf-card-top-row">
                        <span className="tf-card-category-badge">
                          {t(`matching.categoryLabels.${project.category}`)}
                        </span>
                        <span className="tf-card-stage-badge">{project.stage}</span>
                      </div>

                      <h3 className="tf-card-title">{project.title}</h3>
                      <p className="tf-card-tagline">{project.tagline}</p>

                      {/* Tech stack tags */}
                      <div className="tf-card-stack">
                        {project.stack.slice(0, 4).map((tech) => (
                          <span key={tech} className="tf-stack-mini-pill">
                            {tech}
                          </span>
                        ))}
                        {project.stack.length > 4 && (
                          <span className="tf-stack-mini-pill tf-stack-more">
                            +{project.stack.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Open Role snippet */}
                      {project.status === "Looking for Collaborators" && (
                        <div className="tf-card-role-snippet">
                          <span className="tf-role-dot" />
                          <span className="tf-role-text">
                            {t("projects.seeking", {
                              role: project.openRoles?.[0]?.role || t("projects.collaborator")
                            })}
                          </span>
                        </div>
                      )}

                      {/* Card Footer: Contributor avatars, quick preview trigger & case study CTA */}
                      <div className="tf-card-footer">
                        <div className="tf-card-avatars">
                          {contributors.map((c) => (
                            <img
                              key={c.id}
                              src={c.avatar}
                              alt={c.name}
                              title={t("projects.contributorTitle", {
                                name: c.name,
                                college: c.college
                              })}
                              className="tf-card-avatar"
                            />
                          ))}
                          {lead && (
                            <span className="tf-card-lead-text">
                              {lead.name}
                            </span>
                          )}
                        </div>

                        <div className="tf-card-actions-row">
                          <button
                            type="button"
                            className="tf-card-preview-btn"
                            title={t("projects.previewTitle")}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProject(project);
                            }}
                          >
                            {t("projects.preview")}
                          </button>
                          <span className="tf-card-action-link">
                            {t("projects.caseStudy")} →
                          </span>
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================
          6. QUICK PREVIEW MODAL & STUDENT PROFILE MODAL
          =================================================================== */}
      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          onSelectStudent={(student) => setActiveStudent(student)}
        />
      )}

      {activeStudent && (
        <StudentModal
          student={activeStudent}
          onClose={() => setActiveStudent(null)}
        />
      )}
    </div>
  );
}
