import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getProjectBySlugOrId,
  getNextProject,
  getProjectLead,
  getProjectContributors
} from "../data/projects";
import ProjectGraphic from "../components/ProjectGraphic";
import StudentModal from "../components/StudentModal";
import RevealOnScroll from "../components/RevealOnScroll";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./ProjectCaseStudy.css";

function EditorialChapter({ chapter, index, project, caseStudy, t }) {
  const elementRef = useScrollReveal();
  const chapterNumber =
    chapter.number || String(index + 1).padStart(2, "0");

  return (
    <article className="tf-casestudy-chapter" ref={elementRef}>
      <div className="tf-chapter-number-column">
        <span className="tf-chapter-number tf-chapter-reveal-item tf-chapter-reveal-number">
          {chapterNumber}
        </span>
        <span className="tf-chapter-tag tf-chapter-reveal-item tf-chapter-reveal-label">
          {t("caseStudy.chapter")}
        </span>
      </div>
      <div className="tf-chapter-content">
        <h2 className="tf-chapter-title tf-chapter-reveal-item tf-chapter-reveal-heading">
          {chapter.title}
        </h2>
        {chapter.subtitle && (
          <h3 className="tf-chapter-subtitle tf-chapter-reveal-item tf-chapter-reveal-subtitle">
            {chapter.subtitle}
          </h3>
        )}
        {index === 0 && (
          <div className="tf-chapter-context tf-chapter-reveal-item tf-chapter-reveal-body">
            <p className="tf-chapter-text">{project.problemSolved}</p>
            <p className="tf-chapter-text">
              {caseStudy.challenge || project.description}
            </p>
          </div>
        )}
        {chapter.content && (
          <p className="tf-chapter-text tf-chapter-reveal-item tf-chapter-reveal-body">
            {chapter.content}
          </p>
        )}
        {chapter.takeaway && (
          <div className="tf-chapter-callout tf-chapter-reveal-item tf-chapter-reveal-takeaway">
            <span className="tf-callout-quote-mark" aria-hidden="true">“</span>
            <p className="tf-callout-quote">{chapter.takeaway}</p>
            <span className="tf-callout-author">{t("caseStudy.keyTakeaway")}</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function ProjectCaseStudy() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("site");
  const [activeStudent, setActiveStudent] = useState(null);
  const [hasRequested, setHasRequested] = useState(false);

  const project = getProjectBySlugOrId(projectId);

  if (!project) {
    return (
      <div className="tf-casestudy-not-found">
        <div className="tf-browse-container">
          <h2>{t("caseStudy.notFound")}</h2>
          <p>{t("caseStudy.notFoundDescription", { id: projectId })}</p>
          <Link to="/projects" className="tf-editorial-primary-btn">
            ← {t("caseStudy.returnDirectory")}
          </Link>
        </div>
      </div>
    );
  }

  const nextProject = getNextProject(project.id);
  const leadStudent = getProjectLead(project.leadId);
  const contributors = getProjectContributors(project.contributorIds);
  const caseStudy = project.caseStudy || {};
  const chapters = Array.isArray(caseStudy.chapters) ? caseStudy.chapters : [];

  return (
    <article className="tf-casestudy-page">
      {/* ===================================================================
          1. EDITORIAL HEADER & METADATA BAR
          =================================================================== */}
      <header className="tf-casestudy-header">
        <div className="tf-casestudy-container">
          {/* Top Breadcrumb row */}
          <div className="tf-casestudy-breadcrumb-row">
            <Link to="/projects" className="tf-casestudy-back-link">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 12H5m7 7-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{t("caseStudy.backDirectory")}</span>
            </Link>

            <div className="tf-casestudy-header-badges">
              <span className="tf-casestudy-cat-badge">
                {t(`matching.categoryLabels.${project.category}`)}
              </span>
              <span className="tf-casestudy-stage-badge">{project.stage}</span>
              {project.status === "Looking for Collaborators" && (
                <span className="tf-casestudy-recruiting-badge">{t("caseStudy.recruiting")}</span>
              )}
            </div>
          </div>

          {/* Main Title & Tagline */}
          <RevealOnScroll className="tf-casestudy-heading-group">
            <h1 className="tf-casestudy-title">{project.title}</h1>
            <p className="tf-casestudy-tagline">{project.tagline}</p>
          </RevealOnScroll>

          {/* Obsidian-Style Metadata Grid */}
          <RevealOnScroll className="tf-casestudy-meta-grid">
            <div className="tf-meta-col">
              <span className="tf-meta-label">{t("caseStudy.leadBuilder")}</span>
              {leadStudent && (
                <div
                  className="tf-meta-lead-card"
                  onClick={() => setActiveStudent(leadStudent)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveStudent(leadStudent);
                    }
                  }}
                  title={t("caseStudy.clickProfile")}
                >
                  <img
                    src={leadStudent.avatar}
                    alt={leadStudent.name}
                    className="tf-meta-lead-avatar"
                  />
                  <div>
                    <strong className="tf-meta-lead-name">{leadStudent.name}</strong>
                    <span className="tf-meta-lead-sub">{leadStudent.college}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="tf-meta-col">
              <span className="tf-meta-label">{t("caseStudy.contributors")}</span>
              <div className="tf-meta-contributors-list">
                {contributors.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    className="tf-meta-contributor-pill"
                    onClick={() => setActiveStudent(student)}
                    title={t("caseStudy.viewProfile", { name: student.name })}
                  >
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="tf-mini-avatar"
                    />
                    <span>{student.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tf-meta-col">
              <span className="tf-meta-label">{t("caseStudy.timelineContext")}</span>
              <strong className="tf-meta-value">{caseStudy.timeline || t("caseStudy.activeAcademic")}</strong>
              <span className="tf-meta-sub">{caseStudy.clientContext || t("caseStudy.campusBuild")}</span>
            </div>

            <div className="tf-meta-col tf-meta-action-col">
              <span className="tf-meta-label">{t("caseStudy.projectStatus")}</span>
              <button
                type="button"
                className={`tf-casestudy-cta-btn ${hasRequested ? "is-requested" : ""}`}
                onClick={() => setHasRequested(true)}
              >
                {hasRequested ? (
                  <>
                    <span>{t("caseStudy.requestSent")} ✓</span>
                  </>
                ) : (
                  <>
                    <span>{t("caseStudy.requestJoin")}</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </RevealOnScroll>
        </div>
      </header>

      {/* ===================================================================
          2. EXPANSIVE VISUAL COVER CANVAS (OBSIDIAN INSPIRATION)
          =================================================================== */}
      <section className="tf-casestudy-cover-section">
        <div className="tf-casestudy-container">
          <RevealOnScroll className="tf-casestudy-cover-frame">
            <ProjectGraphic project={project} variant="hero" />
          </RevealOnScroll>
        </div>
      </section>

      {/* ===================================================================
          3. EXECUTIVE SUMMARY & METRIC STATS
          =================================================================== */}
      <section className="tf-casestudy-executive-section">
        <div className="tf-casestudy-container">
          <RevealOnScroll className="tf-casestudy-exec-card">
            <span className="tf-casestudy-section-kicker">{t("caseStudy.executiveOverview")}</span>
            <p className="tf-casestudy-exec-lead">
              {caseStudy.executiveSummary || project.description}
            </p>

            {caseStudy.metrics && caseStudy.metrics.length > 0 && (
              <div className="tf-casestudy-metrics-strip">
                {caseStudy.metrics.map((metric, idx) => (
                  <div key={idx} className="tf-casestudy-metric-box">
                    <span className="tf-metric-value">{metric.value}</span>
                    <span className="tf-metric-label">{metric.label}</span>
                  </div>
                ))}
              </div>
            )}
          </RevealOnScroll>
        </div>
      </section>

      {/* ===================================================================
          4. PROJECT-SPECIFIC NUMBERED EDITORIAL CHAPTERS
          =================================================================== */}
      {chapters.length > 0 && (
        <section className="tf-casestudy-chapters-section" aria-label={t("caseStudy.chapters")}>
          <div className="tf-casestudy-container">
            {chapters.map((chapter, index) => {
              const chapterNumber =
                chapter.number || String(index + 1).padStart(2, "0");

              return (
                <div key={`${chapterNumber}-${chapter.title}`}>
                  <EditorialChapter
                    chapter={chapter}
                    index={index}
                    project={project}
                    caseStudy={caseStudy}
                    t={t}
                  />
                  {index < chapters.length - 1 && (
                    <div className="tf-chapter-divider" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="tf-casestudy-detail-sections" aria-label={t("caseStudy.details")}>
        <div className="tf-casestudy-container">
          <RevealOnScroll className="tf-detail-section-header">
            <span className="tf-casestudy-section-kicker">{t("caseStudy.systemBlueprint")}</span>
            <h2 className="tf-detail-section-title">{t("caseStudy.architectureStack")}</h2>
            {caseStudy.solution && (
              <p className="tf-chapter-text">{caseStudy.solution}</p>
            )}
          </RevealOnScroll>

          {caseStudy.architecture?.length > 0 && (
            <div className="tf-architecture-layers">
              {caseStudy.architecture.map((layer, idx) => (
                <RevealOnScroll
                  as="article"
                  key={`${layer.layer}-${idx}`}
                  className="tf-arch-layer-card"
                  style={{ "--reveal-delay": `${idx * 90}ms` }}
                >
                  <div className="tf-arch-header">
                    <span className="tf-arch-name">{layer.layer}</span>
                    <span className="tf-arch-tech">{layer.tech}</span>
                  </div>
                  <p className="tf-arch-detail">{layer.detail}</p>
                </RevealOnScroll>
              ))}
            </div>
          )}

          <div className="tf-casestudy-stack-box">
            <span className="tf-stack-box-title">{t("caseStudy.completeStack")}</span>
            <div className="tf-casestudy-stack-list">
              {project.stack.map((tech, idx) => (
                <RevealOnScroll
                  as="span"
                  key={tech}
                  className="tf-casestudy-tech-pill"
                  style={{ "--reveal-delay": `${idx * 45}ms` }}
                >
                  {tech}
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="tf-casestudy-detail-section">
            <RevealOnScroll className="tf-detail-section-header">
              <span className="tf-casestudy-section-kicker">{t("caseStudy.engineering")}</span>
              <h2 className="tf-detail-section-title">{t("caseStudy.engineeringHighlights")}</h2>
              <p className="tf-chapter-text">{t("caseStudy.technicalDecisions")}</p>
            </RevealOnScroll>
            <div className="tf-highlights-grid">
              {project.highlights.map((highlight, idx) => (
                <RevealOnScroll
                  as="article"
                  key={`${highlight}-${idx}`}
                  className="tf-highlight-card"
                  style={{ "--reveal-delay": `${idx * 100}ms` }}
                >
                  <span className="tf-highlight-idx">{String(idx + 1).padStart(2, "0")}</span>
                  <h3 className="tf-highlight-title">{highlight}</h3>
                  <p className="tf-highlight-body">
                    {t("caseStudy.highlightNote")}
                  </p>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="tf-casestudy-detail-section">
            <RevealOnScroll className="tf-detail-section-header">
              <span className="tf-casestudy-section-kicker">{t("caseStudy.collaborate")}</span>
              <h2 className="tf-detail-section-title">{t("caseStudy.teamRoles")}</h2>
              <p className="tf-chapter-text">{project.collaborationNeeds}</p>
            </RevealOnScroll>

            {project.openRoles?.length > 0 && (
              <div className="tf-open-roles-container">
                <h3 className="tf-roles-header">{t("caseStudy.recruitingPositions")}</h3>
                <div className="tf-roles-grid">
                  {project.openRoles.map((role, idx) => (
                    <RevealOnScroll
                      as="article"
                      key={`${role.role}-${idx}`}
                      className="tf-role-item-card"
                      style={{ "--reveal-delay": `${idx * 90}ms` }}
                    >
                      <div className="tf-role-badge-row">
                        <span className="tf-role-title-text">{role.role}</span>
                        <span className="tf-role-skill-pill">{role.skill}</span>
                      </div>
                      {role.description && (
                        <p className="tf-role-desc-text">{role.description}</p>
                      )}
                      <button
                        type="button"
                        className="tf-role-apply-btn"
                        onClick={() => setHasRequested(true)}
                      >
                        {t("caseStudy.applyRole")} →
                      </button>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            )}

            <div className="tf-team-members-box">
              <h3 className="tf-roles-header">{t("caseStudy.currentContributors")}</h3>
              <div className="tf-team-grid">
                {contributors.map((student, idx) => (
                  <RevealOnScroll
                    key={student.id}
                    className="tf-team-member-card"
                    style={{ "--reveal-delay": `${idx * 75}ms` }}
                    onClick={() => setActiveStudent(student)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveStudent(student);
                      }
                    }}
                  >
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="tf-team-avatar"
                    />
                    <div className="tf-team-member-meta">
                      <strong className="tf-team-name">{student.name}</strong>
                      <span className="tf-team-sub">{student.college}</span>
                      <span className="tf-team-major">{student.major}</span>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. NEXT PROJECT FOOTER NAVIGATION (STEFANO BG WORK INSPIRATION)
          =================================================================== */}
      <footer className="tf-casestudy-footer-nav">
        <div className="tf-casestudy-container">
          <RevealOnScroll
            as="div"
            className="tf-next-project-card"
            onClick={() => {
              navigate(`/projects/${nextProject.slug || nextProject.id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/projects/${nextProject.slug || nextProject.id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <div className="tf-next-label-group">
              <span className="tf-next-eyebrow">{t("caseStudy.nextProject")}</span>
              <h3 className="tf-next-title">{nextProject.title}</h3>
              <p className="tf-next-tagline">{nextProject.tagline}</p>
            </div>

            <div className="tf-next-arrow-btn">
              <span>{t("caseStudy.exploreCaseStudy")}</span>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </RevealOnScroll>
        </div>
      </footer>

      {/* Student Profile Modal bridge */}
      {activeStudent && (
        <StudentModal
          student={activeStudent}
          onClose={() => setActiveStudent(null)}
        />
      )}
    </article>
  );
}
