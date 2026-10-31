const entries = [
  ["javascript", "JavaScript", ["js", "javascript es6"]], ["typescript", "TypeScript", ["ts"]],
  ["react", "React", ["reactjs", "react.js"]], ["node", "Node.js", ["nodejs"]],
  ["html", "HTML", ["html5"]], ["css", "CSS", ["css3"]], ["python", "Python", ["py"]],
  ["java", "Java", []], ["cpp", "C++", ["c plus plus"]], ["sql", "SQL", ["structured query language"]],
  ["mongodb", "MongoDB", ["mongo"]], ["firebase", "Firebase", []], ["aws", "AWS", ["amazon web services"]],
  ["docker", "Docker", []], ["kubernetes", "Kubernetes", ["k8s"]], ["git", "Git", ["github"]],
  ["dsa", "Data Structures and Algorithms", ["dsa", "data structures & algorithms"]],
  ["machine-learning", "Machine Learning", ["ml"]], ["pytorch", "PyTorch", []], ["linux", "Linux", []],
];

export const skillTaxonomy = entries.map(([id, name, aliases]) => ({ id, name, aliases }));
const aliasToSkill = new Map();
for (const skill of skillTaxonomy) {
  [skill.id, skill.name, ...skill.aliases].forEach((alias) => alias.trim() && aliasToSkill.set(alias.trim().toLowerCase(), skill));
}

export function normalizeSkill(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().toLowerCase();
  return aliasToSkill.get(cleaned) ?? null;
}

export function normalizeSkillList(values = []) {
  const unique = new Map();
  (Array.isArray(values) ? values : []).forEach((value) => {
    const skill = normalizeSkill(typeof value === "string" ? value : value?.name ?? value?.skill);
    if (skill && !unique.has(skill.id)) unique.set(skill.id, skill);
  });
  return [...unique.values()];
}

export const proficiencyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
export const proficiencyDescriptions = {
  Beginner: "I can explain the basics and complete guided tasks.",
  Intermediate: "I can build common features independently and debug typical issues.",
  Advanced: "I can design robust solutions and help others solve complex problems.",
  Expert: "I have deep experience shaping standards and solving unfamiliar problems.",
};
export function proficiencyValue(value) {
  const index = proficiencyLevels.findIndex((level) => level.toLowerCase() === String(value ?? "").toLowerCase());
  if (index >= 0) return index + 1;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 4 ? numeric : null;
}
