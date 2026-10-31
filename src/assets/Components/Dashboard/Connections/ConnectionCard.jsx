import { useState } from "react";
import { useNavigate } from "react-router-dom";

function formatRelativeTime(dateString) {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 30) return date.toLocaleDateString();
        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return "Just now";
    } catch {
        return "";
    }
}

function ConnectionCard({
    variant = "active",
    data,
    onContact,
    onRemove,
    onAccept,
    onDecline,
    onCancel,
    onConnect,
    isConnecting = false
}) {
    const navigate = useNavigate();
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!data) return null;

    const student = variant === "incoming" ? (data.student || data) : data;
    const name = student.name || "Student";
    const role = student.role || (student.major ? `${student.major} (${student.year || "Colleague"})` : "Peer");
    const college = student.college || "";
    const avatar = student.avatar || "";
    const skills = Array.isArray(student.skills) ? student.skills : [];
    const availability = (student.availability || "open_to_collaborate").replace(/_/g, " ");

    const handleSchedule = () => {
        const studentName = encodeURIComponent(name);
        navigate(`/schedule?collabWith=${studentName}`);
    };

    return (
        <article className={`connection-card connection-card-${variant}`}>
            <div className="connection-card-header">
                <div className="connection-card-avatar-wrapper">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={name}
                            className="connection-card-avatar"
                            onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = "flex";
                                }
                            }}
                        />
                    ) : null}
                    <div
                        className="connection-card-avatar-fallback"
                        style={{ display: avatar ? "none" : "flex" }}
                    >
                        {name.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="connection-card-info">
                    <div className="connection-name-row">
                        <h3 className="connection-card-name">{name}</h3>
                        <span className={`connection-avail-badge ${student.availability || "open"}`}>
                            {availability}
                        </span>
                    </div>

                    <p className="connection-card-role">{role}</p>
                    {college && <p className="connection-card-college">{college}</p>}
                </div>
            </div>

            {/* Note or incoming invitation message */}
            {variant === "incoming" && data.message && (
                <div className="connection-invitation-message">
                    <i className="bi bi-chat-quote"></i>
                    <p>"{data.message}"</p>
                </div>
            )}

            {/* Active connection notes if available */}
            {variant === "active" && data.notes && (
                <p className="connection-card-notes">
                    <i className="bi bi-info-circle"></i> {data.notes}
                </p>
            )}

            {/* Skills chips */}
            {skills.length > 0 && (
                <div className="connection-card-skills">
                    {skills.slice(0, 4).map((skill, index) => (
                        <span key={`${skill}-${index}`} className="connection-skill-chip">
                            {skill}
                        </span>
                    ))}
                    {skills.length > 4 && (
                        <span className="connection-skill-chip more">
                            +{skills.length - 4}
                        </span>
                    )}
                </div>
            )}

            {/* Card footer metadata & actions */}
            <div className="connection-card-footer">
                {variant === "active" && (
                    <>
                        <div className="connection-connected-at">
                            <i className="bi bi-calendar3"></i>
                            <span>Connected {formatRelativeTime(data.connectedAt)}</span>
                        </div>

                        <div className="connection-card-actions">
                            <button
                                type="button"
                                className="connection-action-btn secondary"
                                onClick={handleSchedule}
                                title="Schedule collaboration session"
                                aria-label={`Schedule collaboration with ${name}`}
                            >
                                <i className="bi bi-calendar-plus"></i>
                            </button>

                            <button
                                type="button"
                                className="connection-action-btn primary contact-btn"
                                onClick={() => onContact && onContact(data)}
                                aria-label={`Message ${name}`}
                            >
                                <i className="bi bi-chat-dots-fill"></i>
                                <span>Message</span>
                            </button>

                            {confirmDelete ? (
                                <div className="connection-confirm-group">
                                    <button
                                        type="button"
                                        className="connection-action-btn danger-confirm"
                                        onClick={() => onRemove && onRemove(data.id)}
                                        title="Confirm remove"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        type="button"
                                        className="connection-action-btn secondary"
                                        onClick={() => setConfirmDelete(false)}
                                        title="Cancel"
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="connection-action-btn remove"
                                    onClick={() => setConfirmDelete(true)}
                                    title="Remove connection"
                                    aria-label={`Remove ${name} from connections`}
                                >
                                    <i className="bi bi-trash3"></i>
                                </button>
                            )}
                        </div>
                    </>
                )}

                {variant === "incoming" && (
                    <div className="connection-card-actions full-width">
                        <button
                            type="button"
                            className="connection-action-btn decline"
                            onClick={() => onDecline && onDecline(data.id)}
                        >
                            <i className="bi bi-x-lg"></i>
                            <span>Decline</span>
                        </button>
                        <button
                            type="button"
                            className="connection-action-btn accept"
                            onClick={() => onAccept && onAccept(data.id)}
                        >
                            <i className="bi bi-check-lg"></i>
                            <span>Accept</span>
                        </button>
                    </div>
                )}

                {variant === "pending" && (
                    <div className="connection-card-actions full-width">
                        <span className="connection-pending-indicator">
                            <i className="bi bi-clock-history"></i>
                            <span>Invite Pending</span>
                        </span>
                        <button
                            type="button"
                            className="connection-action-btn secondary withdraw"
                            onClick={() => onCancel && onCancel(student.id)}
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            <span>Withdraw</span>
                        </button>
                    </div>
                )}

                {variant === "suggested" && (
                    <div className="connection-card-actions full-width">
                        <button
                            type="button"
                            className="connection-action-btn primary connect-action"
                            disabled={isConnecting}
                            onClick={() => onConnect && onConnect(student)}
                        >
                            <i className="bi bi-person-plus-fill"></i>
                            <span>{isConnecting ? "Connecting..." : "Connect"}</span>
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}

export default ConnectionCard;
