import heroImageLight from "../../../hero.png";
import heroImageDark from "../../../hero-dark.png";
import { useTheme } from "../../../../context/useTheme";
import { useNavigate } from "react-router-dom";
import PostModal from "./PostModal";
import { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserContext";
import { useMessages } from "../../../../context/MessageContext";
import { useTranslation } from "react-i18next";
import "./Hero.css";
import { getUserKey, getActiveConnections } from "../../../../services/connectionsService";

function Hero() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [postModalOpen, setPostModalOpen] = useState(false);
    const { currentUser } = useUser();
    const { theme } = useTheme();
    const heroImage = theme === "dark" ? heroImageDark : heroImageLight;
    const { unreadCount: newMessages } = useMessages();
    let current_hours = new Date().getHours();
    const dashboardUser = currentUser;
    const userKey = getUserKey(currentUser);
    const [connectionCount, setConnectionCount] = useState(() => {
        return getActiveConnections(userKey).length;
    });
    const connections = connectionCount;
    const [savedCount, setSavedCount] = useState(() => {
        try {
            const savedIds = JSON.parse(localStorage.getItem("talentforge_saved_posts") || "[]");
            return Array.isArray(savedIds) ? savedIds.length : 0;
        } catch {
            return 0;
        }
    });

    useEffect(() => {
        const updateSavedCount = () => {
            try {
                const savedIds = JSON.parse(localStorage.getItem("talentforge_saved_posts") || "[]");
                setSavedCount(Array.isArray(savedIds) ? savedIds.length : 0);
            } catch {
                setSavedCount(0);
            }
        };

        const updateConnections = () => {
            setConnectionCount(getActiveConnections(userKey).length);
        };

        window.addEventListener("storage", updateSavedCount);
        window.addEventListener("storage", updateConnections);
        window.addEventListener("postsUpdated", updateSavedCount);
        window.addEventListener("connectionsUpdated", updateConnections);

        return () => {
            window.removeEventListener("storage", updateSavedCount);
            window.removeEventListener("storage", updateConnections);
            window.removeEventListener("postsUpdated", updateSavedCount);
            window.removeEventListener("connectionsUpdated", updateConnections);
        };
    }, [userKey]);

    const ongoingProjects = dashboardUser?.ongoingProjects?.length || 0;

    function getGreeting() {
        if (current_hours >= 5 && current_hours < 12) {
            return t("dashboard.greetings.morning", "Good morning");
        } else if (current_hours >= 12 && current_hours <= 16) {
            return t("dashboard.greetings.afternoon", "Good afternoon");
        } else if (current_hours > 16 && current_hours <= 19) {
            return t("dashboard.greetings.evening", "Good evening");
        } else {
            return t("dashboard.greetings.night", "Good night");
        }
    }

    const greeting = getGreeting();
    const userName = typeof currentUser?.name === "string" ? currentUser.name.trim() : "";

    return (
        <div className="hero_part">
            <div className="hero_image">
                <img src={heroImage} alt="hero image illustrating a boy and girl learning together" />
            </div>
            <div className="hero_text">
                <h1 className="greetings">
                    {greeting}{userName && <>, <span className="greeting-name">{userName}</span></>}!
                </h1>
                <p>{t("dashboard.heroSubtitle", "Find the right people, Build amazing things together")}</p>
                <div className="hero_stats">
                    <div
                        className="hero_stat_card"
                        onClick={() => navigate("/connections")}
                        style={{ cursor: "pointer" }}
                        title="View Connections"
                    >
                        <div className="hero_stat_icon">
                            <i className="bi bi-people"></i>
                        </div>
                        <div className="hero_stat_info">
                            <strong>{connections}</strong>
                            <span>{t("dashboard.stats.connections", "Connections")}</span>
                        </div>
                    </div>

                    <div
                        className="hero_stat_card"
                        onClick={() => navigate("/saved")}
                        style={{ cursor: "pointer" }}
                        title="View Saved Posts"
                    >
                        <div className="hero_stat_icon">
                            <i className="bi bi-bookmark"></i>
                        </div>
                        <div className="hero_stat_info">
                            <strong>{savedCount}</strong>
                            <span>{t("dashboard.stats.saved", "Saved")}</span>
                        </div>
                    </div>

                    <div className="hero_stat_card">
                        <div className="hero_stat_icon">
                            <i className="bi bi-folder2-open"></i>
                        </div>
                        <div className="hero_stat_info">
                            <strong>{ongoingProjects}</strong>
                            <span>{t("dashboard.stats.ongoingProjects", "Ongoing Projects")}</span>
                        </div>
                    </div>

                    <div
                        className="hero_stat_card"
                        onClick={() => navigate("/messages")}
                        style={{ cursor: "pointer" }}
                        title="View Messages"
                    >
                        <div className="hero_stat_icon">
                            <i className="bi bi-chat-dots"></i>
                        </div>
                        <div className="hero_stat_info">
                            <strong>{newMessages}</strong>
                            <span>{t("dashboard.stats.newMessages", "New Messages")}</span>
                        </div>
                    </div>
                </div>

                <div className="hero_actions">
                    <button className="explore_matches" onClick={() => navigate("/students")}>
                        {t("dashboard.actions.exploreMatches", "Explore Matches")}
                        <i className="bi bi-arrow-right"></i>
                    </button>

                    <button className="post_project" onClick={() => setPostModalOpen(true)}>
                        <i className="bi bi-plus-lg"></i>
                        {t("dashboard.actions.postProject", "Post a Project")}
                    </button>

                    {postModalOpen && (
                        <PostModal onClose={() => setPostModalOpen(false)} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Hero;
