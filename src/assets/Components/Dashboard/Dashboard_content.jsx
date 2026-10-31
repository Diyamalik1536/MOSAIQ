import { useDispatch, useSelector } from "react-redux";

import {
  removePost as removePostFromStore,
} from "../../../features/posts/postsSlice";
import { removePost } from "../../../services/postsService";
import { studentData } from "./BrowseStudents/studentData";
import { getRecommendedStudents, getTrendingSkills } from "./recommendationUtils";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../../context/UserContext";
import "./Dashboard_content.css";
import { useTranslation } from "react-i18next";

function DashboardContent() {
    const { t } = useTranslation();
    
const navigate = useNavigate();
const { currentUser } = useUser();
const dispatch = useDispatch();

const posts = useSelector((state) => state.posts.items);

    const [postToDelete, setPostToDelete] = useState(null);


    const [upvoteCounts, setUpvoteCounts] = useState(() => {
        const stored = localStorage.getItem("talentforge_upvotes");
        try {
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });
    const [likedPosts, setLikedPosts] = useState(() => {
        const stored = localStorage.getItem("talentforge_liked");
        try {
            return new Set(stored ? JSON.parse(stored) : []);
        } catch {
            return new Set();
        }
    });

    const saveUpvotes = (counts, liked) => {
        localStorage.setItem("talentforge_upvotes", JSON.stringify(counts));
        localStorage.setItem("talentforge_liked", JSON.stringify([...liked]));
    };

    const handleToggleUpvote = (postId) => {
        let isCurrentlyLiked;

        setLikedPosts((prevLiked) => {
            isCurrentlyLiked = prevLiked.has(postId);
            const newLiked = new Set(prevLiked);
            if (isCurrentlyLiked) {
                newLiked.delete(postId);
            } else {
                newLiked.add(postId);
            }
            return newLiked;
        });

        setUpvoteCounts((prevCounts) => {
            const currentCount = prevCounts[postId] || 0;
            const newCount = isCurrentlyLiked
                ? Math.max(0, currentCount - 1)
                : currentCount+1;
            return { ...prevCounts, [postId]: newCount };
        });
    };

    useEffect(() => {
        saveUpvotes(upvoteCounts, likedPosts);
    }, [upvoteCounts, likedPosts]);

    const handleDeleteRequest = (postId) => {
        setPostToDelete(postId);
    };

    
const confirmDelete = async () => {
  const postId = postToDelete;
  if (postId === null) return;

  try {
    await removePost(postId);

    dispatch(removePostFromStore(postId));

    const updatedCounts = { ...upvoteCounts };
    delete updatedCounts[postId];
    setUpvoteCounts(updatedCounts);

    const updatedLiked = new Set(likedPosts);
    updatedLiked.delete(postId);
    setLikedPosts(updatedLiked);

    saveUpvotes(updatedCounts, updatedLiked);
    setPostToDelete(null);
  } catch (error) {
    console.error("Failed to delete post:", error);
    alert(error.message || "Could not delete the post. Please try again.");
  }
};


    const cancelDelete = () => {
        setPostToDelete(null);
    };
    const recommendedStudents = useMemo(
        () => getRecommendedStudents(studentData, posts, currentUser),
        [posts, currentUser]
    );
    const trendingSkills = useMemo(
        () => getTrendingSkills(posts, studentData),
        [posts]
    );

    return (
        <section className="dashboard-content">
        <div className="dashboard-main-grid">
          <div className="posts-section">

    <div className="dashboard-section-header">

        <div>
            <h2>Latest from TalentForge</h2>

            <p>
                See what students are building and looking for.
            </p>
        </div>

    </div>


    <div className="posts-list">

        {posts.length === 0 ? (

            <div className="no-posts">

                <i className="bi bi-file-earmark-post"></i>

                <h3>{t("dashboard.feed.noPosts", "No posts yet")}</h3>

                <p>
                    Be the first to share something with the TalentForge
                    community.
                </p>

            </div>

        ) : (

            posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    upvoteCount={upvoteCounts[post.id] || 0}
                    hasUpvoted={likedPosts.has(post.id)}
                    onToggleUpvote={() => handleToggleUpvote(post.id)}
                    onDelete={handleDeleteRequest}
                />
            ))

        )}

    </div>
    

    {postToDelete !== null && (
        <div className="delete-confirm-overlay" onClick={cancelDelete}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="delete-confirm-title">{t("dashboard.feed.deleteTitle", "Delete this post?")}</h3>
                <p className="delete-confirm-text">
                    {t("dashboard.feed.deleteText", "Are you sure you want to delete this post? This action cannot be undone.")}
                </p>
                <div className="delete-confirm-buttons">
                    <button type="button" className="delete-confirm-btn cancel" onClick={cancelDelete}>
                        Cancel
                    </button>
                    <button type="button" className="delete-confirm-btn delete" onClick={confirmDelete}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )}

</div>
        <div className="recommended-section">
          <div className="dashboard-section-header">
            <div>
              <h2>{t("dashboard.recommended.title", "Recommended for You")}</h2>
              <p>{t("dashboard.recommended.subtitle", "Students who match your interests and skills.")}</p>
            </div>

            <button className="section-link" onClick={() => navigate("/students")}>
              {t("dashboard.recommended.seeAll", "See All")} <i className="bi bi-arrow-right"></i>
            </button>
          </div>

          <div className="recommended-list">

            {recommendedStudents.map((student) => (
              <div className="student-card" key={student.id}>
                <div className="student-avatar">
                    <i className="bi bi-person"></i>
                    <span className="online-dot"></span>
                </div>

                <div className="student-info">

                    <div className="student-name-row">
                        <h3>{student.name}</h3>
                        <i className="bi bi-patch-check-fill verified-icon"></i>
                    </div>

                    <p className="student-meta">
                        {student.major} • {student.year}
                    </p>

                    <p className="student-university">
                        <i className="bi bi-geo-alt"></i>
                        {student.college || student.university}
                    </p>

                    <div className="skill-tags">
                        {student.skills.slice(0, 3).map((skill) => (
                            <span key={skill}>{skill}</span>
                        ))}

                        {student.skills.length > 3 && (
                            <span className="more-skills">
                                +{student.skills.length - 3}
                            </span>
                        )}
                    </div>

                    <p className="recommendation-reason">{student.recommendationReason}</p>

                </div>

                <div className="student-match">

                    <span className="match-badge">
                        <i className="bi bi-star-fill"></i>
                        {t("dashboard.recommended.match", { percent: student.matchPercentage, defaultValue: `${student.matchPercentage}% Recommendation Match` })}
                    </span>

                    <button className="connect-button">
                        <i className="bi bi-person-plus"></i>
                        Connect
                    </button>

                </div>

                <button className="student-menu">
                    <i className="bi bi-three-dots-vertical"></i>
                </button>

            </div>
            ))}

          </div>
        </div>
          <div className="trending-skills">

      <div className="dashboard-section-header">
        <div>
          <h2>{t("dashboard.trending.title", "Trending Skills")}</h2>
          <p>{t("dashboard.trending.subtitle", "Skills gaining attention across campus.")}</p>
        </div>

        <button className="section-link" onClick={() => navigate("/students")}>
          See All <i className="bi bi-arrow-right"></i>
        </button>
      </div>

      <div className="skills-list">
                {trendingSkills.length > 0 ? trendingSkills.map((skill) => (
          <div
            key={skill.name}
            className="trending-skill"
            onClick={() => navigate("/students", { state: { skill: skill.name } })}
            role="button"
          >
            <div className="skill-icon">
              <i className={skill.icon}></i>
            </div>

            <div className="skill-details">
              <h3>{skill.name}</h3>
              <span>{skill.status}</span>
            </div>
          </div>
                )) : (
                    <div className="trending-empty">
                        <i className="bi bi-graph-up"></i>
                        <span>{t("dashboard.trending.empty", "Create a post to start tracking requested skills.")}</span>
                    </div>
                )}
      </div>

    </div>
    </div>
        </section>
      );
    }

    export default DashboardContent;
