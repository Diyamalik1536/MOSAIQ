import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProjectGraphic from "./ProjectGraphic";
import { getProjectContributors, getProjectLead } from "../data/projects";
import "./ProjectDetailModal.css";

export default function ProjectDetailModal({ project, onClose, onSelectStudent }) {
  const navigate = useNavigate();
  const { t } = useTranslation("site");
  const modalRef = useRef(null);
  const [hasRequested, setHasRequested] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock background scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Trap focus inside modal
  useEffect(() => {
    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, []);

  if (!project) return null;

  const leadStudent = getProjectLead(project.leadId);
  const contributors = getProjectContributors(project.contributorIds);

  return (
    <div
      className="tf-proj-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="tf-proj-modal-dialog"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="proj-modal-title"
      >
        {/* Header Bar */}
        <div className="tf-proj-modal-header">
          <div className="tf-proj-modal-title-group">
            <span className="tf-proj-modal-badge-quick">{t("projectModal.quickPreview")}</span>
            <span className="tf-proj-modal-category">
              {t(`matching.categoryLabels.${project.category}`)}
            </span>
            <span className="tf-proj-modal-stage">{project.stage}</span>
            {project.status === "Looking for Collaborators" && (
              <span className="tf-proj-modal-recruiting">{t("projectModal.recruiting")}</span>
            )}
          </div>
          <button
            type="button"
            className="tf-proj-modal-close"
            onClick={onClose}
            aria-label={t("projectModal.close")}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="tf-proj-modal-body">
          {/* Main Visual */}
          <div className="tf-proj-modal-preview">
            <ProjectGraphic project={project} variant="modal" />
          </div>

          <div className="tf-proj-modal-content">
            <h2 id="proj-modal-title" className="tf-proj-modal-name">
              {project.title}
            </h2>
            <p className="tf-proj-modal-tagline">{project.tagline}</p>

            {/* Overview & Problem statement */}
            <div className="tf-proj-modal-section">
              <h3 className="tf-proj-section-heading">{t("projectModal.overview")}</h3>
              <p className="tf-proj-section-text">{project.description}</p>
            </div>

            <div className="tf-proj-modal-section">
              <h3 className="tf-proj-section-heading">{t("projectModal.problemSolved")}</h3>
              <p className="tf-proj-section-text">{project.problemSolved}</p>
            </div>

            {/* Technical Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <div className="tf-proj-modal-section">
                <h3 className="tf-proj-section-heading">{t("projectModal.technicalHighlights")}</h3>
                <ul className="tf-proj-highlights-list">
                  {project.highlights.map((highlight, idx) => (
                    <li key={idx} className="tf-proj-highlight-item">
                      <span className="tf-proj-highlight-bullet">✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Tech Stack */}
            <div className="tf-proj-modal-section">
              <h3 className="tf-proj-section-heading">{t("projectModal.technologyStack")}</h3>
              <div className="tf-proj-stack-pills">
                {project.stack.map((tech) => (
                  <span key={tech} className="tf-proj-stack-pill">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Collaboration Needs & Open Roles */}
            <div className="tf-proj-modal-section tf-proj-collab-box">
              <h3 className="tf-proj-section-heading">{t("projectModal.collaborationNeeds")}</h3>
              <p className="tf-proj-section-text">{project.collaborationNeeds}</p>
              {project.openRoles && project.openRoles.length > 0 && (
                <div className="tf-proj-roles-list">
                  {project.openRoles.map((role, idx) => (
                    <div key={idx} className="tf-proj-role-badge">
                      <span className="tf-role-title">{role.role}</span>
                      <span className="tf-role-skill">{role.skill}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contributors & Lead */}
            <div className="tf-proj-modal-section">
              <h3 className="tf-proj-section-heading">{t("projectModal.contributors")}</h3>
              <div className="tf-proj-contributors-grid">
                {contributors.map((student) => {
                  const isLead = student.id === project.leadId;
                  return (
                    <div key={student.id} className="tf-proj-contributor-card">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="tf-contributor-avatar"
                      />
                      <div className="tf-contributor-info">
                        <div className="tf-contributor-name-row">
                          <span className="tf-contributor-name">{student.name}</span>
                          {isLead && <span className="tf-lead-tag">{t("projectModal.lead")}</span>}
                        </div>
                        <span className="tf-contributor-college">
                          {student.college} · {student.major}
                        </span>
                        <button
                          type="button"
                          className="tf-contributor-profile-btn"
                          onClick={() => {
                            onClose();
                            if (onSelectStudent) {
                              onSelectStudent(student);
                            }
                          }}
                        >
                          {t("projectModal.viewStudent")} →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="tf-proj-modal-footer">
          <div className="tf-proj-footer-lead-hint">
            {leadStudent && (
              <span>
                {t("projectModal.ledBy", {
                  name: leadStudent.name,
                  college: leadStudent.college
                })}
              </span>
            )}
          </div>
          <div className="tf-proj-footer-actions">
            <button
              type="button"
              className="tf-proj-casestudy-link-btn"
              onClick={() => {
                onClose();
                navigate(`/projects/${project.slug || project.id}`);
              }}
            >
              <span>{t("projectModal.readCaseStudy")}</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`tf-proj-collaborate-btn ${hasRequested ? "is-requested" : ""}`}
              onClick={() => setHasRequested(true)}
            >
              {hasRequested ? (
                <>
                  <span className="tf-btn-check">✓</span>
                  <span>{t("projectModal.requestSent")}</span>
                </>
              ) : (
                <>
                  <span>{t("projectModal.requestJoin")}</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
