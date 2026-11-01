import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./PostsSection.css";

function PostsSection({ posts, onAdd, onDelete }) {
    const { t } = useTranslation();
    const [postText, setPostText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        const text = postText.trim();

        if (!text || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await onAdd(text);
            setPostText("");
        } catch (submitError) {
            console.error("Failed to create profile post:", submitError);
            setError(
                submitError.message ||
                "Could not create your post. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id) {
        setError("");

        try {
            await onDelete(id);
        } catch (deleteError) {
            console.error("Failed to delete profile post:", deleteError);
            setError(
                deleteError.message ||
                "Could not delete the post. Please try again."
            );
        }
    }

    return (
        <section className="posts-section">
            <div className="posts-header">
                <div>
                    <h2>{t("profile.postsSection.title", "Activity")}</h2>
                    <p>{t("profile.postsSection.subtitle", "Share your thoughts, updates and achievements")}</p>
                </div>

                <div className="posts-header-icon">
                    <i className="bi bi-activity"></i>
                </div>
            </div>

            <form className="post-form" onSubmit={handleSubmit}>
                <textarea
                    value={postText}
                    placeholder={t("profile.postsSection.placeholder", "Share something with the MOSAIQ community...")}
                    rows="4"
                    onChange={(e) => setPostText(e.target.value)}
                />

                <div className="post-form-footer">
                    <span>
                        <i className="bi bi-pencil-square"></i>
                        {t("profile.postsSection.createPost", "Create a post")}
                    </span>

                    <button type="submit" disabled={isSubmitting}>
                        <i className="bi bi-send"></i>
                        {isSubmitting
                            ? t("profile.postsSection.posting", "Posting...")
                            : t("profile.postsSection.postButton", "Post")}
                    </button>
                </div>
            </form>

            {error && <p role="alert">{error}</p>}

            <div className="posts-list">
                {posts.length > 0 ? (
                    posts
                        .map(post => (
                            <article
                                className="post-card"
                                key={post.id}
                            >
                                <div className="post-card-header">
                                    <div className="post-author-avatar">
                                        <i className="bi bi-person-fill"></i>
                                    </div>

                                    <div className="post-author-info">
                                        <h3>You</h3>
                                        <span>{post.createdAt}</span>
                                    </div>

                                    <button
                                        type="button"
                                        className="post-delete"
                                        onClick={() => handleDelete(post.id)}
                                        aria-label="Delete post"
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>

                                <div className="post-content">
                                    <p>{post.text || post.description || post.title}</p>
                                </div>

                                <div className="post-actions">
                                    <button>
                                        <i className="bi bi-heart"></i>
                                        {t("dashboard.postCard.unlike", "Like")}
                                    </button>

                                    <button>
                                        <i className="bi bi-chat"></i>
                                        {t("dashboard.postCard.comment", "Comment")}
                                    </button>

                                    <button>
                                        <i className="bi bi-share"></i>
                                        {t("dashboard.postCard.share", "Share")}
                                    </button>
                                </div>
                            </article>
                        ))
                ) : (
                    <div className="posts-empty">
                        <i className="bi bi-activity"></i>
                        <h3>{t("profile.postsSection.emptyTitle", "No activity yet")}</h3>
                        <p>
                            {t("profile.postsSection.emptySubtitle", "Share project milestones, questions, or ideas with the campus.")}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default PostsSection;
