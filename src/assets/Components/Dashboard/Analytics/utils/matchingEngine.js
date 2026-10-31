import { normalizeSkill } from "../data/skillTaxonomy.js";

export function calculateWeightedScore(requirements = [], assessments = {}) {
  const unique = new Map();
  for (const req of Array.isArray(requirements) ? requirements : []) {
    if (!req || !normalizeSkill(req.skillId ?? req.skill)) continue;
    const skill = normalizeSkill(req.skillId ?? req.skill);
    const weight = Number(req.weight);
    const requiredLevel = Number(req.requiredLevel);
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isInteger(requiredLevel) || requiredLevel < 1 || requiredLevel > 4) continue;
    unique.set(skill.id, { ...req, skillId: skill.id, weight, requiredLevel });
  }
  const valid = [...unique.values()];
  const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return null;
  const weighted = valid.reduce((sum, item) => {
    const raw = assessments[item.skillId];
    const level = Number.isInteger(raw) && raw >= 1 && raw <= 4 ? raw : null;
    const ratio = level === null ? 0 : Math.min(1, level / item.requiredLevel);
    return sum + item.weight * ratio;
  }, 0);
  return Number((weighted / totalWeight * 100).toFixed(2));
}

export function analyzeRole(role, assessments = {}) {
  const reqs = role?.requirements ?? [];
  const mustHave = reqs.filter((item) => item.type === "must-have");
  const preferred = reqs.filter((item) => item.type === "preferred");
  const overall = calculateWeightedScore(reqs, assessments);
  const mustScore = calculateWeightedScore(mustHave, assessments);
  const preferredScore = calculateWeightedScore(preferred, assessments);
  const requirements = reqs.map((item) => {
    const level = assessments[item.skillId] ?? null;
    const ratio = level === null ? 0 : Math.min(1, level / item.requiredLevel);
    return { ...item, studentLevel: level, ratio, status: level === null ? "Missing" : level < item.requiredLevel ? "Needs Improvement" : level > item.requiredLevel ? "Exceeds Requirement" : "Matched" };
  });
  const matchedSkills = requirements.filter((item) => item.ratio >= 1).map((item) => item.skillId);
  const missingSkills = requirements.filter((item) => item.status === "Missing").map((item) => item.skillId);
  const improvementSkills = requirements.filter((item) => item.status === "Needs Improvement").map((item) => item.skillId);
  return { overall, mustScore, preferredScore, requirements, matchedSkills, missingSkills, improvementSkills };
}
