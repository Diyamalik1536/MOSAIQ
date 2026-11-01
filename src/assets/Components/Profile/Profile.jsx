import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";
import AboutSection from "./AboutSection";
import ProjectsSection from "./ProjectsSection";
import SkillsSection from "./SkillsSection";
import EducationSection from "./EducationSection";
import ExperienceSection from "./ExperienceSection";
import ConnectionsSection from "./ConnectionsSection";
import PostsSection from "./PostsSection";
import EditProfileModal from "./EditProfileModal";
import "./Profile.css";
import { useUser } from "../../../context/UserContext";
import { createPost, removePost } from "../../../services/postsService";

function readStoredJson(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error(`Unable to read saved profile data (${key}):`, error);
        return fallback;
    }
}

function Profile() {
    const { currentUser: user, updateCurrentUser } = useUser();
    const [activeTab, setActiveTab] = useState("Overview");
    const [loadedProfileUid] = useState(user?.uid || null);

    const userKey = user?.uid || user?.id || user?.email || "guest";

    const profileStorageKey = `talentforge_profile_${userKey}`;
    const projectsStorageKey = `talentforge_projects_${userKey}`;
    const educationStorageKey = `talentforge_education_${userKey}`;
    const experiencesStorageKey = `talentforge_experiences_${userKey}`;

    const defaultProfile = {
        role: user?.role || "",
        university: user?.university || user?.college || "",
        year: user?.year || "",
        location: user?.location || "",
        headline: user?.headline || "",
        about: user?.about || "",
        skills: user?.skills || [],
        interests: user?.interests || [],
        tags: user?.tags || [],
        coverImage: user?.coverImage || "",
        isVerified: user?.isVerified || false
    };
    const [profile, setProfile] = useState(() => {
        return {
            ...defaultProfile,
            ...readStoredJson(profileStorageKey, {})
        };
    });

    const [projects, setProjects] = useState(() => {
        return readStoredJson(projectsStorageKey, []);
    });

    const [education, setEducation] = useState(() => {
        return readStoredJson(educationStorageKey, []);
    });

    const [experiences, setExperiences] = useState(() => {
        return readStoredJson(experiencesStorageKey, []);
    });
    const [connections, setConnections] = useState(() => {
    const savedConnections = localStorage.getItem(
        `talentforge_connections_${userKey}`
    );

    if (!savedConnections) {
        return [];
    }

    try {
        return JSON.parse(savedConnections);
    } catch  {
        return [];
    }
});
useEffect(() => {
    localStorage.setItem(
        `talentforge_connections_${userKey}`,
        JSON.stringify(connections)
    );
    window.dispatchEvent(new CustomEvent("connectionsUpdated", { detail: { userKey, connections } }));
}, [connections, userKey]);
useEffect(() => {
    const handleSync = () => {
        try {
            const raw = localStorage.getItem(`talentforge_connections_${userKey}`);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setConnections(parsed);
            }
        } catch (err) {
            console.debug("Connections sync error:", err);
        }
    };
    window.addEventListener("connectionsUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
        window.removeEventListener("connectionsUpdated", handleSync);
        window.removeEventListener("storage", handleSync);
    };
}, [userKey]);
const [legacyPosts, setLegacyPosts] = useState(() => {
    return readStoredJson(`talentforge_posts_${userKey}`, []);
});
const communityPosts = useSelector((state) => state.posts.items);
const posts = [
    ...legacyPosts,
    ...communityPosts.filter(
        post => post.author?.uid === user?.uid || post.author?.id === user?.uid
    )
].sort(
    (firstPost, secondPost) =>
        new Date(secondPost.createdAt).getTime() -
        new Date(firstPost.createdAt).getTime()
);

    const [isEditing, setIsEditing] = useState(false);
    const [skillsInput, setSkillsInput] = useState("");
    const [interestsInput, setInterestsInput] = useState("");

    useEffect(() => {
        if (!user?.uid || loadedProfileUid !== user.uid) return;

        try {
            localStorage.setItem(
                profileStorageKey,
                JSON.stringify(profile)
            );
        } catch (e) {
            console.error("Failed to save profile to localStorage:", e);
        }
    }, [profile, profileStorageKey, loadedProfileUid, user?.uid]);

    useEffect(() => {
        if (!user?.uid || loadedProfileUid !== user.uid) return;

        try {
            localStorage.setItem(
                projectsStorageKey,
                JSON.stringify(projects)
            );
        } catch (e) {
            console.error("Failed to save projects to localStorage:", e);
        }
    }, [projects, projectsStorageKey, loadedProfileUid, user?.uid]);

    useEffect(() => {
        if (!user?.uid || loadedProfileUid !== user.uid) return;

        localStorage.setItem(
            educationStorageKey,
            JSON.stringify(education)
        );
    }, [education, educationStorageKey, loadedProfileUid, user?.uid]);

    useEffect(() => {
        if (!user?.uid || loadedProfileUid !== user.uid) return;

        localStorage.setItem(
            experiencesStorageKey,
            JSON.stringify(experiences)
        );
    }, [experiences, experiencesStorageKey, loadedProfileUid, user?.uid]);

    useEffect(() => {
        if (!user?.uid || loadedProfileUid !== user.uid) return;

        try {
            localStorage.setItem(
                `talentforge_posts_${userKey}`,
                JSON.stringify(legacyPosts)
            );
        } catch (error) {
            console.error("Failed to save legacy posts to localStorage:", error);
        }
    }, [legacyPosts, userKey, loadedProfileUid, user?.uid]);

    useEffect(() => {
  if (!isEditing) return;

  queueMicrotask(() => {
    setSkillsInput(profile.skills.join(", "));
    setInterestsInput(profile.interests.join(", "));
  });
}, [isEditing, profile.skills, profile.interests]);

    function handleEdit() {
        setIsEditing(prev => !prev);
    }

    function handleProfileChange(field, value) {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    }

    function handleSkillsChange(value) {
        setSkillsInput(value);

        const skills = value
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);

        setProfile(prev => ({
            ...prev,
            skills
        }));
    }

    function handleInterestsChange(value) {
        setInterestsInput(value);

        const interests = value
            .split(",")
            .map(interest => interest.trim())
            .filter(interest => interest.length > 0);

        setProfile(prev => ({
            ...prev,
            interests
        }));
    }
    async function handleAddPost(text) {
        await createPost({
            type: "communityPost",
            title: text,
            description: "",
            text,
            author: {
                id: user.uid,
                name: user.displayName || user.name || "MOSAIQ User",
                email: user.email || "",
                avatar: user.photoURL || user.avatar || ""
            }
        });
    }

    async function handleDeletePost(id) {
        if (legacyPosts.some(post => post.id === id)) {
            setLegacyPosts(prev => prev.filter(post => post.id !== id));
            return;
        }

        await removePost(id);
    }

    function handleSaveProfile() {
        updateCurrentUser(profile);
        setIsEditing(false);
    }

    function handleCoverChange(imageUrl) {
        setProfile(prev => {
            const updated = {
                ...prev,
                coverImage: imageUrl
            };
            updateCurrentUser({ coverImage: imageUrl });
            return updated;
        });
    }

    function handleAvatarChange(imageUrl) {
        setProfile(prev => {
            const updated = {
                ...prev,
                avatar: imageUrl,
                profileImage: imageUrl
            };
            updateCurrentUser({ avatar: imageUrl, profileImage: imageUrl });
            return updated;
        });
    }

    function handleAddSkill(skill) {
        const normalizedSkill = skill.trim();

        if (!normalizedSkill) {
            return;
        }

        setProfile(prev => {
            const exists = prev.skills.some(
                existingSkill =>
                    existingSkill.toLowerCase() === normalizedSkill.toLowerCase()
            );

            if (exists) {
                return prev;
            }

            return {
                ...prev,
                skills: [...prev.skills, normalizedSkill]
            };
        });
    }

    function handleRemoveSkill(skillToRemove) {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(
                skill => skill !== skillToRemove
            )
        }));
    }

    function handleAddProject(project) {
        setProjects(prev => [
            ...prev,
            project
        ]);
    }

    function handleDeleteProject(id) {
        setProjects(prev =>
            prev.filter(project => project.id !== id)
        );
    }

    function handleAddExperience() {
        const role = window.prompt("Enter your role");

        if (!role) {
            return;
        }

        const company = window.prompt(
            "Enter company or organization"
        );

        if (!company) {
            return;
        }

        const duration = window.prompt(
            "Enter duration"
        );

        if (!duration) {
            return;
        }

        const description = window.prompt(
            "Enter description"
        );

        const newExperience = {
            id: Date.now(),
            role,
            company,
            duration,
            description: description || ""
        };

        setExperiences(prev => [
            ...prev,
            newExperience
        ]);
    }

    function handleDeleteExperience(id) {
        setExperiences(prev =>
            prev.filter(
                experience => experience.id !== id
            )
        );
    }

    function handleAddEducation(newEducation) {
        setEducation(prev => [
            ...prev,
            newEducation
        ]);
    }

    function handleDeleteEducation(id) {
        setEducation(prev =>
            prev.filter(item => item.id !== id)
        );
    }
    function handleAddConnection(connection) {
    setConnections(prev => [
        ...prev,
        connection
    ]);
}

function handleDeleteConnection(id) {
    setConnections(prev =>
        prev.filter(connection => connection.id !== id)
    );
}

    const stats = {
    projects: projects.length,
    connections: connections.length,
    profileViews: 0
};

if (!user) {
    return (
        <div className="profile-loading">
            Loading profile...
            </div>
        );
    }

    return (
        <div className="profile-page">
            <ProfileHeader
                user={user}
                profile={profile}
                edit={handleEdit}
                isEditing={isEditing}
                onCoverChange={handleCoverChange}
                onAvatarChange={handleAvatarChange}
            />

            <ProfileStats stats={stats} />

            <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === "Overview" && (
                <AboutSection profile={profile} />
            )}

            {activeTab === "Projects" && (
                <ProjectsSection
                    projects={projects}
                    onAdd={handleAddProject}
                    onDelete={handleDeleteProject}
                />
            )}

            {activeTab === "Skills" && (
                <SkillsSection
                    skills={profile.skills}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                />
            )}

            {activeTab === "Experience" && (
                <ExperienceSection
                    experiences={experiences}
                    onAdd={handleAddExperience}
                    onDelete={handleDeleteExperience}
                />
            )}

            {activeTab === "Education" && (
                <EducationSection
                    education={education}
                    onAdd={handleAddEducation}
                    onDelete={handleDeleteEducation}
                />
            )}

            {activeTab === "Connections" && (
    <ConnectionsSection
        connections={connections}
        onAdd={handleAddConnection}
        onDelete={handleDeleteConnection}
    />
)}

            {activeTab === "Activity" && (
    <PostsSection
        posts={posts}
        onAdd={handleAddPost}
        onDelete={handleDeletePost}
    />
)}

            {isEditing && (
                <EditProfileModal
                    profile={profile}
                    skillsInput={skillsInput}
                    interestsInput={interestsInput}
                    onChange={handleProfileChange}
                    onSkillsChange={handleSkillsChange}
                    onInterestsChange={handleInterestsChange}
                    onSave={handleSaveProfile}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}

export default Profile;
