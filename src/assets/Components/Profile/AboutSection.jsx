import "./AboutSection.css";
import { useTranslation } from "react-i18next";

function AboutSection({ profile }) {
    const { t } = useTranslation();

    return (
        <section className="about-section">
            <div className="about-card">
                <div className="about-card-header">
                    <div>
                        <h2>{t("profile.aboutSection.title", "About Me")}</h2>
                        <p>{t("profile.aboutSection.subtitle", "Get to know more about me")}</p>
                    </div>

                    <i className="bi bi-person-lines-fill"></i>
                </div>

                <div className="about-content">
                    {profile.about ? (
                        <p>{profile.about}</p>
                    ) : (
                        <div className="empty-profile-content">
                            <i className="bi bi-pencil-square"></i>
                            <p>
                                {t("profile.aboutSection.empty", "Add something about yourself to help others know you better.")}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-content-grid">
                <div className="about-card">
                    <div className="about-card-header">
                        <div>
                            <h2>{t("profile.aboutSection.skillsTitle", "Skills")}</h2>
                            <p>{t("profile.aboutSection.skillsSubtitle", "What I can help with")}</p>
                        </div>

                        <i className="bi bi-lightning-charge-fill"></i>
                    </div>

                    <div className="about-list">
                        {(profile.skills || []).length > 0 ? (
                            (profile.skills || []).map((skill, index) => (
                                <span key={index}>
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <div className="empty-profile-content">
                                <i className="bi bi-plus-circle"></i>
                                <p>{t("profile.aboutSection.skillsEmpty", "Add your skills to your profile.")}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="about-card">
                    <div className="about-card-header">
                        <div>
                            <h2>{t("profile.aboutSection.interestsTitle", "Interests")}</h2>
                            <p>{t("profile.aboutSection.interestsSubtitle", "Things I'm interested in")}</p>
                        </div>

                        <i className="bi bi-heart-fill"></i>
                    </div>

                    <div className="about-list">
                        {(profile.interests || []).length > 0 ? (
                            (profile.interests || []).map((interest, index) => (
                                <span key={index}>
                                    {interest}
                                </span>
                            ))
                        ) : (
                            <div className="empty-profile-content">
                                <i className="bi bi-plus-circle"></i>
                                <p>{t("profile.aboutSection.interestsEmpty", "Add your interests to your profile.")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutSection;
