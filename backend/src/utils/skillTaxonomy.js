const entries = [
  ["javascript", "JavaScript", ["js", "javascript es6"]], ["typescript", "TypeScript", ["ts"]],
  ["react", "React", ["reactjs", "react.js"]], ["node.js", "Node.js", ["nodejs"]],
  ["html", "HTML", ["html5"]], ["css", "CSS", ["css3"]], ["python", "Python", ["py"]],
  ["java", "Java", []], ["c", "C", []], ["c++", "C++", ["cpp"]], ["go", "Go", ["golang"]],
  ["kotlin", "Kotlin", []], ["sql", "SQL", ["standard sql", "googlesql"]],
  ["data structures", "Data Structures", ["data structure"]], ["algorithms", "Algorithms", ["algorithm"]],
  ["distributed systems", "Distributed Systems", ["distributed system"]], ["machine learning", "Machine Learning", ["ml"]],
  ["systems design", "Systems Design", ["software design and architecture"]], ["debugging", "Debugging", ["debug"]],
  ["accessibility", "Accessibility", ["accessible technologies"]],
];
const aliases = new Map();
for (const [id, name, other] of entries) for (const value of [id, name, ...other]) aliases.set(value.toLowerCase(), { id, name });

export function normalizeSkill(value) {
  if (typeof value !== "string") return null;
  return aliases.get(value.trim().toLowerCase()) ?? null;
}

export function extractSkills(text) {
  const found = new Map();
  for (const [id, name, other] of entries) {
    for (const term of [name, ...other]) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(^|[^a-z0-9+#])${escaped}($|[^a-z0-9+#])`, "i");
      if (pattern.test(text)) { found.set(id, { id, name }); break; }
    }
  }
  return [...found.values()];
}
