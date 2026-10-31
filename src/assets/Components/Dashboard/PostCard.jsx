import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function formatPostDate(date, t) {
    if (!date) {
        return t ? t("dashboard.postCard.time.justNow", "Just now") : "Just now";
    }

    const postDate = new Date(date);
    const now = new Date();
    const difference = Math.floor((now - postDate) / 1000);

    if (difference < 60) {
        return t ? t("dashboard.postCard.time.justNow", "Just now") : "Just now";
    }

    if (difference < 3600) {
        const minutes = Math.floor(difference / 60);
        return t ? t("dashboard.postCard.time.minAgo", { count: minutes, defaultValue: `${minutes} min ago` }) : `${minutes} min ago`;
    }

    if (difference < 86400) {
        const hours = Math.floor(difference / 3600);
        return t ? t("dashboard.postCard.time.hrAgo", { count: hours, defaultValue: `${hours} hr ago` }) : `${hours} hr ago`;
    }

    const days = Math.floor(difference / 86400);
    return t ? t("dashboard.postCard.time.daysAgo", { count: days, defaultValue: `${days} days ago` }) : `${days} days ago`;
}

function getPostTypeName(type, t) {
    if (!t) {
        switch (type) {
            case "shareProject": return "Share a Project";
            case "findCollaborators": return "Find Collaborators";
            case "availableToHelp": return "Available to Help";
            case "needHelp": return "Need Help";
            default: return "Community Post";
        }
    }
    switch (type) {
        case "shareProject":
            return t("dashboard.postTypes.shareProject", "Share a Project");
        case "findCollaborators":
            return t("dashboard.postTypes.findCollaborators", "Find Collaborators");
        case "availableToHelp":
            return t("dashboard.postTypes.availableToHelp", "Available to Help");
        case "needHelp":
            return t("dashboard.postTypes.needHelp", "Need Help");
        default:
            return t("dashboard.postTypes.communityPost", "Community Post");
    }
}

function PostCard({
    post,
    currentUser,
    upvoteCount,
    hasUpvoted,
    onToggleUpvote,
    onDelete,
}) {
    const { t } = useTranslation();
    const isOwner = Boolean(
        currentUser && post.author &&
        (post.author.id === currentUser.id || post.author.id === currentUser.uid || post.author.email === currentUser.email)
    );

    const [menuOpen, setMenuOpen] = useState(false);
    const [saved, setSaved] = useState(() => {
        try {
            const stored = localStorage.getItem("talentforge_saved_posts");
            return new Set(JSON.parse(stored || "[]"));
        } catch {
            return new Set();
        }
    });

    useEffect(() => {
        if (!menuOpen) return;

        const handleOutsideClick = (e) => {
            if (e.target.closest(".post-menu-dropdown") || e.target.closest(".post-menu-button")) {
                return;
            }
            setMenuOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [menuOpen]);

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        onDelete(post.id);
    };

    const handleUpvoteClick = (e) => {
        e.stopPropagation();
        onToggleUpvote(post.id);
    };

    const handleSave = () => {
        setSaved((prev) => {
            const updated = new Set(prev);
            if (updated.has(post.id)) {
                updated.delete(post.id);
            } else {
                updated.add(post.id);
            }
            localStorage.setItem("talentforge_saved_posts", JSON.stringify([...updated]));
            return updated;
        });
    };

    return (
        <div className="talentforge-post">
            <div className="post-author">
                <div className="post-author-avatar">
                    {post.author?.avatar ? (
                        <img
                            src={post.author.avatar}
                            alt={post.author.name}
                        />
                    ) : (
                        <i className="bi bi-person"></i>
                    )}
                </div>

                <div className="post-author-info">
                    <div className="post-author-name">
                        <strong>
                            {post.author?.name || "MOSAIQ User"}
                        </strong>
                        <i className="bi bi-patch-check-fill"></i>
                    </div>
                    <span>
                        {formatPostDate(post.createdAt, t)}
                    </span>
                </div>
                <div className="post-menu-wrapper">
                    <button
                        type="button"
                        className="post-menu-button"
                        onClick={handleMenuToggle}
                        aria-label="Post options"
                    >
                        <i className="bi bi-three-dots-vertical"></i>
                    </button>

                    {menuOpen && (
                        <div className="post-menu-dropdown">
                            {isOwner ? (
                                <button
                                    type="button"
                                    className="post-menu-item post-menu-delete"
                                    onClick={handleDeleteClick}
                                >
                                    <i className="bi bi-trash3"></i>
                                    <span>{t("dashboard.feed.delete", "Delete Post")}</span>
                                </button>
                            ) : (
                                <p className="post-menu-message">You are not the owner of this post.<br />You can't delete it.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className={`post-type ${post.type}`}>
                <i
                    className={
                        post.type === "shareProject"
                            ? "bi bi-pc-display-horizontal"
                            : post.type === "findCollaborators"
                            ? "bi bi-people-fill"
                            : post.type === "availableToHelp"
                            ? "bi bi-calendar-day-fill"
                            : "bi bi-person-fill"
                    }
                ></i>
                <span>
                    {getPostTypeName(post.type, t)}
                </span>
            </div>

            <h3 className="post-title">
                {post.title}
            </h3>

            <p className="post-description">
                {post.description}
            </p>

            {post.skillsNeeded && (
                <div className="post-detail">
                    <strong>{t("dashboard.postCard.skillsNeeded", "Skills needed:")}</strong>
                    <span>
                        {post.skillsNeeded}
                    </span>
                </div>
            )}

            {post.skills && (
                <div className="post-detail">
                    <strong>{t("dashboard.postCard.skills", "Skills:")}</strong>
                    <span>
                        {post.skills}
                    </span>
                </div>
            )}

            {post.helpNeeded && (
                <div className="post-detail">
                    <strong>{t("dashboard.postCard.helpNeeded", "Help needed:")}</strong>
                    <span>
                        {post.helpNeeded}
                    </span>
                </div>
            )}

            {post.urgency && (
                <span className={`post-badge ${post.urgency}`}>
                    {post.urgency === "high"
                        ? t("dashboard.postCard.urgency.high", "Urgent")
                        : post.urgency === "medium"
                        ? t("dashboard.postCard.urgency.medium", "Needed Soon")
                        : t("dashboard.postCard.urgency.low", "Not Urgent")}
                </span>
            )}

            {post.helpFormat && (
                <span className="post-badge">
                    {post.helpFormat === "chat"
                        ? t("dashboard.postCard.helpFormat.chat", "Chat / Discussion")
                        : post.helpFormat === "call"
                        ? t("dashboard.postCard.helpFormat.call", "Call / Meeting")
                        : post.helpFormat === "collaboration"
                        ? t("dashboard.postCard.helpFormat.collaboration", "Work Together")
                        : t("dashboard.postCard.helpFormat.review", "Review / Feedback")}
                </span>
            )}

            <div className="post-actions">
                <button type="button" className="post-action-btn">
                    <i className="bi bi-chat"></i>
                    {t("dashboard.postCard.comment", "Comment")}
                </button>

                <button
                    type="button"
                    className={`post-action-btn post-upvote ${
                        hasUpvoted ? "post-liked" : ""
                    }`}
                    onClick={handleUpvoteClick}
                    aria-label={hasUpvoted ? t("dashboard.postCard.unlike", "Unlike") : t("dashboard.postCard.upvote", "Upvote")}
                >
                    <i
                        className={
                            hasUpvoted
                                ? "bi bi-heart-fill"
                                : "bi bi-heart"
                        }
                    ></i>
                    {upvoteCount || 0}
                </button>

                <button type="button" className={`post-action-btn ${saved.has(post.id) ? "saved" : ""}`} onClick={handleSave}>
                    <i className={saved.has(post.id) ? "bi bi-bookmark-fill" : "bi bi-bookmark"}></i>
                    {saved.has(post.id) ? t("dashboard.postCard.saved", "Saved") : t("dashboard.postCard.save", "Save")}
                </button>

                <button type="button" className="post-action-btn">
                    <i className="bi bi-share"></i>
                    {t("dashboard.postCard.share", "Share")}
                </button>
            </div>
        </div>
    );
}

export default PostCard;
