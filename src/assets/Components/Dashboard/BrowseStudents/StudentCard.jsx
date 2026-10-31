import { useState } from "react";
import { useUser } from "../../../../context/UserContext";
import { useTranslation } from "react-i18next";
import "./BrowseStudents.css";

function getMatchColor(score) {
    if (score >= 90) return { background: "#dcfce7", color: "#166534" };
    if (score >= 80) return { background: "#dbeafe", color: "#1e40af" };
    if (score >= 70) return { background: "#fef3c7", color: "#92400e" };
    return { background: "#fee2e2", color: "#991b1b" };
}

function getConnectionStorageKey(user) {
    const userKey = user?.uid || user?.id || user?.email;
    return userKey ? `talentforge_connection_requests_${encodeURIComponent(userKey)}` : null;
}

function getWeekStart() {
    const date = new Date();
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday);
    return date.toISOString().slice(0, 10);
}

function readConnections(storageKey) {
    if (!storageKey) return { connectedIds: [], weekStart: "", weeklyIds: [] };
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
        return {
            connectedIds: Array.isArray(stored.connectedIds) ? stored.connectedIds : [],
            weekStart: typeof stored.weekStart === "string" ? stored.weekStart : "",
            weeklyIds: Array.isArray(stored.weeklyIds) ? stored.weeklyIds : []
        };
    } catch {
        return { connectedIds: [], weekStart: "", weeklyIds: [] };
    }
}

function StudentCard({ student, matchScore }) {
    const { t } = useTranslation();
    const { currentUser, isPro, openUpgradeModal } = useUser();
    const connectionStorageKey = getConnectionStorageKey(currentUser);
    const formattedScore = typeof matchScore === "number" ? t("students.profileMatch", { score: matchScore, defaultValue: `${matchScore}% Profile Match` }) : null;
    const matchColor = typeof matchScore === "number" ? getMatchColor(matchScore) : null;

    const [isConnected, setIsConnected] = useState(() => {
        return readConnections(connectionStorageKey).connectedIds.includes(student.id);
    });

    const handleConnect = () => {
        if (isConnected) return;

        const connections = readConnections(connectionStorageKey);
        if (connections.connectedIds.includes(student.id)) {
            setIsConnected(true);
            return;
        }

        const weekStart = getWeekStart();
        const weeklyIds = connections.weekStart === weekStart ? connections.weeklyIds : [];

        // Restriction: Free users have a 5 connections limit per week
        if (!isPro && weeklyIds.length >= 5) {
            openUpgradeModal("Unlimited Connect Requests (Weekly Free limit of 5 reached)");
            return;
        }

        const updated = {
            connectedIds: [...connections.connectedIds, student.id],
            weekStart,
            weeklyIds: [...weeklyIds, student.id]
        };
        try {
            localStorage.setItem(connectionStorageKey, JSON.stringify(updated));
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("connectionsUpdated", { detail: { updated } }));
            }
        } catch (error) {
            console.error("Failed to save connection request:", error);
            window.alert("Your connection request couldn't be saved. Please try again.");
            return;
        }
        setIsConnected(true);

        const freeRemaining = 5 - updated.weeklyIds.length;
        if (!isPro) {
            window.alert(`Connection request sent to ${student.name}! (${freeRemaining >= 0 ? freeRemaining : 0} free requests remaining this week)`);
        } else {
            window.alert(`Connection request sent to ${student.name}! (Unlimited Pro Member)`);
        }
    };

    const availabilityText = student.availability
        ? t(`students.availability.${student.availability}`, student.availability.replace(/_/g, " "))
        : "";

    return (
        <div className="student-card">
            <div className="student-card-header">
                <img
                    src={student.avatar}
                    alt={student.name}
                    className="student-avatar"
                />
                <div className="student-header-info">
                    <div className="student-name-row">
                        <h3 className="student-name">{student.name}</h3>
                        <span className="verified-badge">
                            <i className="bi bi-check-circle-fill"></i>
                        </span>
                    </div>
                    <p className="student-college">{student.college}</p>
                    <p className="student-major-year">
                        {student.major} • {student.year}
                    </p>
                </div>
                {formattedScore && matchColor && (
                    <span
                        className="match-badge"
                        style={{ background: matchColor.background, color: matchColor.color }}
                    >
                        {formattedScore}
                    </span>
                )}
            </div>

            <div className="student-card-body">
                <div className="student-section">
                    <span className={`availability-badge ${student.availability}`}>
                        {availabilityText}
                    </span>
                </div>

                <div className="student-section">
                    <div className="tags">
                        {(student.skills || []).map((skill) => (
                            <span key={skill} className="tag skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="student-section">
                    <p className="interests-text">
                        <strong>{t("students.interests", "Interests:")}</strong> {(student.interests || []).join(", ")}
                    </p>
                </div>

                <div className="student-section">
                    <p className="looking-for">
                        <strong>{t("students.lookingFor", "Looking for:")}</strong> {student.lookingFor}
                    </p>
                </div>
            </div>

            <div className="student-card-footer">
                <button className="btn-outline">{t("students.viewProfile", "View Profile")}</button>
                <button
                    className={`btn-icon ${isConnected ? "connected" : ""}`}
                    aria-label={isConnected ? t("students.connected", "Connected") : t("students.connect", "Connect")}
                    title={isConnected ? t("students.connectionSent", "Connection Request Sent") : isPro ? `${t("students.connect", "Connect")} (Unlimited Pro)` : `${t("students.connect", "Connect")} (Free: 5/week)`}
                    onClick={handleConnect}
                >
                    <i className={isConnected ? "bi bi-check-lg" : "bi bi-person-plus"}></i>
                </button>
            </div>
        </div>
    );
}

export default StudentCard;
