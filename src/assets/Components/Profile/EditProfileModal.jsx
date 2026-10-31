import { useTranslation } from "react-i18next";
import "./EditProfileModal.css";

function EditProfileModal({
    profile,
    skillsInput,
    interestsInput,
    onChange,
    onSkillsChange,
    onInterestsChange,
    onSave,
    onClose
}) {
    const { t } = useTranslation();

    return (
        <div className="edit-profile-overlay" onClick={onClose}>
            <div
                className="edit-profile-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="edit-profile-header">
                    <div>
                        <h2>{t("profile.editModal.title", "Edit Profile")}</h2>
                        <p>{t("profile.editModal.subtitle", "Update your MOSAIQ profile")}</p>
                    </div>

                    <button
                        className="edit-profile-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="edit-profile-body">
                    <div className="edit-profile-row">
                        <div className="edit-profile-field">
                            <label>{t("profile.editModal.roleLabel", "Role")}</label>
                            <input
                                type="text"
                                value={profile.role}
                                placeholder={t("profile.editModal.rolePlaceholder", "Software Developer")}
                                onChange={(e) =>
                                    onChange("role", e.target.value)
                                }
                            />
                        </div>

                        <div className="edit-profile-field">
                            <label>{t("profile.editModal.yearLabel", "Year")}</label>
                            <input
                                type="text"
                                value={profile.year}
                                placeholder={t("profile.editModal.yearPlaceholder", "2nd Year")}
                                onChange={(e) =>
                                    onChange("year", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="edit-profile-field">
                        <label>{t("profile.editModal.universityLabel", "University")}</label>
                        <input
                            type="text"
                            value={profile.university}
                            placeholder={t("profile.editModal.universityPlaceholder", "Enter your university")}
                            onChange={(e) =>
                                onChange("university", e.target.value)
                            }
                        />
                    </div>

                    <div className="edit-profile-field">
                        <label>{t("profile.editModal.locationLabel", "Location")}</label>
                        <input
                            type="text"
                            value={profile.location}
                            placeholder={t("profile.editModal.locationPlaceholder", "City, Country")}
                            onChange={(e) =>
                                onChange("location", e.target.value)
                            }
                        />
                    </div>

                    <div className="edit-profile-field">
                        <label>{t("profile.editModal.headlineLabel", "Headline")}</label>
                        <input
                            type="text"
                            value={profile.headline}
                            placeholder={t("profile.editModal.headlinePlaceholder", "Coder | Learner | Builder")}
                            onChange={(e) =>
                                onChange("headline", e.target.value)
                            }
                        />
                    </div>

                    <div className="edit-profile-field">
                        <label>{t("profile.editModal.aboutLabel", "About Me")}</label>
                        <textarea
                            value={profile.about}
                            placeholder={t("profile.editModal.aboutPlaceholder", "Tell people about yourself...")}
                            rows="5"
                            onChange={(e) =>
                                onChange("about", e.target.value)
                            }
                        />
                    </div>

                    <div className="edit-profile-field">
                        <label>{t("profile.editModal.skillsLabel", "Skills")}</label>
                        <input
                            type="text"
                            value={skillsInput}
                            placeholder={t("profile.editModal.skillsPlaceholder", "React, Java, SQL, Python")}
                            onChange={(e) =>
                                onSkillsChange(e.target.value)
                            }
                        />
                        <span>{t("profile.editModal.skillsHint", "Separate skills with commas")}</span>
                    </div>

                    <div className="edit-profile-field">
                        <label>{t("profile.editModal.interestsLabel", "Interests")}</label>
                        <input
                            type="text"
                            value={interestsInput}
                            placeholder={t("profile.editModal.interestsPlaceholder", "AI, Startups, Web Development")}
                            onChange={(e) =>
                                onInterestsChange(e.target.value)
                            }
                        />
                        <span>{t("profile.editModal.interestsHint", "Separate interests with commas")}</span>
                    </div>
                </div>

                <div className="edit-profile-footer">
                    <button
                        className="edit-profile-cancel"
                        onClick={onClose}
                    >
                        {t("profile.editModal.cancel", "Cancel")}
                    </button>

                    <button
                        className="edit-profile-save"
                        onClick={onSave}
                    >
                        <i className="bi bi-check-lg"></i>
                        {t("profile.editModal.saveChanges", "Save Changes")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditProfileModal;
