import { useEffect, useState } from "react";
import PostCard from "../Dashboard/PostCard";
import { useTranslation } from "react-i18next";
import "./Saved.css";

function Saved() {
    const { t } = useTranslation();
    const [savedPosts, setSavedPosts] = useState([]);

    useEffect(() => {
        const loadSavedPosts = () => {
            try {
                // Get the IDs of saved posts
                const savedIds = JSON.parse(
                    localStorage.getItem("talentforge_saved_posts") || "[]"
                );

                // Get all posts
                const allPosts = JSON.parse(
                    localStorage.getItem("talentforge_posts") || "[]"
                );

                // Keep only the posts whose IDs are saved
                const posts = allPosts.filter(post =>
                    savedIds.includes(post.id)
                );

                setSavedPosts(posts);
            } catch (error) {
                console.error("Error loading saved posts:", error);
                setSavedPosts([]);
            }
        };

        loadSavedPosts();

        window.addEventListener("postsUpdated", loadSavedPosts);
        window.addEventListener("storage", loadSavedPosts);

        return () => {
            window.removeEventListener("postsUpdated", loadSavedPosts);
            window.removeEventListener("storage", loadSavedPosts);
        };
    }, []);

    return (
        <div className="saved-page">
            <div className="saved-header">
                <h1>{t("saved.title", "Saved Posts")}</h1>
                <p>{t("saved.subtitle", "Access your bookmarked opportunities and project listings.")}</p>
            </div>

            {savedPosts.length === 0 ? (
                <div className="saved-empty-state">
                    <div className="empty-icon-circle">
                        <i className="bi bi-bookmark"></i>
                    </div>
                    <h3>{t("saved.emptyTitle", "No Saved Posts")}</h3>
                    <p>{t("saved.emptySubtitle", "Click the bookmark button on any post to save it for later.")}</p>
                </div>
            ) : (
                <div className="saved-posts-grid">
                    {savedPosts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Saved;
