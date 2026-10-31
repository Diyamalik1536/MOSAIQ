import { studentData } from "../BrowseStudents/studentData";

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function asText(value) {
    return typeof value === "string" ? value : String(value || "");
}

function getProfileProjects() {
    try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const userKey = storedUser?.uid || storedUser?.email || "guest";
        const savedProjects = JSON.parse(
            localStorage.getItem(`talentforge_projects_${userKey}`) || "[]"
        );
        return asArray(savedProjects).map((project) => ({
            ...project,
            owner: storedUser?.name || "My Profile",
            ownerId: storedUser?.uid || storedUser?.email || "guest"
        }));
    } catch {
        return [];
    }
}

function studentSearchText(student) {
    return [
        student?.name,
        student?.role,
        student?.major,
        student?.college,
        student?.university,
        student?.year,
        student?.headline,
        student?.bio,
        student?.lookingFor,
        ...asArray(student?.skills),
        ...asArray(student?.interests),
        ...asArray(student?.projects).flatMap((project) => [project?.title, project?.stack])
    ].map(asText).join(" ").toLowerCase();
}

function projectSearchText(project) {
    return [
        project?.title,
        project?.name,
        project?.description,
        ...asArray(project?.technologies),
        project?.stack
    ].map(asText).join(" ").toLowerCase();
}

export function getGlobalSearchResults(value) {
    const query = asText(value).trim().toLowerCase();
    if (!query) {
        return { query: "", students: [], projects: [], skills: [] };
    }

    const students = asArray(studentData)
        .filter((student) => studentSearchText(student).includes(query))
        .map((student) => ({
            id: student.id,
            name: student.name || "Unnamed student",
            subtitle: student.major || student.role || student.headline || "TalentForge student",
            details: asArray(student.skills).join(", "),
            student
        }));

    const projects = [
        ...asArray(studentData).flatMap((student) =>
            asArray(student.projects).map((project, index) => ({
                ...project,
                id: project?.id || `${student.id}-project-${index}`,
                owner: student.name,
                ownerId: student.id,
                technologies: asArray(project?.technologies).length
                    ? project.technologies
                    : asText(project?.stack).split("+").map((item) => item.trim()).filter(Boolean)
            }))
        ),
        ...getProfileProjects()
    ]
        .filter((project) => projectSearchText(project).includes(query))
        .filter((project, index, list) => list.findIndex((item) => item.id === project.id) === index)
        .map((project) => ({
            id: project.id,
            name: project.title || project.name || "Untitled project",
            subtitle: project.description || `By ${project.owner || "TalentForge member"}`,
            details: asArray(project.technologies).join(" · "),
            project
        }));

    const skills = [...new Set(asArray(studentData).flatMap((student) => asArray(student.skills)))]
        .filter((skill) => asText(skill).toLowerCase().includes(query))
        .map((skill) => ({ id: skill, name: skill }));

    return { query, students, projects, skills };
}

export function hasSearchResults(results) {
    return results.students.length + results.projects.length + results.skills.length > 0;
}