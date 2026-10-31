function toText(value) {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return '';
    }

    return String(value).trim();
}

function firstText(...values) {
    for (const value of values) {
        const text = toText(value);
        if (text) {
            return text;
        }
    }

    return '';
}

function toTextList(value) {
    const values = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(/[,\u2022]/)
            : [];

    return values.map(toText).filter(Boolean);
}

function firstTextList(...values) {
    for (const value of values) {
        const items = toTextList(value);
        if (items.length > 0) {
            return items;
        }
    }

    return [];
}

function normalizeEducation(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            degree: firstText(item.degree),
            field: firstText(item.field),
            institution: firstText(item.institution),
            period: firstText(item.duration, item.period),
        }))
        .filter((item) => item.degree || item.field || item.institution || item.period);
}

function normalizeExperience(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            role: firstText(item.role, item.position),
            company: firstText(item.company, item.organization),
            period: firstText(item.duration, item.period),
            description: firstText(item.description),
        }))
        .filter((item) => item.role || item.company || item.period || item.description);
}

function normalizeProjects(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((project) => project && typeof project === 'object')
        .map((project) => ({
            name: firstText(project.title, project.name),
            technologies: firstTextList(project.technologies, project.stack, project.tech),
            description: firstText(project.description),
            link: firstText(project.link),
        }))
        .filter((project) => project.name || project.technologies.length || project.description || project.link);
}

export function normalizeResumeData(source = {}) {
    const {
        user = {},
        profile = {},
        projects = [],
        education = [],
        experience = [],
    } = source && typeof source === 'object' ? source : {};

    return {
        name: firstText(user.fullName, user.name, user.displayName, profile.fullName, profile.name),
        title: firstText(profile.role, user.role),
        email: firstText(user.email, profile.email),
        phone: firstText(user.phone, profile.phone),
        location: firstText(profile.location, user.location),
        linkedin: firstText(profile.linkedin, user.linkedin),
        github: firstText(profile.github, user.github),
        portfolio: firstText(profile.portfolio, user.portfolio),
        about: firstText(profile.about, user.about, profile.headline, user.headline),
        skills: firstTextList(profile.skills, user.skills),
        education: normalizeEducation(education),
        experience: normalizeExperience(experience),
        projects: normalizeProjects(projects),
        achievements: firstTextList(profile.achievements, user.achievements),
    };
}