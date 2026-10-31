import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
    ShadingType,
    TableLayoutType,
    VerticalAlign,
} from 'docx';

const templateNames = {
    classic: 'Professional Classic',
    modern: 'Modern Minimal',
    developer: 'Contemporary Professional',
    academic: 'Vibrant Two-Column Portfolio',
};

const colors = {
    ink: '263237',
    muted: '5E6B6F',
    rule: 'CFD8D5',
    teal: '28666A',
    coral: 'B4513C',
    plum: '713E5A',
    palePlum: 'F1EAF0',
    paleGray: 'E7E9E7',
    white: 'FFFFFF',
};

const noTableBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

function sanitizeName(value) {
    const cleaned = (value || 'MOSAIQ')
        .replace(/[^a-zA-Z0-9 _-]/g, '')
        .trim();

    return cleaned || 'MOSAIQ';
}

function buildResumeFilename(name) {
    const safeName = sanitizeName(name).replace(/\s+/g, '_');
    return `MOSAIQ_Resume_${safeName}.docx`;
}

function createParagraph(text, options = {}) {
    const {
        bold = false,
        italic = false,
        size = 20,
        color = colors.ink,
        alignment,
        spacingAfter = 90,
        spacingBefore = 0,
        font = 'Aptos',
    } = options;

    return new Paragraph({
        alignment,
        spacing: { before: spacingBefore, after: spacingAfter, line: 260 },
        children: [
            new TextRun({
                text,
                bold,
                italics: italic,
                size,
                color,
                font,
            }),
        ],
    });
}

function createSectionHeading(text, style = 'classic') {
    if (style === 'contemporary') {
        return new Paragraph({
            shading: { type: ShadingType.CLEAR, fill: colors.paleGray },
            indent: { left: 110 },
            spacing: { before: 170, after: 90 },
            children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 20, color: '48565A', font: 'Aptos' })],
        });
    }

    if (style === 'sidebar') {
        return new Paragraph({
            border: { bottom: { color: 'B89FAE', space: 4, style: BorderStyle.SINGLE, size: 4 } },
            spacing: { before: 150, after: 75 },
            children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 19, color: colors.white, font: 'Aptos' })],
        });
    }

    if (style === 'portfolio') {
        return new Paragraph({
            border: { bottom: { color: 'C9B5C1', space: 4, style: BorderStyle.SINGLE, size: 4 } },
            spacing: { before: 150, after: 75 },
            children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 20, color: colors.plum, font: 'Aptos' })],
        });
    }

    return new Paragraph({
        spacing: { before: style === 'minimal' ? 145 : 190, after: 85 },
        border: {
            bottom: {
                color: style === 'minimal' ? 'DDE2E1' : colors.rule,
                space: 4,
                style: BorderStyle.SINGLE,
                size: style === 'minimal' ? 3 : 5,
            },
        },
        children: [
            new TextRun({
                text: text.toUpperCase(),
                bold: true,
                size: style === 'minimal' ? 18 : 21,
                color: style === 'minimal' ? '404B50' : colors.teal,
                font: 'Aptos',
            }),
        ],
    });
}

function createInfoLine(entries, options = {}) {
    const validEntries = entries.filter(Boolean);
    if (validEntries.length === 0) {
        return null;
    }

    return createParagraph(validEntries.join('  |  '), {
        size: options.size || 17,
        color: options.color || colors.muted,
        alignment: options.alignment,
        spacingAfter: options.spacingAfter ?? 130,
    });
}

function createBulletedList(items, options = {}) {
    return items.map((item) => new Paragraph({
        bullet: { level: 0 },
        indent: { left: options.indent || 320, hanging: options.hanging || 160 },
        spacing: { after: options.spacingAfter || 65, line: 250 },
        children: [
            new TextRun({ text: item, size: options.size || 19, color: options.color || colors.ink, font: 'Aptos' }),
        ],
    }));
}

function createIdentity(profile, options = {}) {
    const {
        nameSize = 44,
        nameColor = colors.ink,
        titleSize = 22,
        titleColor = colors.muted,
        alignment = AlignmentType.LEFT,
    } = options;
    const paragraphs = [];

    if (profile.name) {
        paragraphs.push(new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment,
            spacing: { after: 55 },
            children: [new TextRun({ text: profile.name, bold: true, size: nameSize, color: nameColor, font: 'Aptos Display' })],
        }));
    }

    if (profile.title) {
        paragraphs.push(createParagraph(profile.title, {
            alignment,
            size: titleSize,
            color: titleColor,
            spacingAfter: 100,
        }));
    }

    return paragraphs;
}

function educationHeading(item) {
    const qualification = [item.degree, item.field].filter(Boolean).join(' - ');
    return [qualification, item.institution].filter(Boolean).join('  |  ');
}

function createEntry(title, subtitle, period, options = {}) {
    const paragraphs = [];
    const heading = [title, subtitle].filter(Boolean).join('  |  ');

    if (heading) {
        paragraphs.push(createParagraph(heading, {
            bold: true,
            size: options.headingSize || 20,
            color: options.headingColor || colors.ink,
            spacingAfter: period ? 30 : 50,
        }));
    }

    if (period) {
        paragraphs.push(createParagraph(period, {
            size: 17,
            color: options.periodColor || colors.muted,
            italic: options.italicPeriod || false,
            spacingAfter: 55,
        }));
    }

    return paragraphs;
}

function createDescription(text, options = {}) {
    if (!text) {
        return [];
    }

    return createBulletedList([text], options);
}

function createSkills(profile, options = {}) {
    if (!profile.skills.length) {
        return [];
    }

    return [createParagraph(profile.skills.join(options.separator || '  ·  '), {
        size: options.size || 19,
        color: options.color || colors.ink,
        spacingAfter: options.spacingAfter ?? 100,
    })];
}

function createDocument(children, options = {}) {
    return new Document({
        sections: [{
            properties: {
                page: {
                    size: { width: 12240, height: 15840 },
                    margin: options.margin || { top: 650, right: 720, bottom: 650, left: 720 },
                },
            },
            children: children.filter(Boolean),
        }],
    });
}

function addExperienceSection(children, profile, title, style = 'classic') {
    if (!profile.experience.length) {
        return;
    }

    children.push(createSectionHeading(title, style));
    profile.experience.forEach((item) => {
        children.push(...createEntry(item.role, item.company, item.period));
        children.push(...createDescription(item.description));
    });
}

function addProjectSection(children, profile, title, style = 'classic') {
    if (!profile.projects.length) {
        return;
    }

    children.push(createSectionHeading(title, style));
    profile.projects.forEach((project) => {
        children.push(...createEntry(project.name, project.technologies.join(' · '), ''));
        children.push(...createDescription(project.description));
        if (project.link) {
            children.push(createParagraph(project.link, { size: 16, color: colors.teal, spacingAfter: 80 }));
        }
    });
}

function addEducationSection(children, profile, title = 'Education', style = 'classic') {
    if (!profile.education.length) {
        return;
    }

    children.push(createSectionHeading(title, style));
    profile.education.forEach((item) => {
        children.push(...createEntry(educationHeading(item), '', item.period));
    });
}

function addAchievementSection(children, profile, title = 'Additional information', style = 'classic', options = {}) {
    if (!profile.achievements.length) {
        return;
    }

    children.push(createSectionHeading(title, style));
    children.push(...createBulletedList(profile.achievements, options));
}

function createClassicDocument(profile) {
    const children = [
        ...createIdentity(profile, { nameSize: 48, nameColor: '1F3439' }),
        createInfoLine([profile.email, profile.phone, profile.location]),
    ];

    if (profile.about) {
        children.push(createSectionHeading('Summary'));
        children.push(createParagraph(profile.about, { size: 20, spacingAfter: 100 }));
    }

    addExperienceSection(children, profile, 'Experience');
    addProjectSection(children, profile, 'Selected projects');
    addEducationSection(children, profile);

    if (profile.skills.length) {
        children.push(createSectionHeading('Skills'));
        children.push(...createSkills(profile));
    }

    addAchievementSection(children, profile, 'Achievements');
    return createDocument(children);
}

function createModernDocument(profile) {
    const children = [
        ...createIdentity(profile, {
            nameSize: 46,
            nameColor: '303C40',
            titleSize: 20,
            alignment: AlignmentType.CENTER,
        }),
        createInfoLine(
            [profile.email, profile.phone, profile.location, profile.linkedin, profile.github, profile.portfolio],
            { alignment: AlignmentType.CENTER, size: 16, spacingAfter: 150 }
        ),
    ];

    if (profile.about) {
        children.push(createSectionHeading('About me', 'minimal'));
        children.push(createParagraph(profile.about, { size: 19, spacingAfter: 90 }));
    }

    addEducationSection(children, profile, 'Education', 'minimal');
    addExperienceSection(children, profile, 'Work experience', 'minimal');
    addProjectSection(children, profile, 'Selected projects', 'minimal');

    if (profile.skills.length) {
        children.push(createSectionHeading('Skills', 'minimal'));
        children.push(...createSkills(profile, { size: 18, separator: '   ·   ' }));
    }

    addAchievementSection(children, profile, 'Additional information', 'minimal');
    return createDocument(children);
}

function createDeveloperDocument(profile) {
    const children = [
        ...createIdentity(profile, { nameSize: 46, nameColor: '263237', titleColor: colors.coral }),
        createInfoLine([profile.email, profile.phone, profile.location, profile.linkedin, profile.github, profile.portfolio], { size: 16 }),
    ];

    if (profile.about) {
        children.push(createSectionHeading('Summary', 'contemporary'));
        children.push(createParagraph(profile.about, { size: 19, spacingAfter: 80 }));
    }

    if (profile.skills.length) {
        children.push(createSectionHeading('Technical skills', 'contemporary'));
        children.push(...createSkills(profile, { separator: '   ·   ', size: 19 }));
    }

    addExperienceSection(children, profile, profile.experience.length ? 'Professional experience' : 'Relevant projects', 'contemporary');
    if (!profile.experience.length) {
        addProjectSection(children, profile, 'Projects', 'contemporary');
    } else {
        addProjectSection(children, profile, 'Selected projects', 'contemporary');
    }
    addEducationSection(children, profile, 'Education', 'contemporary');
    addAchievementSection(children, profile, 'Additional information', 'contemporary');

    return createDocument(children);
}

function createAcademicDocument(profile) {
    const contactItems = [
        profile.email && `Email: ${profile.email}`,
        profile.phone && `Phone: ${profile.phone}`,
        profile.location && `Location: ${profile.location}`,
        profile.linkedin && `LinkedIn: ${profile.linkedin}`,
        profile.github && `GitHub: ${profile.github}`,
        profile.portfolio && `Portfolio: ${profile.portfolio}`,
    ].filter(Boolean);
    const sidebarChildren = [];
    const mainChildren = [];

    if (contactItems.length) {
        sidebarChildren.push(createSectionHeading('Contact', 'sidebar'));
        contactItems.forEach((item) => sidebarChildren.push(createParagraph(item, {
            size: 16,
            color: colors.white,
            spacingAfter: 65,
        })));
    }

    if (profile.skills.length) {
        sidebarChildren.push(createSectionHeading('Skills', 'sidebar'));
        sidebarChildren.push(...createBulletedList(profile.skills, {
            size: 17,
            color: colors.white,
            spacingAfter: 45,
            indent: 240,
            hanging: 120,
        }));
    }

    if (!sidebarChildren.length) {
        sidebarChildren.push(createParagraph('', { size: 16, spacingAfter: 0 }));
    }

    if (profile.about) {
        mainChildren.push(createSectionHeading('Profile', 'portfolio'));
        mainChildren.push(createParagraph(profile.about, { size: 19, spacingAfter: 100 }));
    }

    addEducationSection(mainChildren, profile, 'Education', 'portfolio');
    addProjectSection(mainChildren, profile, 'Projects', 'portfolio');
    addExperienceSection(mainChildren, profile, 'Experience', 'portfolio');
    addAchievementSection(mainChildren, profile, 'Achievements & recognition', 'portfolio');

    if (!mainChildren.length) {
        mainChildren.push(createParagraph('', { size: 18, spacingAfter: 0 }));
    }

    const headerRuns = [];
    if (profile.name) {
        headerRuns.push(new TextRun({ text: profile.name, bold: true, size: 42, color: colors.white, font: 'Aptos Display', break: 1 }));
    }
    if (profile.title) {
        headerRuns.push(new TextRun({ text: profile.title.toUpperCase(), size: 19, color: 'E7D9E1', font: 'Aptos', break: 1 }));
    }

    const children = [
        new Paragraph({
            shading: { type: ShadingType.CLEAR, fill: colors.plum },
            indent: { left: 220, right: 220 },
            spacing: { before: 0, after: 0 },
            children: headerRuns.length ? headerRuns : [new TextRun({ text: '', size: 20 })],
        }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [3600, 7200],
            layout: TableLayoutType.FIXED,
            borders: noTableBorders,
            rows: [new TableRow({
                children: [
                    new TableCell({
                        children: sidebarChildren,
                        width: { size: 34, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: colors.plum },
                        margins: { top: 180, bottom: 180, left: 190, right: 170 },
                        borders: noTableBorders,
                        verticalAlign: VerticalAlign.TOP,
                    }),
                    new TableCell({
                        children: mainChildren,
                        width: { size: 66, type: WidthType.PERCENTAGE },
                        shading: { type: ShadingType.CLEAR, fill: colors.white },
                        margins: { top: 170, bottom: 120, left: 250, right: 80 },
                        borders: noTableBorders,
                        verticalAlign: VerticalAlign.TOP,
                    }),
                ],
            })],
        }),
    ];

    return createDocument(children, { margin: { top: 500, right: 500, bottom: 500, left: 500 } });
}

const documentBuilders = {
    classic: createClassicDocument,
    modern: createModernDocument,
    developer: createDeveloperDocument,
    academic: createAcademicDocument,
};

export async function generateResumeDocument(profileData, templateId = 'classic') {
    const selectedTemplate = templateNames[templateId] ? templateId : 'classic';
    const document = (documentBuilders[selectedTemplate] || documentBuilders.classic)(profileData || {});
    return Packer.toBlob(document);
}

export async function downloadResume(profileData, templateId = 'classic') {
    const resumeData = profileData || {};
    const blob = await generateResumeDocument(resumeData, templateId);
    const fileSaver = await import('file-saver');
    const saveAs = fileSaver.saveAs || fileSaver.default?.saveAs || fileSaver.default;
    saveAs(blob, buildResumeFilename(resumeData.name));
    return blob;
}

export { buildResumeFilename, templateNames };
