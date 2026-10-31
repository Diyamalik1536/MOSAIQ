// Skill taxonomy for client-side and enhanced matching
const SKILL_TAXONOMY = [
  { id: "javascript", name: "JavaScript", category: "Languages", aliases: ["js", "javascript es6", "ecmascript"] },
  { id: "typescript", name: "TypeScript", category: "Languages", aliases: ["ts"] },
  { id: "python", name: "Python", category: "Languages", aliases: ["py", "python3"] },
  { id: "java", name: "Java", category: "Languages", aliases: ["core java"] },
  { id: "c++", name: "C++", category: "Languages", aliases: ["cpp"] },
  { id: "c", name: "C", category: "Languages", aliases: ["ansi c"] },
  { id: "go", name: "Go", category: "Languages", aliases: ["golang"] },
  { id: "kotlin", name: "Kotlin", category: "Languages", aliases: [] },
  { id: "rust", name: "Rust", category: "Languages", aliases: [] },
  { id: "react", name: "React", category: "Web & Frameworks", aliases: ["reactjs", "react.js", "react native"] },
  { id: "node.js", name: "Node.js", category: "Web & Frameworks", aliases: ["nodejs", "node"] },
  { id: "html", name: "HTML", category: "Web & Frameworks", aliases: ["html5"] },
  { id: "css", name: "CSS", category: "Web & Frameworks", aliases: ["css3", "sass", "tailwind"] },
  { id: "sql", name: "SQL", category: "Data & Cloud", aliases: ["mysql", "postgresql", "postgres", "sqlite", "nosql", "mongodb"] },
  { id: "data structures", name: "Data Structures", category: "CS Fundamentals", aliases: ["data structure", "dsa"] },
  { id: "algorithms", name: "Algorithms", category: "CS Fundamentals", aliases: ["algorithm", "problem solving"] },
  { id: "systems design", name: "Systems Design", category: "CS Fundamentals", aliases: ["system design", "software architecture", "distributed systems"] },
  { id: "debugging", name: "Debugging", category: "CS Fundamentals", aliases: ["debug", "troubleshooting", "testing"] },
  { id: "cloud", name: "Cloud Computing", category: "Data & Cloud", aliases: ["gcp", "google cloud", "aws", "azure", "docker", "kubernetes"] },
  { id: "machine learning", name: "Machine Learning", category: "Data & Cloud", aliases: ["ml", "ai", "deep learning", "nlp", "tensorflow", "pytorch"] },
  { id: "git", name: "Git & Version Control", category: "Web & Frameworks", aliases: ["git", "github", "gitlab", "version control"] },
];

const ALIAS_MAP = new Map();
for (const skill of SKILL_TAXONOMY) {
  ALIAS_MAP.set(skill.id.toLowerCase(), skill);
  ALIAS_MAP.set(skill.name.toLowerCase(), skill);
  for (const alias of skill.aliases) {
    ALIAS_MAP.set(alias.toLowerCase(), skill);
  }
}

export function normalizeSkill(raw) {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.trim().toLowerCase();
  return ALIAS_MAP.get(clean) || { id: clean, name: raw.trim(), category: "Other Skills" };
}

export function extractSkillsFromText(text) {
  if (!text || typeof text !== "string") return [];
  const found = new Map();
  const lower = text.toLowerCase();

  for (const skill of SKILL_TAXONOMY) {
    const terms = [skill.name, skill.id, ...skill.aliases];
    for (const term of terms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[^a-z0-9+#])${escaped}($|[^a-z0-9+#])`, "i");
      if (regex.test(lower)) {
        found.set(skill.id, skill);
        break;
      }
    }
  }

  return [...found.values()];
}

export function compareResumeWithJob(requirements, profile) {
  // If requirements already has requiredSkills array from backend:
  let reqSkills;
  if (Array.isArray(requirements?.requiredSkills) && requirements.requiredSkills.length > 0) {
    reqSkills = requirements.requiredSkills.map((s) => {
      const name = s.normalizedName || s.name || s.skillId;
      const norm = normalizeSkill(name);
      return { id: norm.id, name: norm.name, category: norm.category, original: s };
    });
  } else {
    // Extract from qualifications and description
    const textPool = [
      ...(requirements?.qualifications?.minimum || []),
      ...(requirements?.qualifications?.preferred || []),
      requirements?.job?.description || "",
      requirements?.responsibilities?.join(" ") || "",
    ].join(" ");

    reqSkills = extractSkillsFromText(textPool);
  }

  // Deduplicate required skills
  const reqMap = new Map();
  for (const s of reqSkills) {
    if (!reqMap.has(s.id)) reqMap.set(s.id, s);
  }
  const uniqueRequired = [...reqMap.values()];

  // User skills from profile
  const userDirectSkills = new Set();
  const rawSkills = profile?.skills || [];
  for (const s of rawSkills) {
    const rawName = typeof s === "string" ? s : s?.name || s?.skill;
    const norm = normalizeSkill(rawName);
    if (norm) userDirectSkills.add(norm.id);
  }

  // User skills mentioned in projects
  const userProjectSkills = new Set();
  const projects = profile?.projects || [];
  for (const p of projects) {
    const tech = Array.isArray(p.technologies) ? p.technologies : [];
    for (const t of tech) {
      const norm = normalizeSkill(t);
      if (norm) userProjectSkills.add(norm.id);
    }
    const extracted = extractSkillsFromText(`${p.name || ""} ${p.description || ""}`);
    for (const s of extracted) userProjectSkills.add(s.id);
  }

  // User skills mentioned in experience
  const userExpSkills = new Set();
  const experiences = profile?.experience || [];
  for (const exp of experiences) {
    const extracted = extractSkillsFromText(`${exp.role || ""} ${exp.company || ""} ${exp.description || ""}`);
    for (const s of extracted) userExpSkills.add(s.id);
  }

  // Classification
  const matched = [];
  const supporting = [];
  const missing = [];

  for (const skill of uniqueRequired) {
    if (userDirectSkills.has(skill.id)) {
      matched.push({
        ...skill,
        status: "matched",
        evidence: "Directly listed on resume profile",
      });
    } else if (userProjectSkills.has(skill.id) || userExpSkills.has(skill.id)) {
      supporting.push({
        ...skill,
        status: "insufficient-evidence",
        evidence: userProjectSkills.has(skill.id) ? "Demonstrated in student projects" : "Mentioned in work experience",
      });
    } else {
      missing.push({
        ...skill,
        status: "missing",
        evidence: "Not found in profile or projects",
      });
    }
  }

  const totalRequired = uniqueRequired.length || 1;
  const matchPercentage = Math.round((matched.length / totalRequired) * 100);
  const potentialWithSupporting = Math.round(((matched.length + supporting.length) / totalRequired) * 100);

  // Group by Category for Bar Charts
  const categories = ["Languages", "Web & Frameworks", "CS Fundamentals", "Data & Cloud"];
  const categoryBreakdown = categories.map((cat) => {
    const inCat = uniqueRequired.filter((s) => s.category === cat);
    const catMatched = matched.filter((s) => s.category === cat);
    const catSupporting = supporting.filter((s) => s.category === cat);
    const catMissing = missing.filter((s) => s.category === cat);

    return {
      category: cat,
      required: inCat.length,
      matched: catMatched.length,
      inProjects: catSupporting.length,
      missing: catMissing.length,
    };
  }).filter((c) => c.required > 0);

  // Donut/Pie Chart Data
  const pieData = [
    { name: "Matched Skills", value: matched.length, color: "#10b981" },
    { name: "In Projects/Exp", value: supporting.length, color: "#f59e0b" },
    { name: "Missing Skills", value: missing.length, color: "#f43f5e" },
  ].filter((d) => d.value > 0);

  return {
    totalRequired: uniqueRequired.length,
    matchedCount: matched.length,
    supportingCount: supporting.length,
    missingCount: missing.length,
    matchPercentage,
    potentialWithSupporting,
    matched,
    supporting,
    missing,
    categoryBreakdown,
    pieData,
  };
}

