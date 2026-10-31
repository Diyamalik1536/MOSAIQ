import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./StudentModal.css";

export default function StudentModal({ student, onClose }) {
  const { t } = useTranslation("landing");
  const modalRef = useRef(null);

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

  if (!student) return null;

  const availabilityLabels = {
    open: t("talentStream.status.open", "Available to Build"),
    open_to_collaborate: t("talentStream.status.open_to_collaborate", "Open to Collaborate"),
    busy: t("talentStream.status.busy", "Currently Building")
  };

  return (
    <div
      className="tf-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="tf-modal-dialog"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tf-modal-student-name"
      >
        <button
          type="button"
          className="tf-modal-close"
          onClick={onClose}
          aria-label={t("talentStream.modal.close", "Close modal")}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="tf-modal-header">
          <div className="tf-modal-avatar-wrapper">
            <img
              src={student.avatar}
              alt={student.name}
              className="tf-modal-avatar"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display = "flex";
              }}
            />
            <div className="tf-modal-avatar-fallback" style={{ display: "none" }} aria-hidden="true">
              {student.name.charAt(0)}
            </div>
            <span
              className={`tf-status-badge is-${student.availability}`}
              title={availabilityLabels[student.availability]}
            >
              <span className="tf-status-dot" />
              {availabilityLabels[student.availability]}
            </span>
          </div>

          <div className="tf-modal-meta">
            <h2 id="tf-modal-student-name" className="tf-modal-name">
              {student.name}
            </h2>
            <p className="tf-modal-major">
              {student.major} · {student.year}
            </p>
            <p className="tf-modal-college">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                <path
                  d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 12v5c0 2 2.686 3 6 3s6-1 6-3v-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{student.college}</span>
            </p>
          </div>
        </div>

        <div className="tf-modal-body">
          {/* Collaboration Goal / Looking For */}
          {student.lookingFor && (
            <div className="tf-modal-callout">
              <div className="tf-callout-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path
                    d="m8 11 4 4 8-8m-7 13a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="tf-callout-content">
                <strong>{t("talentStream.modal.collabGoal", "Looking For")}</strong>
                <p>{student.lookingFor}</p>
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="tf-modal-section">
            <h3 className="tf-modal-section-title">
              {t("talentStream.modal.skills", "Core Skills")}
            </h3>
            <div className="tf-modal-chips">
              {student.skills.map((skill) => (
                <span className="tf-skill-chip" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          {student.interests && student.interests.length > 0 && (
            <div className="tf-modal-section">
              <h3 className="tf-modal-section-title">
                {t("talentStream.modal.interests", "Interests")}
              </h3>
              <div className="tf-modal-tags">
                {student.interests.map((interest) => (
                  <span className="tf-interest-tag" key={interest}>
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {student.projects && student.projects.length > 0 && (
            <div className="tf-modal-section">
              <h3 className="tf-modal-section-title">
                {t("talentStream.modal.projects", "Projects & Stack")}
              </h3>
              <div className="tf-modal-projects">
                {student.projects.map((proj) => (
                  <div className="tf-project-item" key={proj.title}>
                    <div className="tf-project-icon" aria-hidden="true">🚀</div>
                    <div className="tf-project-copy">
                      <strong>{proj.title}</strong>
                      <span>{proj.stack}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Portfolio/Social Links */}
          {(student.portfolio || student.github || student.linkedin) && (
            <div className="tf-modal-section">
              <h3 className="tf-modal-section-title">
                {t("talentStream.modal.links", "Links & Portfolio")}
              </h3>
              <div className="tf-modal-links">
                {student.portfolio && (
                  <a
                    href={student.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tf-student-link"
                  >
                    <span>🌐 {t("talentStream.portfolio")}</span>
                  </a>
                )}
                {student.github && (
                  <a
                    href={student.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tf-student-link"
                  >
                    <span>💻 GitHub</span>
                  </a>
                )}
                {student.linkedin && (
                  <a
                    href={student.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tf-student-link"
                  >
                    <span>💼 LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="tf-modal-footer">
          <button
            type="button"
            className="tf-modal-btn-connect"
            onClick={onClose}
          >
            <span>{t("talentStream.modal.connect", "Connect on MOSAIQ")}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
