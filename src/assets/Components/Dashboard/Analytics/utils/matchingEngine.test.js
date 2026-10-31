import test from "node:test";
import assert from "node:assert/strict";
import { analyzeRole, calculateWeightedScore } from "./matchingEngine.js";

test("computes the specified weighted score of 61.11%", () => {
  const requirements = [
    { skillId: "JavaScript", requiredLevel: 2, weight: 3, type: "must-have" },
    { skillId: "React", requiredLevel: 2, weight: 3, type: "must-have" },
    { skillId: "HTML", requiredLevel: 1, weight: 1, type: "preferred" },
    { skillId: "SQL", requiredLevel: 2, weight: 2, type: "preferred" },
  ];
  assert.equal(calculateWeightedScore(requirements, { javascript: 3, react: 1, html: 2 }), 61.11);
});

test("handles perfect, zero, partial and missing proficiency", () => {
  const requirement = [{ skillId: "JavaScript", requiredLevel: 2, weight: 2 }];
  assert.equal(calculateWeightedScore(requirement, { javascript: 2 }), 100);
  assert.equal(calculateWeightedScore(requirement, { javascript: 1 }), 50);
  assert.equal(calculateWeightedScore(requirement, {}), 0);
  assert.equal(calculateWeightedScore(requirement, { javascript: 4 }), 100);
});

test("normalizes aliases and ignores duplicate requirements", () => {
  assert.equal(calculateWeightedScore([
    { skillId: "JS", requiredLevel: 2, weight: 1 },
    { skillId: "JavaScript ES6", requiredLevel: 2, weight: 1 },
  ], { javascript: 2 }), 100);
});

test("separates must-have and preferred scores and handles invalid input", () => {
  const result = analyzeRole({ requirements: [
    { skillId: "React", requiredLevel: 2, weight: 2, type: "must-have" },
    { skillId: "SQL", requiredLevel: 2, weight: 2, type: "preferred" },
  ] }, { react: 1 });
  assert.equal(result.mustScore, 50);
  assert.equal(result.preferredScore, 0);
  assert.equal(calculateWeightedScore([], {}), null);
  assert.equal(calculateWeightedScore([{ skillId: "React", requiredLevel: 2, weight: 0 }], {}), null);
  assert.equal(calculateWeightedScore([{ skillId: "React", requiredLevel: 9, weight: 1 }], {}), null);
  assert.equal(calculateWeightedScore([{ skillId: "React", requiredLevel: 2, weight: 1 }], { react: 9 }), 0);
});
