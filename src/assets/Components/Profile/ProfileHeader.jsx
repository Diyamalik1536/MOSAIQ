import "./ProfileHeader.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ProfileHeader({ user, profile, edit, isEditing, onCoverChange, onAvatarChange }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    function handleCoverChange(e) {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            window.alert("Please select a valid image file (JPG, PNG, WEBP).");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            window.alert("Cover image size exceeds 5 MB. Please choose a smaller image.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 450;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                if (height > MAX_HEIGHT) {
                    width = Math.round((width * MAX_HEIGHT) / height);
                    height = MAX_HEIGHT;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressedUrl = canvas.toDataURL("image/jpeg", 0.75);
                onCoverChange(compressedUrl);
            };
            img.onerror = () => {
                onCoverChange(event.target.result);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    }

    function handleAvatarChange(e) {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            window.alert("Please select a valid image file (JPG, PNG, WEBP).");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            window.alert("Profile picture size exceeds 5 MB. Please choose a smaller image.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const SIZE = 300;
                canvas.width = SIZE;
                canvas.height = SIZE;

                const ctx = canvas.getContext("2d");

                // Crop and center image in 1:1 ratio
                let srcX = 0;
                let srcY = 0;
                let srcWidth = img.width;
                let srcHeight = img.height;

                if (img.width > img.height) {
                    srcWidth = img.height;
                    srcX = (img.width - img.height) / 2;
                } else if (img.height > img.width) {
                    srcHeight = img.width;
                    srcY = (img.height - img.width) / 2;
                }

                ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, SIZE, SIZE);

                const compressedUrl = canvas.toDataURL("image/jpeg", 0.85);
                if (typeof onAvatarChange === "function") {
                    onAvatarChange(compressedUrl);
                }
            };
            img.onerror = () => {
                if (typeof onAvatarChange === "function") {
                    onAvatarChange(event.target.result);
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    }

    const currentCover = profile?.coverImage || user?.coverImage;
    const currentAvatar = profile?.avatar || user?.avatar || profile?.profileImage || user?.profileImage;

    return (
        <section className="profile-header">
            <div className="profile-cover">
                {currentCover ? (
                    <img src={currentCover} alt="Profile cover" />
                ) : (
                    <div className="profile-cover-placeholder"></div>
                )}

                <label className="profile-cover-edit">
                    <i className="bi bi-camera-fill"></i>
                    {t("profile.changeCover", "Change Cover")}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                    />
                </label>
            </div>

            <div className="profile-main">
                <label className="profile-image profile-image-clickable" title={t("profile.clickUploadAvatar", "Click to upload profile picture")}>
                    {currentAvatar ? (
                        <img src={currentAvatar} alt={user?.name || "Profile"} />
                    ) : (
                        <div className="profile-image-placeholder">
                            <i className="bi bi-person"></i>
                        </div>
                    )}
                    <div className="profile-avatar-overlay">
                        <i className="bi bi-camera-fill"></i>
                        <span>{t("profile.edit", "Edit")}</span>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                    />
                </label>

                <div className="profile-information">
                    <div className="profile-name">
                        <h1>{user?.name || "Your Name"}</h1>

                        {profile.isVerified && (
                            <span className="verified-badge" title={t("profile.verifiedMember", "Verified MOSAIQ Member")}>
                                <i className="bi bi-patch-check-fill"></i>
                            </span>
                        )}
                    </div>

                    {profile.role && (
                        <p className="profile-role">{profile.role}</p>
                    )}

                    <div className="profile-meta">
                        {profile.university && (
                            <span>
                                <i className="bi bi-mortarboard"></i>
                                {profile.university}
                            </span>
                        )}

                        {profile.year && (
                            <span>
                                <i className="bi bi-calendar3"></i>
                                {profile.year}
                            </span>
                        )}

                        {profile.location && (
                            <span>
                                <i className="bi bi-geo-alt"></i>
                                {profile.location}
                            </span>
                        )}

                    </div>

                    {profile.headline && (
                        <p className="profile-headline">
                            {profile.headline}
                        </p>
                    )}

                    {profile.about && (
                        <div className="profile-about">
                            <p>{profile.about}</p>
                        </div>
                    )}

                    {profile.tags && profile.tags.length > 0 && (
                        <div className="profile-tags">
                            {profile.tags.map((tag, index) => (
                                <span key={index}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="profile-actions">
                    {isEditing ? (
                        <button
                            className="profile-action-button"
                            onClick={edit}
                        >
                            <i className="bi bi-check-lg"></i>
                            {t("profile.saveProfile", "Save Profile")}
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="profile-action-button secondary"
                                onClick={() => navigate("/resume-builder")}
                                title={t("profile.resumeBuilder", "Resume Builder")}
                            >
                                <i className="bi bi-file-earmark-richtext"></i>
                                {t("profile.resumeBuilder", "Resume Builder")}
                            </button>

                            <button className="profile-action-button secondary">
                                <i className="bi bi-share"></i>
                                {t("profile.shareProfile", "Share Profile")}
                            </button>

                            <button
                                className="profile-action-button"
                                onClick={edit}
                            >
                                <i className="bi bi-pencil"></i>
                                {t("profile.editProfile", "Edit Profile")}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

export default ProfileHeader;
