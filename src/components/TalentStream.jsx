import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { studentData } from "../data/students";
import StudentModal from "./StudentModal";
import "./TalentStream.css";
// Staggered vertical offsets (in pixels) for organic Razorpay-style stream
const STAGGER_OFFSETS = [0, 56, -14, 44, 12, 50];

// 3 duplicate sets of student data to guarantee seamless infinite loop
const REPEATED_STREAMS = [
  { copyIndex: 0, students: studentData },
  { copyIndex: 1, students: studentData },
  { copyIndex: 2, students: studentData }
];

const ALL_STREAM_KEYS = REPEATED_STREAMS.flatMap(({ copyIndex, students }) =>
  students.map((s) => `${s.id}-copy-${copyIndex}`)
);

export default function TalentStream() {
  const { t } = useTranslation("landing");
  const [hoveredCardKey, setHoveredCardKey] = useState(null);
  const [autoFlippedKey, setAutoFlippedKey] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  const streamRef = useRef(null);
  const autoFlipTimerRef = useRef(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);
    return () => motionQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // Automatic staggered timed flips (Razorpay showcase behavior)
  // When no card is hovered, gently flips a card to showcase its skills and projects
  useEffect(() => {
    if (reducedMotion || hoveredCardKey) {
      return;
    }

    let currentIndex = 0;
    function triggerNextAutoFlip() {
      const nextKey = ALL_STREAM_KEYS[currentIndex % ALL_STREAM_KEYS.length];
      currentIndex = (currentIndex + 2) % ALL_STREAM_KEYS.length;
      setAutoFlippedKey(nextKey);

      setTimeout(() => {
        setAutoFlippedKey((current) => (current === nextKey ? null : current));
      }, 3400);
    }

    autoFlipTimerRef.current = setInterval(triggerNextAutoFlip, 5500);

    return () => {
      if (autoFlipTimerRef.current) clearInterval(autoFlipTimerRef.current);
    };
  }, [reducedMotion, hoveredCardKey]);

  const availabilityLabels = {
    open: t("talentStream.status.open", "Available to Build"),
    open_to_collaborate: t("talentStream.status.open_to_collaborate", "Open to Collaborate"),
    busy: t("talentStream.status.busy", "Currently Building")
  };

  const handleCardMouseEnter = useCallback((cardKey) => {
    setHoveredCardKey(cardKey);
  }, []);

  const handleCardMouseLeave = useCallback((cardKey) => {
    setHoveredCardKey((current) => (current === cardKey ? null : current));
  }, []);

  function handleCardClick(e, cardKey, student) {
    if (e.target.closest("a")) return;

    if (e.target.closest(".tf-back-modal-btn")) {
      e.stopPropagation();
      setSelectedStudent(student);
      return;
    }

    setHoveredCardKey((current) => (current === cardKey ? null : cardKey));
  }

  function handleCardKeyDown(e, cardKey) {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target.tagName === "A" || e.target.tagName === "BUTTON") return;
      e.preventDefault();
      setHoveredCardKey((current) => (current === cardKey ? null : cardKey));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setHoveredCardKey(null);
    }
  }

  return (
    <section
      className="tf-talent-stream"
      id="builders"
      aria-labelledby="tf-stream-heading"
      ref={streamRef}
    >
      <div className="tf-stream-header">
        <p className="tf-stream-eyebrow">
          {t("talentStream.eyebrow", "THE TALENT STREAM")}
        </p>

        <h2 id="tf-stream-heading" className="tf-stream-title">
          {t("talentStream.title")}
        </h2>

        <p className="tf-stream-description">
          {t("talentStream.description", "Real students. Real skills. Real collaborations.")}
        </p>

        <div className="tf-stream-badge-row">
          <span className="tf-stream-stat-badge">
            <span className="tf-pulse-dot" aria-hidden="true" />
            {t("talentStream.tagline", "Live 3D Builder Stream")}
          </span>
        </div>
      </div>

      {/* Continuous Horizontal Stream Viewport with 3D Preservation */}
      <div
        className={`tf-stream-viewport ${reducedMotion ? "is-reduced-motion" : ""}`}
        aria-label={t("talentStream.viewportLabel")}
      >
        <div className="tf-stream-track">
          {REPEATED_STREAMS.map(({ copyIndex, students }) =>
            students.map((student, studentIndex) => {
              const cardKey = `${student.id}-copy-${copyIndex}`;
              const isFlipped = hoveredCardKey === cardKey || autoFlippedKey === cardKey;
              const slotIndex = studentIndex % STAGGER_OFFSETS.length;
              const verticalOffset = STAGGER_OFFSETS[slotIndex];
              const isHeroStudent = student.id === "stu_001" || student.id === "stu_002";

              return (
                <div
                  key={cardKey}
                  className={`tf-stream-card tf-stagger-${slotIndex} ${
                    isFlipped ? "is-flipped" : ""
                  } ${isHeroStudent ? "is-hero-card" : ""}`}
                  style={{
                    "--stagger-offset": `${verticalOffset}px`
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isFlipped}
                  aria-label={t("talentStream.cardDescription", {
                    name: student.name,
                    major: student.major,
                    college: student.college,
                    action: t(isFlipped ? "talentStream.cardFlipped" : "talentStream.cardFlipHint")
                  })}
                  onMouseEnter={() => handleCardMouseEnter(cardKey)}
                  onMouseLeave={() => handleCardMouseLeave(cardKey)}
                  onClick={(e) => handleCardClick(e, cardKey, student)}
                  onFocus={() => setHoveredCardKey(cardKey)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setHoveredCardKey(null);
                    }
                  }}
                  onKeyDown={(e) => handleCardKeyDown(e, cardKey)}
                >
                  {/* 3D Inner Flipper Wrapper (Transforms rotateY(180deg)) */}
                  <div className="tf-card-flipper">
                    {/* ---------------- FRONT FACE (0deg) ---------------- */}
                    <div className="tf-card-face tf-card-front">
                      <div className="tf-front-top">
                        <div className="tf-front-avatar-box">
                          <img
                            src={student.avatar}
                            alt=""
                            className="tf-front-avatar"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }}
                          />
                          <div
                            className="tf-front-avatar-fallback"
                            style={{ display: "none" }}
                            aria-hidden="true"
                          >
                            {student.name.charAt(0)}
                          </div>
                          <span
                            className={`tf-front-status-dot is-${student.availability}`}
                            title={availabilityLabels[student.availability]}
                            aria-hidden="true"
                          />
                        </div>

                        <span className={`tf-front-status-pill is-${student.availability}`}>
                          {availabilityLabels[student.availability]}
                        </span>
                      </div>

                      <div className="tf-front-info">
                        <h3 className="tf-front-name">{student.name}</h3>
                        <p className="tf-front-major">
                          {student.major} · {student.year}
                        </p>
                        <p className="tf-front-college">
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            aria-hidden="true"
                          >
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

                      {/* Top Skills Preview */}
                      <div className="tf-front-skills">
                        {student.skills.slice(0, 3).map((skill) => (
                          <span className="tf-skill-pill" key={skill}>
                            {skill}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="tf-skill-pill tf-skill-more">
                            +{student.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Collaboration Goal Preview */}
                      <div className="tf-front-collab-box">
                        <span className="tf-front-collab-label">
                          {t("talentStream.lookingFor", "Looking for")}:
                        </span>
                        <p className="tf-front-collab-text">{student.lookingFor}</p>
                      </div>

                      {/* 3D Flip Affordance Badge */}
                      <div className="tf-front-flip-hint">
                        <span className="tf-flip-icon" aria-hidden="true">
                          🔄
                        </span>
                        <span>{t("talentStream.flipToExplore", "Hover to flip")}</span>
                      </div>
                    </div>

                    {/* ---------------- BACK FACE (180deg) ---------------- */}
                    <div className="tf-card-face tf-card-back">
                      <div className="tf-back-header">
                        <div className="tf-back-student-row">
                          <div className="tf-back-avatar-mini">
                            <img
                              src={student.avatar}
                              alt=""
                              className="tf-back-avatar-img"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }}
                            />
                            <div
                              className="tf-back-avatar-fallback"
                              style={{ display: "none" }}
                              aria-hidden="true"
                            >
                              {student.name.charAt(0)}
                            </div>
                          </div>

                          <div className="tf-back-names">
                            <h4 className="tf-back-name">{student.name}</h4>
                            <span className="tf-back-college">{student.college}</span>
                          </div>

                          <span className="tf-back-flip-badge" title={t("talentStream.flipBack")}>
                            ↩
                          </span>
                        </div>

                        <span className={`tf-front-status-pill is-${student.availability}`}>
                          {availabilityLabels[student.availability]}
                        </span>
                      </div>

                      <div className="tf-back-content">
                        {/* Collaboration Goals */}
                        <div className="tf-back-section">
                          <span className="tf-back-section-label">
                            {t("talentStream.lookingFor", "Looking for")}
                          </span>
                          <p className="tf-back-looking-for">{student.lookingFor}</p>
                        </div>

                        {/* All Skills */}
                        <div className="tf-back-section">
                          <span className="tf-back-section-label">
                            {t("talentStream.coreSkills", "Core Skills")}
                          </span>
                          <div className="tf-back-skills-wrap">
                            {student.skills.map((skill) => (
                              <span className="tf-back-chip" key={skill}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Featured Project */}
                        {student.projects && student.projects.length > 0 && (
                          <div className="tf-back-section">
                            <span className="tf-back-section-label">
                              {t("talentStream.projects", "Projects")}
                            </span>
                            <div className="tf-back-project-card">
                              <div className="tf-back-proj-top">
                                <strong>🚀 {student.projects[0].title}</strong>
                                <span>{student.projects[0].stack}</span>
                              </div>
                              {student.projects[0].description && (
                                <p className="tf-back-proj-desc">
                                  {student.projects[0].description}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Verified Links */}
                        {(student.portfolio || student.github || student.linkedin) && (
                          <div className="tf-back-section">
                            <span className="tf-back-section-label">
                              {t("talentStream.links", "Links & Portfolio")}
                            </span>
                            <div className="tf-back-links-row">
                              {student.portfolio && (
                                <a
                                  href={student.portfolio}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="tf-back-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  🌐 {t("talentStream.portfolio")}
                                </a>
                              )}
                              {student.github && (
                                <a
                                  href={student.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="tf-back-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  💻 GitHub
                                </a>
                              )}
                              {student.linkedin && (
                                <a
                                  href={student.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="tf-back-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  💼 LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Secondary Interaction: View Full Profile Modal Trigger */}
                      <div className="tf-back-footer">
                        <button
                          type="button"
                          className="tf-back-modal-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                        >
                          <span>{t("talentStream.viewProfile", "View Full Profile")}</span>
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            aria-hidden="true"
                          >
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
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Secondary Deep-Dive Profile Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </section>
  );
}
