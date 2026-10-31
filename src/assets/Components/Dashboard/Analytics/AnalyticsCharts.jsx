import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import "./analytics.css";

const COLORS = {
  matched: "#10b981",
  supporting: "#f59e0b",
  missing: "#f43f5e",
  required: "#6366f1",
  softBg: "#f8fafc"
};

const PIE_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="ga-chart-tooltip">
        <p className="tooltip-title" style={{ color: data.payload.color || "#333" }}>
          {data.name}
        </p>
        <p className="tooltip-value">
          <strong>{data.value}</strong> skill{data.value === 1 ? "" : "s"}
        </p>
      </div>
    );
  }
  return null;
}

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="ga-chart-tooltip">
        <p className="tooltip-title">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="tooltip-row" style={{ color: entry.color }}>
            <span>{entry.name}:</span> <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AnalyticsCharts({ analysis, jobTitle, onAddSkillToResume }) {
  if (!analysis) return null;

  const {
    matchPercentage,
    potentialWithSupporting,
    matchedCount,
    totalRequired,
    missingCount,
    supportingCount,
    matched = [],
    supporting = [],
    missing = [],
    categoryBreakdown = [],
    pieData = []
  } = analysis;

  return (
    <div className="ga-analytics-visuals">
      {/* KPI Metric Cards */}
      <div className="ga-kpi-grid">
        <div className="ga-kpi-card match-primary">
          <div className="kpi-icon-wrap">
            <i className="bi bi-bullseye" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Skill Match Score</span>
            <div className="kpi-number-row">
              <strong className="kpi-main-number">{matchPercentage}%</strong>
              {potentialWithSupporting > matchPercentage && (
                <span className="kpi-sub-pill" title="If project evidence is added to your profile skills">
                  Up to {potentialWithSupporting}% with projects
                </span>
              )}
            </div>
            <div className="ga-progress-bar-bg">
              <div
                className="ga-progress-bar-fill"
                style={{ width: `${Math.min(100, matchPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="ga-kpi-card">
          <div className="kpi-icon-wrap icon-green">
            <i className="bi bi-check2-circle" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Matched Skills</span>
            <strong className="kpi-main-number text-green">{matchedCount}</strong>
            <span className="kpi-note">of {totalRequired} required skills</span>
          </div>
        </div>

        <div className="ga-kpi-card">
          <div className="kpi-icon-wrap icon-amber">
            <i className="bi bi-folder-check" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">In Projects & Exp</span>
            <strong className="kpi-main-number text-amber">{supportingCount}</strong>
            <span className="kpi-note">Supporting mentions found</span>
          </div>
        </div>

        <div className="ga-kpi-card">
          <div className="kpi-icon-wrap icon-rose">
            <i className="bi bi-exclamation-triangle" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Missing Skills</span>
            <strong className="kpi-main-number text-rose">{missingCount}</strong>
            <span className="kpi-note">Recommended to learn</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="ga-charts-row">
        {/* Pie / Donut Chart */}
        <div className="ga-chart-card">
          <div className="ga-chart-header">
            <div>
              <h3>Skill Distribution</h3>
              <p>Breakdown of requirements vs your resume</p>
            </div>
          </div>
          <div className="ga-chart-body pie-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="chart-legend-text">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-stat">
              <strong>{matchPercentage}%</strong>
              <span>MATCH</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Category Breakdown */}
        <div className="ga-chart-card">
          <div className="ga-chart-header">
            <div>
              <h3>Category Alignment</h3>
              <p>Required vs your verified skills by domain</p>
            </div>
          </div>
          <div className="ga-chart-body">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={categoryBreakdown}
                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="chart-legend-text">{value}</span>}
                  />
                  <Bar
                    dataKey="required"
                    name="Required"
                    fill={COLORS.required}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="matched"
                    name="In Resume"
                    fill={COLORS.matched}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="inProjects"
                    name="In Projects"
                    fill={COLORS.supporting}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="ga-chart-empty">
                <i className="bi bi-bar-chart" />
                <p>No category requirements found for this listing.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Skill Gap Analysis */}
      {missing.length > 0 && (
        <div className="ga-gap-card">
          <div className="gap-card-head">
            <div className="gap-title-group">
              <i className="bi bi-lightbulb-fill text-amber" />
              <div>
                <h4>Resume Skill Gap & Recommendations</h4>
                <p>
                  To maximize your chances for <strong>{jobTitle}</strong>, consider adding
                  or highlighting these skills in your resume and project portfolio:
                </p>
              </div>
            </div>
          </div>
          <div className="gap-skills-list">
            {missing.map((skill) => (
              <div className="gap-skill-chip" key={skill.id || skill.name}>
                <span className="gap-chip-name">{skill.name}</span>
                <span className="gap-chip-cat">{skill.category}</span>
                {typeof onAddSkillToResume === "function" && (
                  <button
                    type="button"
                    className="gap-add-btn"
                    onClick={() => onAddSkillToResume(skill.name)}
                    title={`Add ${skill.name} to your profile skills`}
                  >
                    <i className="bi bi-plus-lg" /> Add
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched & Supporting Highlights */}
      <div className="ga-skills-matrix">
        <div className="matrix-column matched-column">
          <div className="matrix-column-head">
            <i className="bi bi-check-circle-fill text-green" />
            <h5>Direct Resume Matches ({matched.length})</h5>
          </div>
          {matched.length > 0 ? (
            <div className="matrix-tags">
              {matched.map((s) => (
                <span className="matrix-pill matched-pill" key={s.id || s.name}>
                  <i className="bi bi-check-lg" /> {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="matrix-empty">None directly listed yet. Add skills to your profile to match.</p>
          )}
        </div>

        <div className="matrix-column supporting-column">
          <div className="matrix-column-head">
            <i className="bi bi-folder-symlink-fill text-amber" />
            <h5>Demonstrated in Projects ({supporting.length})</h5>
          </div>
          {supporting.length > 0 ? (
            <div className="matrix-tags">
              {supporting.map((s) => (
                <span className="matrix-pill supporting-pill" key={s.id || s.name}>
                  <i className="bi bi-arrow-up-right" /> {s.name}
                  <small>({s.evidence})</small>
                </span>
              ))}
            </div>
          ) : (
            <p className="matrix-empty">No additional project technologies matched.</p>
          )}
        </div>
      </div>
    </div>
  );
}

