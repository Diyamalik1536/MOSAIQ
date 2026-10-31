const list = (value) => Array.isArray(value) ? value : [];
const text = (value, max = 4000) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function normalizeStudentProfile(input, uid) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("A student profile is required to calculate a match.");
  if ((input.uid && input.uid !== uid) || (input.studentId && input.studentId !== uid)) {
    const error = new Error("The submitted profile does not belong to the authenticated student.");
    error.code = "PROFILE_UID_MISMATCH";
    throw error;
  }
  const skills = list(input.skills).slice(0, 150).map((item) => typeof item === "string" ? item.trim().slice(0, 100) : ({ name: text(item?.name ?? item?.skill, 100), proficiency: text(item?.proficiency, 40), evidenceType: "self-reported" })).filter((item) => typeof item === "string" ? item.length > 0 : item.name);
  const projects = list(input.projects).slice(0, 100).map((project) => ({ title: text(project?.title, 200), technologies: list(project?.technologies).slice(0, 100).map((value) => text(value, 100)).filter(Boolean), description: text(project?.description) }));
  const experience = list(input.experience).slice(0, 100).map((item) => ({ role: text(item?.role, 200), company: text(item?.company, 200), description: text(item?.description), skills: list(item?.skills).slice(0, 100).map((value) => typeof value === "string" ? value : text(value?.name, 100)).filter(Boolean) }));
  const education = list(input.education).slice(0, 100).map((item) => typeof item === "string" ? text(item, 500) : ({ degree: text(item?.degree ?? item?.qualification, 200), institution: text(item?.institution ?? item?.school ?? item?.university, 200), field: text(item?.field ?? item?.fieldOfStudy ?? item?.branch, 200), year: text(item?.year ?? item?.graduationYear, 40) }));
  const certifications = list(input.certifications).slice(0, 100).map((item) => typeof item === "string" ? text(item, 300) : ({ name: text(item?.name ?? item?.title ?? item?.certification, 300), issuer: text(item?.issuer, 200), date: text(item?.date ?? item?.year, 40) })).filter((item) => typeof item === "string" ? Boolean(item) : item.name);
  return { uid, name: text(input.name, 200), skills, projects, experience, education, certifications, retrievedAt: new Date().toISOString(), source: "authenticated MOSAIQ client profile snapshot" };
}
