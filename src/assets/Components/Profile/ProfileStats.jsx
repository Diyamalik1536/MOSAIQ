import "./ProfileStats.css";
import { useTranslation } from "react-i18next";

function ProfileStats({ stats }) {
    const { t } = useTranslation();

    return (
        <section className="profile-stats">
            <div className="profile-stat">
                <div className="profile-stat-icon">
                    <i className="bi bi-folder2-open"></i>
                </div>
                <div className="profile-stat-content">
                    <h3>{stats?.projects ?? 0}</h3>
                    <p>{t("profile.stats.projects", "Projects")}</p>
                </div>
            </div>

            <div className="profile-stat">
                <div className="profile-stat-icon">
                    <i className="bi bi-people"></i>
                </div>
                <div className="profile-stat-content">
                    <h3>{stats?.connections ?? 0}</h3>
                    <p>{t("profile.stats.connections", "Connections")}</p>
                </div>
            </div>

            <div className="profile-stat">
                <div className="profile-stat-icon">
                    <i className="bi bi-eye"></i>
                </div>
                <div className="profile-stat-content">
                    <h3>{stats?.profileViews ?? 0}</h3>
                    <p>{t("profile.stats.profileViews", "Profile Views")}</p>
                </div>
            </div>
        </section>
    );
}

export default ProfileStats;
