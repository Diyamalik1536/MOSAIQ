import "./ProfileTabs.css";
import { useTranslation } from "react-i18next";

function ProfileTabs({ activeTab, onTabChange }) {
    const { t } = useTranslation();

    const tabs = [
        {
            key: "Overview",
            label: t("profile.tabs.overview", "Overview"),
            icon: "bi bi-grid",
        },
        {
            key: "Projects",
            label: t("profile.tabs.projects", "Projects"),
            icon: "bi bi-folder2-open",
        },
        {
            key: "Skills",
            label: t("profile.tabs.skills", "Skills"),
            icon: "bi bi-lightning",
        },
        {
            key: "Experience",
            label: t("profile.tabs.experience", "Experience"),
            icon: "bi bi-briefcase",
        },
        {
            key: "Education",
            label: t("profile.tabs.education", "Education"),
            icon: "bi bi-mortarboard",
        },
        {
            key: "Connections",
            label: t("profile.tabs.connections", "Connections"),
            icon: "bi bi-people",
        },
        {
            key: "Activity",
            label: t("profile.tabs.activity", "Activity"),
            icon: "bi bi-activity",
        },
    ];

    return (
        <section className="profile-tabs">
            <div className="profile-tabs-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`profile-tab ${
                            activeTab === tab.key ? "active" : ""
                        }`}
                        onClick={() => onTabChange(tab.key)}
                    >
                        <i className={tab.icon}></i>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default ProfileTabs;
