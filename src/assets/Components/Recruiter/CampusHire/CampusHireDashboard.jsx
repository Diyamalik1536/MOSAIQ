
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../../config/firebase";
import { useUser } from "../../../../context/UserContext";
import {
  Search,
  Bell,
  ChevronDown,
  X,
  Users,
  UserCheck,
  Star,
  BriefcaseBusiness,
  BookmarkPlus,
  Check,
  SlidersHorizontal,
  CircleHelp,
  ArrowUpRight,
  GitCompareArrows
} from "lucide-react";
import { studentData } from "../../Dashboard/BrowseStudents/studentData.js";
import {
  getCandidates,
  getMatchDistribution,
  MATCH_WEIGHTS
} from "./utils/scoring";
import Sidebar from "./components/Sidebar";
import {
  MatchDistributionChart,
  ComponentComparisonChart,
  SkillDistributionChart,
  StrengthsChart,
  ExperienceScatterChart
} from "./components/Charts";
import "./CampusHire.css";

const initialFilters = {
  department: "All Departments",
  graduationYear: "All Years",
  projectDomain: "",
  minMatchScore: 0,
  minMentorRating: 0,
  minExperience: 0,
  skillFilter: "",
  certification: 0
};

function ScoreRing({ score }) {
  return (
    <div className="score-ring" style={{ "--score": `${score}%` }}>
      <div>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function CardTitle({ title, subtitle }) {
  return (
    <div className="card-title">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

function getAvatarClass(id) {
  const numericId = Number(String(id).replace("stu_", ""));
  return `avatar-${Number.isFinite(numericId) ? numericId % 4 : 0}`;
}

function formatValue(value, suffix = "") {
  return Number.isFinite(value) ? `${value}${suffix}` : "Not provided";
}

function App() {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();

  const [page, setPage] = useState("Discovery");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [selectedId, setSelectedId] = useState("stu_001");
  const [shortlist, setShortlist] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

  const allRanked = useMemo(
    () =>
      getCandidates(studentData, {
        ...filters,
        department: "",
        graduationYear: "",
        projectDomain: "",
        minMatchScore: 0,
        minMentorRating: 0,
        minExperience: 0,
        skillFilter: "",
        certification: 0
      }),
    [filters]
  );

  const candidates = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return allRanked
      .filter(
        (student) =>
          filters.department === "All Departments" ||
          student.department === filters.department
      )
      .filter(
        (student) =>
          filters.graduationYear === "All Years" ||
          student.graduationYear === filters.graduationYear
      )
      .filter(
        (student) =>
          !filters.projectDomain ||
          student.projects.some((project) =>
            `${project.title} ${project.stack}`
              .toLowerCase()
              .includes(filters.projectDomain.toLowerCase())
          )
      )
      .filter(
        (student) =>
          student.matchScore >= Number(filters.minMatchScore)
      )
      .filter(
        (student) =>
          !Number(filters.minMentorRating) ||
          (Number.isFinite(student.mentorRating) &&
            student.mentorRating >= Number(filters.minMentorRating))
      )
      .filter(
        (student) =>
          !Number(filters.minExperience) ||
          (Number.isFinite(student.experienceMonths) &&
            student.experienceMonths >= Number(filters.minExperience))
      )
      .filter(
        (student) =>
          !filters.skillFilter ||
          student.skills.includes(filters.skillFilter)
      )
      .filter(
        (student) =>
          !Number(filters.certification) ||
          (Number.isFinite(student.certifications) &&
            student.certifications >= Number(filters.certification))
      )
      .filter(
        (student) =>
          !searchTerm ||
          student.name.toLowerCase().includes(searchTerm) ||
          student.email.toLowerCase().includes(searchTerm) ||
          student.college.toLowerCase().includes(searchTerm) ||
          student.major.toLowerCase().includes(searchTerm) ||
          student.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm)
          ) ||
          student.projects.some((project) =>
            `${project.title} ${project.stack}`
              .toLowerCase()
              .includes(searchTerm)
          )
      )
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [allRanked, filters, query]);

  const selectedStudent =
    candidates.find((student) => student.id === selectedId) ||
    candidates[0] ||
    null;

  const distribution = getMatchDistribution(candidates);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const toggleShortlist = (id) => {
    setShortlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleCompare = (id) => {
    setCompareIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : previous.length < 4
          ? [...previous, id]
          : previous
    );
  };

  const shortlistStudents = allRanked.filter((student) =>
    shortlist.includes(student.id)
  );

  const comparisonStudents = allRanked.filter((student) =>
    compareIds.includes(student.id)
  );

  const recruiterName =
    currentUser?.displayName ||
    currentUser?.name ||
    (currentUser?.email
      ? currentUser.email.split("@")[0]
      : "Recruiter");

  async function handleLogout() {
    await signOut(auth);
    setCurrentUser(null);
    navigate("/recruiter/login", { replace: true });
  }

  const departments = [
    ...new Set(studentData.map((student) => student.major).filter(Boolean))
  ];

  const years = [
    ...new Set(studentData.map((student) => student.year).filter(Boolean))
  ];

  const skills = [
    ...new Set(studentData.flatMap((student) => student.skills || []))
  ].sort();

  return (
    <div className="campushire-dashboard">
      <div className="app-shell">
        <Sidebar
          page={page}
          setPage={setPage}
          shortlistCount={shortlist.length}
        />

        <main className="main-area">
          <header className="topbar">
            <label className="search-box">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search students or skills..."
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <div className="college-select">
              <span>▥</span>
              <select
                aria-label="College"
                value={filters.college || ""}
                onChange={(event) =>
                  updateFilter("college", event.target.value)
                }
              >
                <option value="">All Partner Colleges</option>
                {[...new Set(studentData.map((student) => student.college))]
                  .filter(Boolean)
                  .map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
              </select>
              <ChevronDown size={14} />
            </div>

            <div className="topbar-spacer" />

            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <i />
            </button>

            <div className="recruiter-avatar">
              {recruiterName.slice(0, 1).toUpperCase()}
            </div>

            <div className="recruiter-name">
              <strong>{recruiterName}</strong>
              <span>Recruiter</span>
            </div>

            <button
              className="campushire-logout"
              type="button"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </header>

          <div className="page-content">
            <div className="heading-row">
              <div>
                <div className="eyebrow">RECRUITER WORKSPACE</div>
                <h1>
                  {page === "Discovery" ? "Smart Student Discovery" : page}
                </h1>
                <p>
                  {page === "Discovery"
                    ? "Find students using their listed skills, projects and interests."
                    : `Explore and manage student ${page.toLowerCase()} using your recruitment criteria.`}
                </p>
              </div>
              <span className="demo-badge">
                <i /> MOSAIQ student data
              </span>
            </div>

            {page === "Discovery" && (
              <>
                <section className="filters-card">
                  <div className="filters-heading">
                    <SlidersHorizontal size={16} />
                    <strong>Recruiter filters</strong>
                    <button
                      onClick={() => {
                        setFilters(initialFilters);
                        setQuery("");
                      }}
                    >
                      Reset filters
                    </button>
                  </div>

                  <div className="filter-grid">
                    <label>
                      Department
                      <select
                        value={filters.department}
                        onChange={(event) =>
                          updateFilter("department", event.target.value)
                        }
                      >
                        <option>All Departments</option>
                        {departments.map((department) => (
                          <option key={department}>{department}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Academic Year
                      <select
                        value={filters.graduationYear}
                        onChange={(event) =>
                          updateFilter("graduationYear", event.target.value)
                        }
                      >
                        <option>All Years</option>
                        {years.map((year) => (
                          <option key={year}>{year}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Project
                      <select
                        value={filters.projectDomain}
                        onChange={(event) =>
                          updateFilter("projectDomain", event.target.value)
                        }
                      >
                        <option value="">All Projects</option>
                        {[
                          ...new Set(
                            studentData.flatMap((student) =>
                              (student.projects || []).map(
                                (project) => project.title
                              )
                            )
                          )
                        ].map((project) => (
                          <option key={project} value={project}>
                            {project}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Minimum Match Score
                      <select
                        value={filters.minMatchScore}
                        onChange={(event) =>
                          updateFilter("minMatchScore", event.target.value)
                        }
                      >
                        <option value="0">Any score</option>
                        <option value="50">50%+</option>
                        <option value="70">70%+</option>
                        <option value="80">80%+</option>
                        <option value="90">90%+</option>
                      </select>
                    </label>

                    <label>
                      Min. Mentor Rating
                      <select
                        value={filters.minMentorRating}
                        onChange={(event) =>
                          updateFilter("minMentorRating", event.target.value)
                        }
                      >
                        <option value="0">Not provided / Any</option>
                        <option value="3">3.0+</option>
                        <option value="3.5">3.5+</option>
                        <option value="4">4.0+</option>
                        <option value="4.5">4.5+</option>
                      </select>
                    </label>

                    <label>
                      Experience
                      <select
                        value={filters.minExperience}
                        onChange={(event) =>
                          updateFilter("minExperience", event.target.value)
                        }
                      >
                        <option value="0">Not provided / Any</option>
                        <option value="3">3+ months</option>
                        <option value="6">6+ months</option>
                        <option value="9">9+ months</option>
                      </select>
                    </label>

                    <label>
                      Skill
                      <select
                        value={filters.skillFilter}
                        onChange={(event) =>
                          updateFilter("skillFilter", event.target.value)
                        }
                      >
                        <option value="">All skills</option>
                        {skills.map((skill) => (
                          <option key={skill}>{skill}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Certifications
                      <select
                        value={filters.certification}
                        onChange={(event) =>
                          updateFilter("certification", event.target.value)
                        }
                      >
                        <option value="0">Not provided / Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                      </select>
                    </label>
                  </div>
                </section>

                <section className="dashboard-grid">
                  <div className="card candidate-card">
                    <CardTitle
                      title="Top Candidates"
                      subtitle={`${candidates.length} candidates match your filters`}
                    />

                    <div className="candidate-table">
                      <div className="candidate-table-head">
                        <span>#</span>
                        <span>Student Name</span>
                        <span>Match</span>
                      </div>

                      {candidates.length ? (
                        candidates.map((student, index) => (
                          <button
                            key={student.id}
                            className={`candidate-row ${
                              selectedStudent?.id === student.id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => setSelectedId(student.id)}
                          >
                            <span className="rank">{index + 1}</span>
                            <span className="candidate-name">
                              <i
                                className={`mini-avatar ${getAvatarClass(student.id)}`}
                              >
                                {student.initials}
                              </i>
                              <span>
                                <b>{student.name}</b>
                                <small>{student.major}</small>
                              </span>
                            </span>
                            <strong className="match-number">
                              {student.matchScore}%
                            </strong>
                          </button>
                        ))
                      ) : (
                        <div className="empty-state">
                          No candidates match these filters. Try resetting
                          the filters.
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <Users size={14} /> Ranked using available student data
                    </div>
                  </div>

                  <div className="card score-card">
                    {selectedStudent ? (
                      <>
                        <div className="selected-header">
                          <div>
                            <span className="eyebrow">SELECTED CANDIDATE</span>
                            <h2>{selectedStudent.name}</h2>
                          </div>
                          <span className="score-pill">
                            Match Score <b>{selectedStudent.matchScore}%</b>
                          </span>
                        </div>

                        <div className="score-main">
                          <div className="contribution-list">
                            <h3>
                              Score Contribution{" "}
                              <small>(weighted points)</small>
                            </h3>

                            {[
                              [
                                "Skill Match",
                                selectedStudent.components.skillMatch,
                                MATCH_WEIGHTS.skillMatch,
                                "blue"
                              ],
                              [
                                "Project Indicator",
                                selectedStudent.components.projectRelevance,
                                MATCH_WEIGHTS.projectRelevance,
                                "green"
                              ],
                              [
                                "Practical Experience",
                                selectedStudent.components.experience,
                                MATCH_WEIGHTS.experience,
                                "orange"
                              ],
                              [
                                "Mentor Evaluation",
                                selectedStudent.components.mentorEvaluation,
                                MATCH_WEIGHTS.mentorEvaluation,
                                "purple"
                              ],
                              [
                                "Certifications",
                                selectedStudent.components.certifications,
                                MATCH_WEIGHTS.certifications,
                                "cyan"
                              ]
                            ].map(([label, value, max, color]) => (
                              <div className="contribution-row" key={label}>
                                <span>{label}</span>
                                <div className="progress-track">
                                  <i
                                    className={color}
                                    style={{
                                      width:
                                        value == null
                                          ? "0%"
                                          : `${Math.min((Number(value) / Number(max)) * 100, 100)}%`
                                    }}
                                  />
                                </div>
                                <b>
                                  {value == null
                                    ? "N/A"
                                    : Number(value).toFixed(1)}
                                  <small>/{max}</small>
                                </b>
                              </div>
                            ))}
                          </div>

                          <div className="ring-section">
                            <ScoreRing score={selectedStudent.matchScore} />
                            <span>Available-data score</span>
                          </div>
                        </div>

                        <div className="formula-note">
                          <CircleHelp size={14} />
                          <span>
                            Scores are calculated from available student
                            information. Missing experience, mentor ratings
                            and certification data are excluded, not assumed.
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="empty-state">
                        Select a candidate to see the score breakdown.
                      </div>
                    )}
                  </div>

                  <div className="card profile-card">
                    {selectedStudent && (
                      <>
                        <div className="profile-heading">
                          <div
                            className={`profile-avatar ${getAvatarClass(selectedStudent.id)}`}
                          >
                            {selectedStudent.initials}
                          </div>
                          <div>
                            <h2>{selectedStudent.name}</h2>
                            <span className="score-pill small-pill">
                              Match {selectedStudent.matchScore}%
                            </span>
                          </div>
                        </div>

                        <div className="profile-facts">
                          <div>
                            <span>College</span>
                            <b>{selectedStudent.college || "Not provided"}</b>
                          </div>
                          <div>
                            <span>Major</span>
                            <b>{selectedStudent.major || "Not provided"}</b>
                          </div>
                          <div>
                            <span>Academic Year</span>
                            <b>{selectedStudent.year || "Not provided"}</b>
                          </div>
                          <div>
                            <span>Email</span>
                            <b>{selectedStudent.email || "Not provided"}</b>
                          </div>
                          <div>
                            <span>Experience</span>
                            <b>
                              {formatValue(selectedStudent.experienceMonths, " months")}
                            </b>
                          </div>
                          <div>
                            <span>Mentor Rating</span>
                            <b className="rating">
                              {Number.isFinite(selectedStudent.mentorRating) ? (
                                <>
                                  <Star size={13} fill="currentColor" />{" "}
                                  {selectedStudent.mentorRating.toFixed(1)} / 5
                                </>
                              ) : (
                                "Not provided"
                              )}
                            </b>
                          </div>
                        </div>

                        <div className="profile-section">
                          <h4>Skills</h4>
                          <div className="tags">
                            {(selectedStudent.skills || []).map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                          </div>
                        </div>

                        <div className="profile-section">
                          <h4>Interests</h4>
                          <div className="tags">
                            {(selectedStudent.interests || []).map((item) => (
                              <span className="strength-tag" key={item}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="profile-section">
                          <h4>Projects</h4>
                          {(selectedStudent.projects || []).length ? (
                            selectedStudent.projects.map((project) => (
                              <div key={project.title}>
                                <b>{project.title}</b>
                                <p>{project.stack}</p>
                              </div>
                            ))
                          ) : (
                            <p>No projects listed.</p>
                          )}
                        </div>

                        <div className="profile-actions">
                          <button
                            className={`primary-button ${
                              shortlist.includes(selectedStudent.id)
                                ? "saved"
                                : ""
                            }`}
                            onClick={() =>
                              toggleShortlist(selectedStudent.id)
                            }
                          >
                            {shortlist.includes(selectedStudent.id) ? (
                              <Check size={16} />
                            ) : (
                              <BookmarkPlus size={16} />
                            )}
                            {shortlist.includes(selectedStudent.id)
                              ? "Shortlisted"
                              : "Add to Shortlist"}
                          </button>

                          <button
                            className={`secondary-button ${
                              compareIds.includes(selectedStudent.id)
                                ? "saved"
                                : ""
                            }`}
                            onClick={() => toggleCompare(selectedStudent.id)}
                          >
                            <GitCompareArrows size={15} />
                            {compareIds.includes(selectedStudent.id)
                              ? "In Compare"
                              : "Compare"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="card chart-card distribution-card">
                    <CardTitle
                      title="Candidate Match Distribution"
                      subtitle="Candidates by available-data score"
                    />
                    <MatchDistributionChart data={distribution} />
                  </div>

                  <div className="card chart-card comparison-card">
                    <CardTitle
                      title="Top Candidates — Component Comparison"
                      subtitle="Listed skills and project indicators"
                    />
                    <div className="legend">
                      <span><i className="blue" /> Skills</span>
                      <span><i className="green" /> Projects</span>
                    </div>
                    <ComponentComparisonChart students={candidates} />
                  </div>

                  <div className="card chart-card mentor-card">
                    <CardTitle
                      title="Mentor Evaluation Breakdown"
                      subtitle={selectedStudent?.name || "Selected candidate"}
                    />
                    <div className="empty-state">
                      Mentor evaluation data is not available in the current
                      student records.
                    </div>
                    <div className="card-footer">
                      <Star size={13} /> No mentor ratings have been assumed
                    </div>
                  </div>

                  <div className="card chart-card skills-card">
                    <CardTitle
                      title="Skill Distribution"
                      subtitle="Most common skills in filtered candidates"
                    />
                    <SkillDistributionChart students={candidates} />
                  </div>

                  <div className="card chart-card strengths-card">
                    <CardTitle
                      title="Candidate Strengths"
                      subtitle="Average listed skills, projects and interests"
                    />
                    <StrengthsChart students={candidates} />
                  </div>

                  <div className="card chart-card scatter-card">
                    <CardTitle
                      title="Projects and Listed Skills"
                      subtitle="Counts per candidate"
                    />
                    <ExperienceScatterChart students={candidates} />
                  </div>

                  <div className="card chart-card contribution-card">
                    <CardTitle
                      title="Individual Score Contribution"
                      subtitle={selectedStudent?.name || "Selected candidate"}
                    />

                    {selectedStudent && (
                      <table className="score-table">
                        <thead>
                          <tr>
                            <th>Component</th>
                            <th>Points</th>
                            <th>Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            [
                              "Skill Match",
                              selectedStudent.components.skillMatch,
                              "35%"
                            ],
                            [
                              "Project Indicator",
                              selectedStudent.components.projectRelevance,
                              "25%"
                            ],
                            [
                              "Experience",
                              selectedStudent.components.experience,
                              "15%"
                            ],
                            [
                              "Mentor Evaluation",
                              selectedStudent.components.mentorEvaluation,
                              "15%"
                            ],
                            [
                              "Certifications",
                              selectedStudent.components.certifications,
                              "10%"
                            ]
                          ].map(([name, points, weight]) => (
                            <tr key={name}>
                              <td>{name}</td>
                              <td>
                                {points == null
                                  ? "Not provided"
                                  : Number(points).toFixed(1)}
                              </td>
                              <td>{weight}</td>
                            </tr>
                          ))}
                          <tr className="total-row">
                            <td>Available-data score</td>
                            <td colSpan="2">
                              {selectedStudent.matchScore}/100
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>
              </>
            )}

            {page === "Shortlist" && (
              <section className="page-card">
                <CardTitle
                  title="Shortlisted Candidates"
                  subtitle={`${shortlistStudents.length} students saved for review`}
                />

                {shortlistStudents.length ? (
                  <div className="simple-list">
                    {shortlistStudents.map((student) => (
                      <div className="simple-row" key={student.id}>
                        <div
                          className={`profile-avatar ${getAvatarClass(student.id)}`}
                        >
                          {student.initials}
                        </div>
                        <div className="simple-main">
                          <b>{student.name}</b>
                          <span>
                            {student.major} · {student.college}
                          </span>
                        </div>
                        <strong>{student.matchScore}% match</strong>
                        <button
                          className="text-button"
                          onClick={() => toggleShortlist(student.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    No students shortlisted yet. Open Discovery and add
                    candidates.
                  </div>
                )}
              </section>
            )}

            {page === "Compare" && (
              <section className="page-card">
                <CardTitle
                  title="Compare Candidates"
                  subtitle="Select up to four candidates from Discovery to compare their available information."
                />

                <div className="compare-selectors">
                  {allRanked.map((student) => (
                    <label key={student.id}>
                      <input
                        type="checkbox"
                        checked={compareIds.includes(student.id)}
                        onChange={() => toggleCompare(student.id)}
                        disabled={
                          !compareIds.includes(student.id) &&
                          compareIds.length >= 4
                        }
                      />
                      {student.name}
                    </label>
                  ))}
                </div>

                <div className="compare-grid">
                  {comparisonStudents.map((student) => (
                    <div className="compare-person" key={student.id}>
                      <div
                        className={`profile-avatar ${getAvatarClass(student.id)}`}
                      >
                        {student.initials}
                      </div>
                      <h3>{student.name}</h3>
                      <div className="big-match">{student.matchScore}%</div>
                      <span>Available-data score</span>
                      <hr />
                      <p>College <b>{student.college}</b></p>
                      <p>Major <b>{student.major}</b></p>
                      <p>Year <b>{student.year}</b></p>
                      <p>Experience <b>{formatValue(student.experienceMonths, " months")}</b></p>
                      <p>Mentor rating <b>{formatValue(student.mentorRating, "/5")}</b></p>
                      <div className="tags">
                        {student.skills.slice(0, 3).map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {page === "Analytics" && (
              <section className="analytics-page">
                <div className="metric-grid">
                  <div className="metric-card">
                    <Users />
                    <span>Total students</span>
                    <strong>{studentData.length}</strong>
                  </div>
                  <div className="metric-card">
                    <UserCheck />
                    <span>Currently matching</span>
                    <strong>{candidates.length}</strong>
                  </div>
                  <div className="metric-card">
                    <Star />
                    <span>Mentor ratings available</span>
                    <strong>
                      {studentData.filter((student) =>
                        Number.isFinite(student.mentorRating)
                      ).length}
                    </strong>
                  </div>
                  <div className="metric-card">
                    <BriefcaseBusiness />
                    <span>Shortlisted</span>
                    <strong>{shortlist.length}</strong>
                  </div>
                </div>

                <div className="analytics-grid">
                  <div className="card chart-card">
                    <CardTitle title="Match Score Distribution" />
                    <MatchDistributionChart
                      data={getMatchDistribution(allRanked)}
                    />
                  </div>
                  <div className="card chart-card">
                    <CardTitle title="Skill Distribution" />
                    <SkillDistributionChart students={allRanked} />
                  </div>
                  <div className="card chart-card">
                    <CardTitle title="Candidate Component Comparison" />
                    <ComponentComparisonChart students={allRanked} />
                  </div>
                  <div className="card chart-card">
                    <CardTitle title="Projects and Listed Skills" />
                    <ExperienceScatterChart students={allRanked} />
                  </div>
                </div>
              </section>
            )}

            {page === "Settings" && (
              <section className="page-card settings-page">
                <CardTitle
                  title="Recruiter Settings"
                  subtitle="Recruiter workspace configuration"
                />

                <div className="settings-row">
                  <div>
                    <b>Scoring weights</b>
                    <p>
                      Skills 35%, project indicator 25%, experience 15%,
                      mentor evaluation 15%, certifications 10%.
                    </p>
                  </div>
                  <span className="settings-status">100% total</span>
                </div>

                <div className="settings-row">
                  <div>
                    <b>Data source</b>
                    <p>
                      src/assets/Components/Dashboard/BrowseStudents/studentData.js
                    </p>
                  </div>
                  <span className="settings-status">Connected</span>
                </div>

                <div className="settings-row">
                  <div>
                    <b>Recruiter search</b>
                    <p>
                      Search includes student names, email, college, major,
                      skills and project details.
                    </p>
                  </div>
                  <span className="settings-status">Enabled</span>
                </div>
              </section>
            )}

            <footer className="app-footer">
              CampusHire · College recruitment insights
              <span>
                Match scores use available information; verify student
                information before recruitment decisions.
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
