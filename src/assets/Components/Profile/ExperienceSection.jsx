import "./ExperienceSection.css";
import { useTranslation } from "react-i18next";

function ExperienceSection({ experiences, onAdd, onDelete }) {
    const { t } = useTranslation();

    return (
        <section className="experience-section">
            <div className="experience-header">
                <div>
                    <h2>{t("profile.experienceSection.title", "Experience")}</h2>
                    <p>{t("profile.experienceSection.subtitle", "Your professional and project experience")}</p>
                </div>

                <button
                    className="add-experience-button"
                    onClick={onAdd}
                >
                    <i className="bi bi-plus-lg"></i>
                    {t("profile.experienceSection.addButton", "Add Experience")}
                </button>
            </div>

            {experiences.length > 0 ? (
                <div className="experience-list">
                    {experiences.map((experience) => (
                        <article
                            className="experience-card"
                            key={experience.id}
                        >
                            <div className="experience-icon">
                                <i className="bi bi-briefcase-fill"></i>
                            </div>

                            <div className="experience-content">
                                <div className="experience-top">
                                    <div>
                                        <h3>{experience.role}</h3>
                                        <p>{experience.company}</p>
                                    </div>

                                    <button
                                        className="delete-experience-button"
                                        onClick={() =>
                                            onDelete(experience.id)
                                        }
                                        aria-label="Delete experience"
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>

                                <span className="experience-duration">
                                    <i className="bi bi-calendar3"></i>
                                    {experience.duration}
                                </span>

                                {experience.description && (
                                    <p className="experience-description">
                                        {experience.description}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="experience-empty">
                    <div className="experience-empty-icon">
                        <i className="bi bi-briefcase"></i>
                    </div>

                    <h3>{t("profile.experienceSection.emptyTitle", "No experience added yet")}</h3>

                    <p>
                        {t("profile.experienceSection.emptySubtitle", "Add your internships, freelance work, and roles.")}
                    </p>

                    <button
                        className="experience-empty-button"
                        onClick={onAdd}
                    >
                        <i className="bi bi-plus-lg"></i>
                        {t("profile.experienceSection.addButton", "Add Experience")}
                    </button>
                </div>
            )}
        </section>
    );
}

export default ExperienceSection;
