import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import { downloadResume } from './resumeGenerator';
import { normalizeResumeData } from './resumeData';
import './ResumeBuilder.css';

const templates = [
    {
        id: 'classic',
        name: 'Professional Classic',
        description: 'A structured, ATS-conscious layout with a strong header and clear dividers.',
        accent: '#2c5c69',
    },
    {
        id: 'modern',
        name: 'Modern Minimal',
        description: 'Compact typography, centered identity, and carefully balanced whitespace.',
        accent: '#52627a',
    },
    {
        id: 'developer',
        name: 'Contemporary Professional',
        description: 'Confident section bands and crisp alignment for experience-led applications.',
        accent: '#b4513c',
    },
    {
        id: 'academic',
        name: 'Vibrant Two-Column Portfolio',
        description: 'A color-blocked sidebar for contact and skills beside your project story.',
        accent: '#713e5a',
    },
];

function TemplateThumbnail({ templateId }) {
    if (templateId === 'classic') {
        return (
            <div className="template-thumbnail thumb-classic" aria-hidden="true">
                <div className="thumb-classic-head"><i /><div><b /><span /></div><aside><i /><i /></aside></div>
                <div className="thumb-classic-band" />
                <div className="thumb-lines"><i /><i /><i /></div>
                <div className="thumb-classic-band" />
                <div className="thumb-lines"><i /><i /><i /><i /></div>
                <div className="thumb-classic-band" />
                <div className="thumb-lines thumb-short"><i /><i /><i /></div>
            </div>
        );
    }

    if (templateId === 'modern') {
        return (
            <div className="template-thumbnail thumb-modern" aria-hidden="true">
                <div className="thumb-modern-head"><b /><span /><i /></div>
                <div className="thumb-modern-section"><b /><i /><i /><i /></div>
                <div className="thumb-modern-section"><b /><div className="thumb-modern-skills"><i /><i /><i /><i /><i /><i /></div></div>
                <div className="thumb-modern-section"><b /><i /><i /><i /></div>
            </div>
        );
    }

    if (templateId === 'developer') {
        return (
            <div className="template-thumbnail thumb-contemporary" aria-hidden="true">
                <div className="thumb-contemporary-head"><b /><span /><i /></div>
                <div className="thumb-contemporary-band">SUMMARY</div>
                <div className="thumb-lines"><i /><i /></div>
                <div className="thumb-contemporary-band">EXPERIENCE</div>
                <div className="thumb-lines"><i /><i /><i /></div>
                <div className="thumb-contemporary-band">EDUCATION</div>
                <div className="thumb-lines thumb-short"><i /><i /></div>
            </div>
        );
    }

    return (
        <div className="template-thumbnail thumb-portfolio" aria-hidden="true">
            <div className="thumb-portfolio-banner"><b /><span /></div>
            <div className="thumb-portfolio-layout">
                <aside><i /><i /><i /><i /><i /><i /><i /></aside>
                <div className="thumb-portfolio-main">
                    <b /><i /><i />
                    <b /><i /><i />
                    <b /><i /><i /><i />
                </div>
            </div>
        </div>
    );
}

function readStoredJson(key, fallback) {
    try {
        const savedItem = localStorage.getItem(key);
        if (!savedItem) {
            return fallback;
        }

        const parsed = JSON.parse(savedItem);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
}

function ResumeBuilder() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser, isPro, openUpgradeModal, loading } = useUser();
    const [selectedTemplateId, setSelectedTemplateId] = useState('classic');
    const [showDetail, setShowDetail] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadMessage, setDownloadMessage] = useState('');

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!isPro) {
            openUpgradeModal('Resume Builder');
            navigate('/profile', { replace: true });
        }
    }, [loading, isPro, navigate, openUpgradeModal]);

    const userKey = currentUser?.uid || currentUser?.id || currentUser?.email || 'guest';
    const storedProfile = readStoredJson(`talentforge_profile_${userKey}`, {});
    const storedProjects = readStoredJson(`talentforge_projects_${userKey}`, []);
    const storedEducation = readStoredJson(`talentforge_education_${userKey}`, []);
    const storedExperiences = readStoredJson(`talentforge_experiences_${userKey}`, []);

    const profileData = normalizeResumeData({
        user: currentUser,
        profile: storedProfile,
        projects: storedProjects,
        education: storedEducation,
        experience: storedExperiences,
    });

    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || templates[0];

    const renderEducationSection = (title = 'Education') => profileData.education.length > 0 && (
        <section className="resume-section">
            <h3>{title}</h3>
            {profileData.education.map((item, index) => (
                <div className="resume-item" key={`${item.degree}-${item.field}-${item.institution}-${index}`}>
                    <div className="resume-meta-row">
                        {(item.degree || item.field) && <strong>{[item.degree, item.field].filter(Boolean).join(' - ')}</strong>}
                        {item.period && <span>{item.period}</span>}
                    </div>
                    {item.institution && <span>{item.institution}</span>}
                </div>
            ))}
        </section>
    );

    const renderExperienceSection = (title = 'Experience') => profileData.experience.length > 0 && (
        <section className="resume-section">
            <h3>{title}</h3>
            {profileData.experience.map((item, index) => (
                <div className="resume-item" key={`${item.role}-${item.company}-${index}`}>
                    <div className="resume-meta-row">
                        {item.role && <strong>{item.role}</strong>}
                        {item.period && <span>{item.period}</span>}
                    </div>
                    {item.company && <span>{item.company}</span>}
                    {item.description && <ul className="resume-bullets"><li>{item.description}</li></ul>}
                </div>
            ))}
        </section>
    );

    const renderProjectsSection = (title = 'Projects') => profileData.projects.length > 0 && (
        <section className="resume-section">
            <h3>{title}</h3>
            {profileData.projects.map((project, index) => (
                <div className="resume-item" key={`${project.name}-${project.technologies.join('-')}-${index}`}>
                    <div className="resume-meta-row">
                        {project.name && <strong>{project.name}</strong>}
                        {project.technologies.length > 0 && <span>{project.technologies.join(' · ')}</span>}
                    </div>
                    {project.description && <ul className="resume-bullets"><li>{project.description}</li></ul>}
                    {project.link && <span className="resume-project-link">{project.link}</span>}
                </div>
            ))}
        </section>
    );

    const renderSkillsSection = (title = 'Skills') => profileData.skills.length > 0 && (
        <section className="resume-section">
            <h3>{title}</h3>
            <div className="tag-row">
                {profileData.skills.map((skill, index) => <span key={`${skill}-${index}`}>{skill}</span>)}
            </div>
        </section>
    );

    const renderAchievementsSection = (title = 'Achievements') => profileData.achievements.length > 0 && (
        <section className="resume-section">
            <h3>{title}</h3>
            <ul className="achievement-list">
                {profileData.achievements.map((achievement, index) => <li key={`${achievement}-${index}`}>{achievement}</li>)}
            </ul>
        </section>
    );

    const handleDownload = async () => {
        if (isGenerating) {
            return;
        }

        try {
            setIsGenerating(true);
            setDownloadMessage({ type: 'loading', text: 'Preparing your Word document...' });
            await downloadResume(profileData, selectedTemplateId);
            setDownloadMessage({ type: 'success', text: 'Your resume is ready and the download has started.' });
        } catch (error) {
            console.error('Resume generation failed:', error);
            setDownloadMessage({ type: 'error', text: 'We could not generate the resume. Please try again.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const renderContactDetails = (items, className = 'resume-contact') => items.some(Boolean) && (
        <div className={className}>
            {items.filter(Boolean).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
        </div>
    );

    const renderPreview = (templateId) => {
        const contactItems = [profileData.email, profileData.phone, profileData.location];
        const links = [profileData.linkedin, profileData.github, profileData.portfolio];

        if (templateId === 'classic') {
            return (
                <div className="resume-preview resume-classic">
                    <header className="resume-header classic-header">
                        <div>{profileData.name && <h2>{profileData.name}</h2>}{profileData.title && <p>{profileData.title}</p>}</div>
                        {renderContactDetails(contactItems)}
                    </header>
                    {profileData.about && <section className="resume-section"><h3>Summary</h3><p>{profileData.about}</p></section>}
                    {renderExperienceSection()}
                    {renderProjectsSection('Selected projects')}
                    {renderEducationSection()}
                    {renderSkillsSection()}
                    {renderAchievementsSection('Achievements')}
                </div>
            );
        }

        if (templateId === 'modern') {
            return (
                <div className="resume-preview resume-modern">
                    <header className="modern-header">
                        {profileData.name && <h2>{profileData.name}</h2>}
                        {profileData.title && <p>{profileData.title}</p>}
                        {renderContactDetails([...contactItems, ...links], 'modern-contact')}
                    </header>
                    {profileData.about && <section className="resume-section"><h3>About me</h3><p>{profileData.about}</p></section>}
                    {renderEducationSection()}
                    {renderExperienceSection('Work experience')}
                    {renderProjectsSection('Selected projects')}
                    {renderSkillsSection()}
                    {renderAchievementsSection('Additional information')}
                </div>
            );
        }

        if (templateId === 'developer') {
            return (
                <div className="resume-preview resume-developer">
                    <header className="developer-header">
                        <div>{profileData.name && <h2>{profileData.name}</h2>}{profileData.title && <p>{profileData.title}</p>}</div>
                        {renderContactDetails([...contactItems, ...links], 'developer-links')}
                    </header>
                    {profileData.about && <section className="resume-section"><h3>Summary</h3><p>{profileData.about}</p></section>}
                    {renderSkillsSection('Technical skills')}
                    {renderExperienceSection('Professional experience')}
                    {renderProjectsSection(profileData.experience.length ? 'Selected projects' : 'Projects')}
                    {renderEducationSection()}
                    {renderAchievementsSection('Additional information')}
                </div>
            );
        }

        return (
            <div className="resume-preview resume-academic">
                <header className="academic-header">
                    <div>{profileData.name && <h2>{profileData.name}</h2>}{profileData.title && <p>{profileData.title}</p>}</div>
                </header>
                <div className="portfolio-preview-grid">
                    <aside className="portfolio-preview-sidebar">
                        {renderContactDetails(contactItems.concat(links), 'portfolio-contact')}
                        {renderSkillsSection('Skills')}
                    </aside>
                    <main className="portfolio-preview-main">
                        {profileData.about && <section className="resume-section"><h3>Profile</h3><p>{profileData.about}</p></section>}
                        {renderEducationSection()}
                        {renderProjectsSection()}
                        {renderExperienceSection()}
                        {renderAchievementsSection('Achievements & recognition')}
                    </main>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="resume-builder-page">
                <div className="resume-builder-loading">{t("resume.checkingAccess", "Checking access...")}</div>
            </div>
        );
    }

    if (!isPro) {
        return (
            <div className="resume-builder-page">
                <div className="resume-builder-pro-gate">
                    <i className="bi bi-shield-lock-fill" aria-hidden="true"></i>
                    <h1>Resume Builder</h1>
                    <p>Resume Builder is a Pro feature. Upgrade to access the templates and export tools.</p>
                    <button type="button" className="detail-button primary" onClick={() => openUpgradeModal('Resume Builder')}>
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="resume-builder-page">
            <header className="resume-builder-header">
                <div className="resume-builder-heading">
                    <p className="resume-builder-kicker"><span className="kicker-mark" />TALENTFORGE / CAREER TOOLS</p>
                    <h1>Resume Builder</h1>
                    <p className="resume-builder-subtitle">Choose a design. Your saved profile becomes a polished, editable Word resume.</p>
                    <p className="resume-data-note"><i className="bi bi-arrow-repeat" aria-hidden="true" /> {t("resume.dataNote", "Your profile, education, experience, and projects are used automatically.")}</p>
                </div>
                <span className="resume-builder-badge"><i className="bi bi-stars" aria-hidden="true" /> PRO WORKSPACE</span>
            </header>

            {!showDetail ? (
                <>
                    <div className="gallery-intro">
                        <div>
                            <p className="gallery-step">01 <span>/</span> SELECT A DESIGN</p>
                            <h2>{t("resume.startWithLayout", "Start with a layout")}</h2>
                        </div>
                        <p className="gallery-count">{templates.length} templates <span>·</span> Word export</p>
                    </div>
                    <section className="template-gallery" aria-label="Resume templates">
                        {templates.map((template, index) => (
                            <article
                                key={template.id}
                                className={`template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
                                style={{ '--template-accent': template.accent }}
                            >
                                <div className={`template-preview template-preview-${template.id}`}>
                                    <span className="template-index">0{index + 1}</span>
                                    <TemplateThumbnail templateId={template.id} />
                                </div>
                                <div className="template-card-body">
                                    <div className="template-card-heading">
                                        <span className="template-card-category">TEMPLATE 0{index + 1}</span>
                                        {selectedTemplateId === template.id && <span className="template-selected"><i className="bi bi-check2" aria-hidden="true" /> Selected</span>}
                                    </div>
                                    <h3>{template.name}</h3>
                                    <p>{template.description}</p>
                                    <button
                                        type="button"
                                        className="template-action"
                                        onClick={() => {
                                            setSelectedTemplateId(template.id);
                                            setShowDetail(true);
                                        }}
                                        aria-label={`Preview ${template.name} template`}
                                    >
                                        Preview template <i className="bi bi-arrow-up-right" aria-hidden="true" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                </>
            ) : (
                <section className="template-detail" aria-live="polite">
                    <div className="detail-toolbar">
                        <button type="button" className="detail-button secondary" onClick={() => setShowDetail(false)}>
                            <i className="bi bi-arrow-left" aria-hidden="true" /> Back to templates
                        </button>
                        <span className="detail-selection"><i className="bi bi-check-circle-fill" aria-hidden="true" /> {selectedTemplate.name}</span>
                        <button
                            type="button"
                            className="detail-button primary"
                            onClick={handleDownload}
                            disabled={isGenerating}
                            aria-busy={isGenerating}
                        >
                            {isGenerating ? <><i className="bi bi-arrow-repeat button-spinner" aria-hidden="true" /> Generating resume...</> : <><i className="bi bi-file-earmark-word" aria-hidden="true" /> Download Word resume</>}
                        </button>
                    </div>

                    {downloadMessage && (
                        <div className={`download-status download-${downloadMessage.type}`} role="status" aria-live="polite">
                            <i className={`bi ${downloadMessage.type === 'loading' ? 'bi-arrow-repeat button-spinner' : downloadMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`} aria-hidden="true" />
                            {downloadMessage.text}
                        </div>
                    )}

                    <div className="detail-preview-panel">
                        <div className="preview-header-row">
                            <div>
                                <p className="preview-label">LIVE PREVIEW</p>
                                <h2>{selectedTemplate.name}</h2>
                            </div>
                            <span className="preview-data-label"><i className="bi bi-person-check" aria-hidden="true" /> Using your saved profile</span>
                        </div>

                        {!profileData.name && !profileData.email && !profileData.phone && !profileData.location && !profileData.about && !profileData.skills.length && !profileData.education.length && !profileData.experience.length && !profileData.projects.length && !profileData.achievements.length && (
                            <div className="resume-empty-profile" role="note">
                                <i className="bi bi-file-earmark-person" aria-hidden="true" />
                                <div><strong>Your resume starts with your profile.</strong><span>Add your details, education, skills, experience, or projects to see them here.</span></div>
                                <button type="button" onClick={() => navigate('/profile')}>Edit profile <i className="bi bi-arrow-up-right" aria-hidden="true" /></button>
                            </div>
                        )}

                        {renderPreview(selectedTemplate.id)}
                    </div>
                </section>
            )}
        </div>
    );
}

export default ResumeBuilder;
