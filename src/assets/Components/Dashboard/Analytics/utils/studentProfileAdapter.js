const asArray = (value) => Array.isArray(value) ? value : [];
function readJson(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; }
}

export function getStudentProfile(user) {
  const uid = typeof user?.uid === "string" ? user.uid : null;
  const profile = { ...(uid ? user : {}), ...(uid ? readJson(`talentforge_profile_${uid}`, {}) : {}) };
  return {
    studentId: uid,
    name: profile.fullName || profile.name || profile.displayName || "Student",
    email: profile.email || "", university: profile.university || profile.college || "",
    degree: profile.degree || profile.role || "", branch: profile.branch || "",
    academicYear: profile.year || "", graduationYear: profile.graduationYear || "",
    location: profile.location || "", headline: profile.headline || "", about: profile.about || "",
    skills: asArray(profile.skills).map((skill) => typeof skill === "string" ? skill : ({ name: skill?.name || skill?.skill, proficiency: skill?.proficiency || null })).filter((skill) => typeof skill === "string" ? Boolean(skill) : Boolean(skill.name)),
    projects: asArray(uid ? readJson(`talentforge_projects_${uid}`, []) : []).map((project) => {
      const sourceSkills = project.technologies || project.techStack || project.stack || [];
      const technologies = Array.isArray(sourceSkills) ? sourceSkills : typeof sourceSkills === "string" ? sourceSkills.split(",").map((item) => item.trim()).filter(Boolean) : [];
      return { ...project, technologies };
    }),
    education: asArray(uid ? readJson(`talentforge_education_${uid}`, []) : []),
    experience: asArray(uid ? readJson(`talentforge_experiences_${uid}`, []) : []),
    certifications: asArray(profile.certifications),
  };
}

export function calculateProfileCompleteness(profile) {
  const checks = [profile.name !== "Student", Boolean(profile.headline), Boolean(profile.university), Boolean(profile.degree), profile.skills.length > 0, profile.projects.length > 0, profile.education.length > 0, profile.experience.length > 0];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}
