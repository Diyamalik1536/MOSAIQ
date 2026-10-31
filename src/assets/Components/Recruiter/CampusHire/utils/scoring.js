
export const MATCH_WEIGHTS = {
  skillMatch: 35,
  projectRelevance: 25,
  experience: 15,
  mentorEvaluation: 15,
  certifications: 10
};

function getAvailableScore(value, max) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return null;
  }

  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function calculateMatchScore(student, filters = {}, allStudents = []) {
  const skills = Array.isArray(student.skills) ? student.skills : [];
  const projects = Array.isArray(student.projects) ? student.projects : [];

  const maxSkills = Math.max(
    1,
    ...allStudents.map((item) =>
      Array.isArray(item.skills) ? item.skills.length : 0
    )
  );

  const maxProjects = Math.max(
    1,
    ...allStudents.map((item) =>
      Array.isArray(item.projects) ? item.projects.length : 0
    )
  );

  // When recruiter requirements are supplied, use them.
  // Otherwise, compare the number of listed skills fairly.
  const requiredSkills = Array.isArray(filters.skills)
    ? filters.skills
    : [];

  const skillScore = requiredSkills.length
    ? (requiredSkills.filter((skill) => skills.includes(skill)).length /
        requiredSkills.length) *
      100
    : getAvailableScore(skills.length, maxSkills);

  const projectScore = getAvailableScore(projects.length, maxProjects);

  // These values are not present in the current MOSAIQ studentData.
  // Keep them unavailable instead of inventing values.
  const experienceScore = Number.isFinite(student.experienceMonths)
    ? getAvailableScore(student.experienceMonths, 12)
    : null;

  const mentorScore = Number.isFinite(student.mentorRating)
    ? getAvailableScore(student.mentorRating, 5)
    : null;

  const certificationScore = Number.isFinite(student.certifications)
    ? getAvailableScore(student.certifications, 5)
    : null;

  const scores = {
    skillMatch: skillScore,
    projectRelevance: projectScore,
    experience: experienceScore,
    mentorEvaluation: mentorScore,
    certifications: certificationScore
  };

  let weightedTotal = 0;
  let availableWeight = 0;

  Object.entries(scores).forEach(([key, value]) => {
    if (value !== null) {
      const weight = MATCH_WEIGHTS[key];
      weightedTotal += (value * weight) / 100;
      availableWeight += weight;
    }
  });

  const matchScore = availableWeight
    ? Math.round((weightedTotal / availableWeight) * 100)
    : 0;

  const components = {};

  Object.entries(scores).forEach(([key, value]) => {
    components[key] =
      value === null
        ? null
        : Math.round((value * MATCH_WEIGHTS[key] / 100) * 10) / 10;
  });

  return {
    matchScore,
    components,
    department: student.major || "Not provided",
    graduationYear: student.year || "Not provided",
    initials: (student.name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    skills,
    projects,
    interests: Array.isArray(student.interests) ? student.interests : []
  };
}

export function getCandidates(allStudents = [], filters = {}) {
  const safeStudents = Array.isArray(allStudents) ? allStudents : [];

  return safeStudents
    .map((student) => ({
      ...student,
      ...calculateMatchScore(student, filters, safeStudents)
    }))
    .filter(
      (student) =>
        !filters.department ||
        filters.department === "All Departments" ||
        student.department === filters.department
    )
    .filter(
      (student) =>
        !filters.graduationYear ||
        filters.graduationYear === "All Years" ||
        student.graduationYear === filters.graduationYear
    )
    .filter(
      (student) =>
        !filters.college ||
        student.college === filters.college
    )
    .filter(
      (student) =>
        !filters.projectDomain ||
        student.projects.some((project) =>
          `${project.title || ""} ${project.stack || ""}`
            .toLowerCase()
            .includes(String(filters.projectDomain).toLowerCase())
        )
    )
    .filter(
      (student) =>
        student.matchScore >= Number(filters.minMatchScore || 0)
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
        !filters.skillFilter || student.skills.includes(filters.skillFilter)
    )
    .filter(
      (student) =>
        !Number(filters.certification) ||
        (Number.isFinite(student.certifications) &&
          student.certifications >= Number(filters.certification))
    )
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function getMatchDistribution(candidates = []) {
  const buckets = [
    { range: "90–100%", min: 90, max: 100, count: 0 },
    { range: "80–89%", min: 80, max: 89, count: 0 },
    { range: "70–79%", min: 70, max: 79, count: 0 },
    { range: "<70%", min: 0, max: 69, count: 0 }
  ];

  candidates.forEach((student) => {
    const bucket = buckets.find(
      (item) =>
        student.matchScore >= item.min && student.matchScore <= item.max
    );

    if (bucket) bucket.count += 1;
  });

  return buckets;
}
