
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

export function MatchDistributionChart({ data = [] }) {
  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf5" />
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#738198" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#738198" }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="count" name="Candidates" fill="#4b83ed" radius={[4, 4, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComponentComparisonChart({ students = [] }) {
  const data = students.slice(0, 5).map((s) => ({
    name: s.name.split(" ")[0],
    Skills: Math.round(
      (s.skills.length / Math.max(s.skills.length, 5)) * 100
    ),
    Projects: Math.min((s.projects.length / 2) * 100, 100)
  }));

  return (
    <div className="chart-area tall">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 2, right: 8, left: 2, bottom: 2 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8edf5" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#738198" }} />
          <YAxis dataKey="name" type="category" width={58} tick={{ fontSize: 10, fill: "#53627a" }} />
          <Tooltip />
          <Bar dataKey="Skills" fill="#4b83ed" radius={[0, 3, 3, 0]} />
          <Bar dataKey="Projects" fill="#4bbd96" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillDistributionChart({ students = [] }) {
  const counts = {};

  students.forEach((student) =>
    (student.skills || []).forEach((skill) => {
      counts[skill] = (counts[skill] || 0) + 1;
    })
  );

  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf5" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#738198" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#738198" }} />
          <Tooltip />
          <Bar dataKey="value" name="Students with skill" fill="#4b83ed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StrengthsChart({ students = [] }) {
  const count = Math.max(students.length, 1);

  const categories = [
    {
      name: "Technical",
      value: Math.round(
        students.reduce((sum, s) => sum + s.skills.length, 0) / count
      )
    },
    {
      name: "Projects",
      value: Math.round(
        students.reduce((sum, s) => sum + s.projects.length, 0) / count
      )
    },
    {
      name: "Interests",
      value: Math.round(
        students.reduce((sum, s) => sum + (s.interests || []).length, 0) / count
      )
    }
  ];

  const colors = ["#4b83ed", "#4bbd96", "#f4a45f"];

  return (
    <div className="pie-wrap">
      <ResponsiveContainer width="58%" height={160}>
        <PieChart>
          <Pie
            data={categories}
            dataKey="value"
            nameKey="name"
            innerRadius={43}
            outerRadius={65}
            paddingAngle={3}
          >
            {categories.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-legend">
        {categories.map((item, index) => (
          <div key={item.name}>
            <i style={{ background: colors[index] }} />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExperienceScatterChart({ students = [] }) {
  // Experience and mentor ratings are not supplied by studentData.js.
  // Show project counts instead of inventing experience or rating values.
  const data = students.map((s) => ({
    name: s.name,
    projects: (s.projects || []).length,
    skills: (s.skills || []).length
  }));

  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 10, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#738198" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#738198" }} />
          <Tooltip />
          <Bar dataKey="projects" name="Projects" fill="#4b83ed" />
          <Bar dataKey="skills" name="Listed skills" fill="#4bbd96" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
