import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./EducationSection.css";

function EducationSection({ education, onAdd, onDelete }) {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        institution: "",
        degree: "",
        field: "",
        duration: ""
    });

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!form.institution || !form.degree || !form.duration) {
            return;
        }

        onAdd({
            id: Date.now(),
            ...form
        });

        setForm({
            institution: "",
            degree: "",
            field: "",
            duration: ""
        });
    }

    return (
        <section className="education-section">
            <div className="education-header">
                <div>
                    <h2>{t("profile.educationSection.title", "Education")}</h2>
                    <p>{t("profile.educationSection.subtitle", "Add your academic background")}</p>
                </div>

                <div className="education-header-icon">
                    <i className="bi bi-mortarboard-fill"></i>
                </div>
            </div>

            <form className="education-form" onSubmit={handleSubmit}>
                <div className="education-form-row">
                    <div className="education-field">
                        <label>{t("profile.educationSection.institution", "Institution")}</label>
                        <input
                            type="text"
                            name="institution"
                            value={form.institution}
                            placeholder={t("profile.educationSection.institutionPlaceholder", "University or college")}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="education-field">
                        <label>{t("profile.educationSection.degree", "Degree")}</label>
                        <input
                            type="text"
                            name="degree"
                            value={form.degree}
                            placeholder={t("profile.educationSection.degreePlaceholder", "Bachelor of Technology")}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="education-form-row">
                    <div className="education-field">
                        <label>{t("profile.educationSection.field", "Field of Study")}</label>
                        <input
                            type="text"
                            name="field"
                            value={form.field}
                            placeholder={t("profile.educationSection.fieldPlaceholder", "Computer Science & Engineering")}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="education-field">
                        <label>{t("profile.educationSection.duration", "Duration")}</label>
                        <input
                            type="text"
                            name="duration"
                            value={form.duration}
                            placeholder={t("profile.educationSection.durationPlaceholder", "2023 - 2027")}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <button className="education-add-button" type="submit">
                    <i className="bi bi-plus-lg"></i>
                    {t("profile.educationSection.addButton", "Add Education")}
                </button>
            </form>

            <div className="education-list">
                {education.length > 0 ? (
                    education.map((item) => (
                        <article className="education-card" key={item.id}>
                            <div className="education-icon">
                                <i className="bi bi-mortarboard"></i>
                            </div>

                            <div className="education-content">
                                <div className="education-card-top">
                                    <div>
                                        <h3>{item.degree}</h3>
                                        <p>{item.institution}</p>
                                    </div>

                                    <button
                                        className="education-delete"
                                        onClick={() => onDelete(item.id)}
                                        aria-label="Delete education"
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>

                                {item.field && (
                                    <span className="education-field-name">
                                        {item.field}
                                    </span>
                                )}

                                <span className="education-duration">
                                    <i className="bi bi-calendar3"></i>
                                    {item.duration}
                                </span>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="education-empty">
                        <i className="bi bi-mortarboard"></i>
                        <h3>{t("profile.educationSection.emptyTitle", "No education added yet")}</h3>
                        <p>{t("profile.educationSection.emptySubtitle", "Add your academic background to complete your profile.")}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default EducationSection;
