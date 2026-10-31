import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./SkillsSection.css";

function SkillsSection({ skills, onAddSkill, onRemoveSkill }) {
    const { t } = useTranslation();
    const [skillInput, setSkillInput] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        const skill = skillInput.trim();

        if (!skill) {
            return;
        }

        onAddSkill(skill);
        setSkillInput("");
    }

    return (
        <section className="skills-section">
            <div className="skills-section-header">
                <div>
                    <h2>
                        {t("profile.skillsSection.title", "Skills")}
                    </h2>
                    <p>{t("profile.skillsSection.subtitle", "Showcase what you can do")}</p>
                </div>
                <div className="skills-section-icon">
                    <i className="bi bi-lightning-charge-fill"></i>
                </div>
            </div>

            <form className="skills-add-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={skillInput}
                    placeholder={t("profile.skillsSection.placeholder", "Add a skill...")}
                    onChange={(e) => setSkillInput(e.target.value)}
                />
                <button type="submit">
                    <i className="bi bi-plus-lg"></i>
                    {t("profile.skillsSection.addButton", "Add Skill")}
                </button>
            </form>

            <div className="skills-list">
                {skills.length > 0 ? (
                    skills.map((skill, index) => (
                        <div className="skill-item" key={`${skill}-${index}`}>
                            <span>{skill}</span>
                            <button
                                type="button"
                                onClick={() => onRemoveSkill(skill)}
                                aria-label="Remove skill"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="skills-empty">
                        <i className="bi bi-lightning"></i>
                        <p>{t("profile.skillsSection.empty", "No skills added yet.")}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default SkillsSection;
