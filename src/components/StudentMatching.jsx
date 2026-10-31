import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { studentData } from "../data/students";
import StudentModal from "./StudentModal";
import "./StudentMatching.css";

// Decorative star particles in the Student Universe (Scene 1)
const UNIVERSE_PARTICLES = [
  { id: 1, top: "12%", left: "8%", size: 3, delay: "0.2s" },
  { id: 2, top: "25%", left: "92%", size: 4, delay: "0.5s" },
  { id: 3, top: "8%", left: "75%", size: 2.5, delay: "0.8s" },
  { id: 4, top: "78%", left: "6%", size: 3.5, delay: "0.3s" },
  { id: 5, top: "85%", left: "88%", size: 3, delay: "0.7s" },
  { id: 6, top: "45%", left: "4%", size: 2, delay: "1.1s" },
  { id: 7, top: "52%", left: "95%", size: 2.5, delay: "0.9s" },
  { id: 8, top: "18%", left: "48%", size: 3, delay: "0.4s" },
  { id: 9, top: "88%", left: "52%", size: 2.5, delay: "0.6s" },
  { id: 10, top: "35%", left: "14%", size: 2, delay: "1.2s" },
  { id: 11, top: "68%", left: "82%", size: 3.5, delay: "1.0s" },
  { id: 12, top: "62%", left: "28%", size: 2, delay: "0.5s" }
];

// Explainable matching relationship map (grounded in real student profiles, no fake percentages)
const MATCH_ANALYSIS_MAP = {
  stu_002: {
    synergyTitle: "Frontend Engineering ↔ UI/UX Design Systems",
    synergyType: "Complementary Strength",
    sharedSkills: ["Prototyping", "UI Design"],
    collaborationReason:
      "Aisha is seeking design-led fullstack partners; Misthi builds scalable React tooling.",
    hubLabel: "UI/UX & Design Systems",
    svgPath: "M 550 310 C 630 250, 720 220, 850 160",
    pulsePath: "M 550 310 Q 700 235 850 160"
  },
  stu_003: {
    synergyTitle: "Web Engineering ↔ Machine Learning & NLP",
    synergyType: "Complementary Technology",
    sharedSkills: ["SQL", "Open Source"],
    collaborationReason:
      "Rahul needs web developers to deploy and visualize ML models and resume screeners.",
    hubLabel: "AI/ML & Python Pipelines",
    svgPath: "M 550 310 C 640 370, 720 420, 830 470",
    pulsePath: "M 550 310 Q 690 390 830 470"
  },
  stu_004: {
    synergyTitle: "Client Applications ↔ Cloud Microservices & AWS",
    synergyType: "Fullstack Co-Founders",
    sharedSkills: ["Docker", "System Design"],
    collaborationReason:
      "Priya architects high-throughput backend services for student campus platforms.",
    hubLabel: "Cloud Backend & Spring Boot",
    svgPath: "M 550 310 C 460 250, 370 220, 240 160",
    pulsePath: "M 550 310 Q 395 235 240 160"
  },
  stu_005: {
    synergyTitle: "Web Platform ↔ Mobile Apps & Flutter",
    synergyType: "Cross-Platform Ecosystem",
    sharedSkills: ["REST APIs", "UI/UX"],
    collaborationReason:
      "Karan builds mobile companion apps and seeks designers and backend collaborators.",
    hubLabel: "Mobile Apps & REST APIs",
    svgPath: "M 550 310 C 450 370, 360 420, 260 470",
    pulsePath: "M 550 310 Q 405 390 260 470"
  }
};

export default function StudentMatching() {
  const { t } = useTranslation("landing");
  const { t: tSite } = useTranslation("site");

  // Selection & interaction state
  const [selectedStudentId, setSelectedStudentId] = useState("stu_002"); // default focus on Aisha Khan
  const [modalStudent, setModalStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSkillFilter, setActiveSkillFilter] = useState("all");
  const [animPulseConnection, setAnimPulseConnection] = useState(null);

  // Five-Stage Storyboard timeline: 1 (Awakens), 2 (Emerge), 3 (Connect), 4 (Match), 5 (Interactive)
  const [animationStage, setAnimationStage] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return 5;
      }
    }
    return 1;
  });

  // Connection status persisted in localStorage
  const [connectionStates, setConnectionStates] = useState(() => {
    try {
      const saved = localStorage.getItem("tf_student_connections");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  const sectionRef = useRef(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Storyboard execution: non-blocking progression across scenes
  useEffect(() => {
    if (reducedMotion) return;

    const t1 = setTimeout(() => setAnimationStage(2), 700);  // Scene 2: Cards emerge
    const t2 = setTimeout(() => setAnimationStage(3), 1600); // Scene 3: Constellation connects
    const t3 = setTimeout(() => setAnimationStage(4), 2800); // Scene 4: Match reveal
    const t4 = setTimeout(() => setAnimationStage(5), 4200); // Scene 5: Fully settled & interactive

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [reducedMotion]);

  // Persist connection states
  const handleConnectClick = useCallback((e, studentId) => {
    e.stopPropagation();

    // Trigger visual connection pulse towards this student (Scene 5)
    setAnimPulseConnection(studentId);
    setTimeout(() => setAnimPulseConnection(null), 1800);

    // Workflow: none -> pending -> connected -> none
    setConnectionStates((prev) => {
      const current = prev[studentId] || "none";
      let next = "pending";
      if (current === "pending") next = "connected";
      else if (current === "connected") next = "none";

      const updated = { ...prev, [studentId]: next };
      try {
        localStorage.setItem("tf_student_connections", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save connection state:", err);
      }
      return updated;
    });

    // Auto-resolve pending to connected after 650ms if currently pending
    setTimeout(() => {
      setConnectionStates((prev) => {
        if (prev[studentId] === "pending") {
          const resolved = { ...prev, [studentId]: "connected" };
          try {
            localStorage.setItem("tf_student_connections", JSON.stringify(resolved));
          } catch (error) {
  console.error("Failed to save resolved connection state:", error);
}
          return resolved;
        }
        return prev;
      });
    }, 650);
  }, []);

  // Central student anchor (Misthi Rawal)
  const centralStudent = useMemo(
    () => studentData.find((s) => s.id === "stu_001") || studentData[0],
    []
  );

  // Constellation peripheral candidates
  const constellationCandidates = useMemo(
    () => studentData.filter((s) => s.id !== "stu_001").slice(0, 4),
    []
  );

  // Currently focused match candidate
  const activeCandidate = useMemo(
    () => studentData.find((s) => s.id === selectedStudentId) || constellationCandidates[0],
    [selectedStudentId, constellationCandidates]
  );

  const analysisId = MATCH_ANALYSIS_MAP[selectedStudentId] ? selectedStudentId : "stu_002";
  const activeMatchAnalysis = {
    ...MATCH_ANALYSIS_MAP[analysisId],
    ...tSite(`matching.analysis.${analysisId}`, { returnObjects: true })
  };

  // Filter students by skill filter & search
  const matchesSkillFilter = useCallback(
    (student) => {
      if (activeSkillFilter === "all") return true;
      const skillsStr = (student.skills || []).join(" ").toLowerCase();
      const majorStr = (student.major || "").toLowerCase();

      switch (activeSkillFilter) {
        case "react":
          return skillsStr.includes("react") || skillsStr.includes("javascript");
        case "design":
          return skillsStr.includes("figma") || skillsStr.includes("ui") || majorStr.includes("design");
        case "ai":
          return skillsStr.includes("python") || skillsStr.includes("learning") || skillsStr.includes("pandas");
        case "backend":
          return skillsStr.includes("java") || skillsStr.includes("spring") || skillsStr.includes("docker");
        case "mobile":
          return skillsStr.includes("flutter") || skillsStr.includes("dart");
        default:
          return true;
      }
    },
    [activeSkillFilter]
  );

  const matchesSearch = useCallback(
    (student) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(q) ||
        student.college.toLowerCase().includes(q) ||
        student.major.toLowerCase().includes(q) ||
        student.skills.some((sk) => sk.toLowerCase().includes(q))
      );
    },
    [searchQuery]
  );

  return (
    <section
      className={`tf-matching-section stage-${animationStage} ${
        reducedMotion ? "is-reduced-motion" : ""
      }`}
      id="matching"
      aria-labelledby="tf-matching-heading"
      ref={sectionRef}
    >
      {/* SCENE 1: Background Universe & Violet Light Points */}
      <div className="tf-universe-bg" aria-hidden="true">
        <div className="tf-universe-glow" />
        {UNIVERSE_PARTICLES.map((p) => (
          <span
            key={p.id}
            className="tf-universe-star"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>

      <div className="tf-matching-inner">
        {/* Section Header */}
        <header className="tf-matching-header">
          <p className="tf-matching-eyebrow">
            {t("studentMatching.eyebrow", "STUDENT MATCHING ENGINE")}
          </p>

          <h2 id="tf-matching-heading" className="tf-matching-title">
            {tSite("matching.titleBefore")}{" "}
            <span className="tf-purple-constellation">
              {tSite("matching.titleHighlight")}
            </span>.
          </h2>

          <p className="tf-matching-description">
            {t(
              "studentMatching.description",
              "Discover project collaborators, complementary skill sets, and verified campus builders."
            )}
          </p>

          {/* Interactive Filter & Search Controls (Phase 4) */}
          <div className="tf-matching-controls" role="search" aria-label={tSite("matching.searchRegion")}>
            <div className="tf-matching-search-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className="tf-matching-search-input"
                placeholder={t(
                  "studentMatching.searchPlaceholder",
                  "Search by name, skill, or university..."
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={tSite("matching.searchLabel")}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="tf-search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label={tSite("matching.clearSearch")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Skill Filter Pills */}
            <div className="tf-matching-filter-pills" role="radiogroup" aria-label={tSite("matching.skillFilters")}>
              {[
                { id: "all", label: t("studentMatching.filterAll", "All Builders") },
                { id: "react", label: t("studentMatching.filterReact", "React & Frontend") },
                { id: "design", label: t("studentMatching.filterDesign", "UI/UX & Design") },
                { id: "ai", label: t("studentMatching.filterAI", "AI/ML & Data") },
                { id: "backend", label: t("studentMatching.filterBackend", "Cloud & Backend") },
                { id: "mobile", label: t("studentMatching.filterMobile", "Mobile & Flutter") }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`tf-filter-pill ${activeSkillFilter === f.id ? "is-active" : ""}`}
                  role="radio"
                  aria-checked={activeSkillFilter === f.id}
                  onClick={() => setActiveSkillFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* 2.5D Constellation Stage (Scenes 2, 3, 4, 5) */}
        <div className="tf-constellation-stage" role="region" aria-label={tSite("matching.constellation")}>
          {/* SCENE 3: Dynamic SVG Constellation Stream Lines */}
          <svg
            className="tf-constellation-svg"
            viewBox="0 0 1100 620"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="tf-stream-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5035ff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>

              <filter id="tf-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Constellation Mesh */}
            <path
              d="M 240 160 L 850 160 M 240 160 L 260 470 M 850 160 L 830 470 M 260 470 L 830 470"
              className="tf-constellation-mesh"
            />

            {/* Individual Candidate Connection Streams */}
            {Object.entries(MATCH_ANALYSIS_MAP).map(([stuId, analysis]) => {
              const isTargetSelected = selectedStudentId === stuId;
              const isPulsing = animPulseConnection === stuId;

              return (
                <g key={stuId} className={`tf-stream-group ${isTargetSelected ? "is-selected-stream" : ""}`}>
                  {/* Base Connection Path */}
                  <path
                    d={analysis.svgPath}
                    className={`tf-stream-line ${isTargetSelected ? "is-active" : ""}`}
                  />

                  {/* Luminous Stream Pulse (Traveling along connection) */}
                  <path
                    d={analysis.svgPath}
                    className={`tf-stream-pulse-line ${isTargetSelected || isPulsing ? "is-active-pulse" : ""}`}
                  />
                </g>
              );
            })}
          </svg>

          {/* Central Anchor Profile Card: Misthi Rawal */}
          <div
            className={`tf-constellation-card tf-central-card ${
              matchesSkillFilter(centralStudent) && matchesSearch(centralStudent)
                ? "is-matching"
                : "is-dimmed"
            }`}
            tabIndex={0}
            role="button"
            aria-label={tSite("matching.centralAnchorLabel", {
              name: centralStudent.name,
              major: centralStudent.major
            })}
            onClick={() => setModalStudent(centralStudent)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setModalStudent(centralStudent);
              }
            }}
          >
            <div className="tf-central-badge">
              <span className="tf-anchor-ring" aria-hidden="true" />
              {t("studentMatching.centralAnchor", "Active Anchor")}
            </div>

            <div className="tf-card-top-identity">
              <div className="tf-card-avatar-wrap is-central">
                <img
                  src={centralStudent.avatar}
                  alt=""
                  className="tf-avatar"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }}
                />
                <div className="tf-avatar-fallback" style={{ display: "none" }} aria-hidden="true">
                  {centralStudent.name.charAt(0)}
                </div>
              </div>

              <div className="tf-card-names">
                <h3 className="tf-card-name">{centralStudent.name}</h3>
                <p className="tf-card-major">{centralStudent.major}</p>
                <span className="tf-card-college">{centralStudent.college}</span>
              </div>
            </div>

            <div className="tf-card-skills-row">
              {centralStudent.skills.slice(0, 3).map((sk) => (
                <span className="tf-card-chip" key={sk}>
                  {sk}
                </span>
              ))}
            </div>

            <div className="tf-card-looking-for">
              <span className="tf-looking-heading">{t("talentStream.lookingFor", "Looking for")}:</span>
              <p>{centralStudent.lookingFor}</p>
            </div>
          </div>

          {/* Peripheral Match Constellation Cards */}
          {constellationCandidates.map((candidate, idx) => {
            const isSelected = selectedStudentId === candidate.id;
            const matchesFilter = matchesSkillFilter(candidate) && matchesSearch(candidate);
            const connectionState = connectionStates[candidate.id] || "none";
            const slotClass = `slot-pos-${idx + 1}`; // slot-pos-1 to slot-pos-4

            return (
              <div
                key={candidate.id}
                className={`tf-constellation-card tf-candidate-card ${slotClass} ${
                  isSelected ? "is-focused-match" : ""
                } ${matchesFilter ? "is-matching" : "is-dimmed"}`}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={tSite("matching.candidateLabel", {
                  name: candidate.name,
                  major: candidate.major,
                  college: candidate.college
                })}
                onMouseEnter={() => setSelectedStudentId(candidate.id)}
                onFocus={() => setSelectedStudentId(candidate.id)}
                onClick={() => setSelectedStudentId(candidate.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedStudentId(candidate.id);
                  }
                }}
              >
                <div className="tf-card-top-identity">
                  <div className="tf-card-avatar-wrap">
                    <img
                      src={candidate.avatar}
                      alt=""
                      className="tf-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling.style.display = "flex";
                      }}
                    />
                    <div className="tf-avatar-fallback" style={{ display: "none" }} aria-hidden="true">
                      {candidate.name.charAt(0)}
                    </div>
                  </div>

                  <div className="tf-card-names">
                    <h3 className="tf-card-name">{candidate.name}</h3>
                    <p className="tf-card-major">{candidate.major}</p>
                    <span className="tf-card-college">{candidate.college}</span>
                  </div>
                </div>

                <div className="tf-card-skills-row">
                  {candidate.skills.slice(0, 3).map((sk) => (
                    <span className="tf-card-chip" key={sk}>
                      {sk}
                    </span>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="tf-card-chip tf-chip-more">
                      +{candidate.skills.length - 3}
                    </span>
                  )}
                </div>

                {/* SCENE 4: Explainable Match Detail Badge */}
                {isSelected && (
                  <div className="tf-match-insight-badge" aria-live="polite">
                    <span className="tf-insight-icon" aria-hidden="true">
                      ⚡
                    </span>
                    <div className="tf-insight-content">
                      <strong>{activeMatchAnalysis.synergyType}</strong>
                      <p>{activeMatchAnalysis.synergyTitle}</p>
                    </div>
                  </div>
                )}

                {/* Actions: View Profile & Real Connect Button (Scene 5) */}
                <div className="tf-candidate-actions">
                  <button
                    type="button"
                    className="tf-btn-view-profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalStudent(candidate);
                    }}
                    aria-label={tSite("matching.viewProfileLabel", {
                      name: candidate.name
                    })}
                  >
                    {t("studentMatching.viewProfile", "View Profile")}
                  </button>

                  <button
                    type="button"
                    className={`tf-btn-connect-stream is-${connectionState}`}
                    onClick={(e) => handleConnectClick(e, candidate.id)}
                    aria-label={tSite("matching.connectLabel", {
                      name: candidate.name,
                      status: tSite(`matching.connectionStatus.${connectionState}`)
                    })}
                  >
                    {connectionState === "pending" ? (
                      <span className="tf-connecting-label">
                        <span className="tf-mini-spinner" aria-hidden="true" />
                        {t("studentMatching.connecting", "Requesting...")}
                      </span>
                    ) : connectionState === "connected" ? (
                      <span>{t("studentMatching.connected", "Connected ✓")}</span>
                    ) : (
                      <span>+ {t("studentMatching.connect", "Connect")}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SCENE 4 & 5: Selected Match Deep-Dive Detail Drawer */}
        {activeCandidate && (
          <aside
            className="tf-match-analysis-panel"
            aria-labelledby="tf-match-panel-title"
          >
            <div className="tf-panel-left">
              <span className="tf-panel-tag">
                <span className="tf-sparkle" aria-hidden="true">✦</span>
                {t("studentMatching.matchAnalysis", "Match Analysis")}
              </span>
              <h3 id="tf-match-panel-title" className="tf-panel-title">
                {centralStudent.name} + {activeCandidate.name}
              </h3>
              <p className="tf-panel-reason">{activeMatchAnalysis.collaborationReason}</p>
            </div>

            <div className="tf-panel-middle">
              <div className="tf-synergy-column">
                <span className="tf-synergy-label">
                  {t("studentMatching.complementaryFocus", "Complementary Focus")}:
                </span>
                <span className="tf-synergy-value">{activeMatchAnalysis.synergyTitle}</span>
              </div>

              <div className="tf-synergy-column">
                <span className="tf-synergy-label">
                  {t("studentMatching.sharedSkills", "Shared Skills")}:
                </span>
                <div className="tf-shared-chips">
                  {activeMatchAnalysis.sharedSkills.map((sk) => (
                    <span className="tf-shared-pill" key={sk}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="tf-panel-right">
              <button
                type="button"
                className={`tf-panel-connect-btn is-${connectionStates[activeCandidate.id] || "none"}`}
                onClick={(e) => handleConnectClick(e, activeCandidate.id)}
              >
                {connectionStates[activeCandidate.id] === "pending"
                  ? t("studentMatching.connecting", "Requesting...")
                  : connectionStates[activeCandidate.id] === "connected"
                  ? t("studentMatching.connected", "Connected ✓")
                  : `+ ${t("studentMatching.connect", "Connect with")} ${activeCandidate.name.split(" ")[0]}`}
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Reusable Profile Modal (Phase 4: View profile opens existing modal) */}
      {modalStudent && (
        <StudentModal
          student={modalStudent}
          onClose={() => setModalStudent(null)}
        />
      )}
    </section>
  );
}
