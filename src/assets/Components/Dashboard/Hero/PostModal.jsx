import { useState } from "react";
import { extractRequiredSkills } from "../recommendationUtils";
import "./PostModal.css";
import { useUser } from "../../../../context/UserContext";
import { createPost } from "../../../../services/postsService";
import { useTranslation } from "react-i18next";
function PostModal({ onClose }) {
    const { t } = useTranslation();
    const { currentUser } = useUser();
    const [selecteddiv, setSeleectedDiv] = useState("shareProject");
    const [projectTitle, setProjectTitle] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [collaboratorData, setCollaboratorData] = useState({
        title: "",
        description: "",
        skillsNeeded: "",
        teamSize: "",
        collaborationType: ""
    });
    const [helpData, setHelpData] = useState({
        title: "",
        description: "",
        skills: "",
        availability: ""
    });
    const [needHelpData, setNeedHelpData] = useState({
        title: "",
        description: "",
        helpNeeded: "",
        urgency: "",
        helpFormat: ""
    });
    const projectTitleCharacters = projectTitle.trim().length;

    const projectDescriptionWords = projectDescription
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const descriptionWordLength = projectDescriptionWords.length;

    const titleInvalid =
        projectTitleCharacters < 10 || projectTitleCharacters > 100;

    const descriptionInvalid =
        descriptionWordLength < 50 || descriptionWordLength > 500;

    const handleProjectSubmit = (e) => {
        e.preventDefault();

        if (titleInvalid) {
            alert("Project title must contain between 10 and 100 characters.");
            return;
        }

        if (descriptionInvalid) {
            alert("Description must contain between 50 and 500 words.");
            return;
        }

        savePost({
            type: "shareProject",
            title: projectTitle,
            description: projectDescription
        });
    };

    const handleCollaboratorChange = (e) => {
        const { id, value } = e.target;

        setCollaboratorData((previous) => ({
            ...previous,
            [id]: value
        }));
    };
    const handleHelpChange = (e) => {

        const { id, value } = e.target;

        setHelpData((previous) => ({
            ...previous,
            [id]: value
        }));
    };
    const handleNeedHelpChange = (e) => {
        const { id, value } = e.target;
        setNeedHelpData((previous) => ({
            ...previous,
            [id]: value
        }));
    };
   
const savePost = async (postData) => {
    try {
        const newPost = {
            ...postData,
            detectedSkills: extractRequiredSkills(postData),
            author: {
                id: currentUser?.uid || currentUser?.id || "",
                name: currentUser?.displayName || currentUser?.name || "TalentForge User",
                email: currentUser?.email || "",
                avatar: currentUser?.photoURL || currentUser?.avatar || ""
            }
        };

        await createPost(newPost);

        alert("Your post has been created successfully!");
        onClose();
    } catch (error) {
        console.error("Failed to create TalentForge post:", error);
        alert(error.message || "Could not create your post. Please try again.");
    }
};


    const handleCollaboratorSubmit = (e) => {
        e.preventDefault();
        const parsedTeamSize = parseInt(collaboratorData.teamSize, 10);

        if (!collaboratorData.teamSize || Number.isNaN(parsedTeamSize) || parsedTeamSize < 1) {
            alert("Please enter a valid number of people needed (minimum 1).");
            return;
        }

        savePost({

            type: "findCollaborators",

            title: collaboratorData.title,

            description: collaboratorData.description,

            skillsNeeded: collaboratorData.skillsNeeded,

            teamSize: parsedTeamSize,

            collaborationType:
                collaboratorData.collaborationType
        });
    };
    const handleAvailableHelpSubmit = (e) => {

        e.preventDefault();

        savePost({

            type: "availableToHelp",

            title: helpData.title,

            description: helpData.description,

            skills: helpData.skills,

            availability: helpData.availability
        });
    };
    const handleNeedHelpSubmit = (e) => {

        e.preventDefault();

        savePost({

            type: "needHelp",

            title: needHelpData.title,

            description: needHelpData.description,

            helpNeeded: needHelpData.helpNeeded,

            urgency: needHelpData.urgency,

            helpFormat: needHelpData.helpFormat
        });
    };
    return (
        <div className="post-modal-overlay">
            <div className="post-modal">
                <div className="post-modal-header">
                    <div className="Heading">
                        <h1>{t("dashboard.postModal.title", "CREATE A POST")}</h1>
                        <p>{t("dashboard.postModal.subtitle", "Share what you're working on or what kind of collaboration you're looking for")}</p>
                    </div>
                    <button
                        type="button"
                        className="post-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className="post-modal-content">

                    <div className="tabs">
                        <div
                            className={
                                selecteddiv === "shareProject"
                                    ? "shareProject active"
                                    : "shareProject"
                            }
                            onClick={() =>
                                setSeleectedDiv("shareProject")
                            }
                        >
                            <i className="bi bi-pc-display-horizontal"></i>
                            <h1>{t("dashboard.postTypes.shareProject", "Share a Project")}</h1>
                            <p>{t("dashboard.postModal.tabShareProjectDesc", "Showcase your idea or project")}</p>
                        </div>

                        {/* FIND COLLABORATORS */}

                        <div
                            className={
                                selecteddiv === "findcollaborators"
                                    ? "findcollaborators active"
                                    : "findcollaborators"
                            }
                            onClick={() =>
                                setSeleectedDiv("findcollaborators")
                            }
                        >

                            <i className="bi bi-people-fill"></i>

                            <h1>{t("dashboard.postTypes.findCollaborators", "Find Collaborators")}</h1>

                            <p>{t("dashboard.postModal.tabFindCollaboratorsDesc", "Looking for people to work with?")}</p>

                        </div>


                        {/* AVAILABLE TO HELP */}

                        <div
                            className={
                                selecteddiv === "AvailableToHelp"
                                    ? "AvailableToHelp active"
                                    : "AvailableToHelp"
                            }
                            onClick={() =>
                                setSeleectedDiv("AvailableToHelp")
                            }
                        >

                            <i className="bi bi-calendar-day-fill"></i>

                            <h1>{t("dashboard.postTypes.availableToHelp", "Available to Help")}</h1>

                            <p>{t("dashboard.postModal.tabAvailableToHelpDesc", "Let others know you're free")}</p>

                        </div>


                        {/* NEED HELP */}

                        <div
                            className={
                                selecteddiv === "NeedHelp"
                                    ? "NeedHelp active"
                                    : "NeedHelp"
                            }
                            onClick={() =>
                                setSeleectedDiv("NeedHelp")
                            }
                        >

                            <i className="bi bi-person-fill"></i>

                            <h1>{t("dashboard.postTypes.needHelp", "Need Help")}</h1>

                            <p>{t("dashboard.postModal.tabNeedHelpDesc", "Get support from the community")}</p>

                        </div>

                    </div>



                    <div className="post-form">


                        {/* SHARE PROJECT */}

                        {selecteddiv === "shareProject" && (

                            <form onSubmit={handleProjectSubmit}>

                                <label htmlFor="TITLE">
                                    TITLE
                                </label>

                                <textarea
                                    id="TITLE"
                                    className="titles"
                                    value={projectTitle}
                                    onChange={(e) =>
                                        setProjectTitle(e.target.value)
                                    }
                                    placeholder="Give your post a short clear title..."
                                    required
                                />

                                <div>
                                    <span>
                                        Characters: {projectTitleCharacters}
                                    </span>

                                    {projectTitle && titleInvalid && (

                                        <span style={{ color: "red" }}>

                                            {projectTitleCharacters < 10
                                                ? " Too short (min 10 characters)"
                                                : " Too long (max 100 characters)"}

                                        </span>
                                    )}
                                </div>


                                <label htmlFor="DESCRIPTION">
                                    DESCRIPTION
                                </label>

                                <textarea
                                    id="DESCRIPTION"
                                    className="desc"
                                    value={projectDescription}
                                    onChange={(e) =>
                                        setProjectDescription(e.target.value)
                                    }
                                    placeholder="Tell us more about your project, what you're looking for, your skills, timeline etc..."
                                    required
                                />

                                <div>

                                    <span>
                                        Words: {descriptionWordLength}
                                    </span>

                                    {projectDescription &&
                                        descriptionInvalid && (

                                            <span
                                                style={{
                                                    color: "red"
                                                }}
                                            >

                                                {descriptionWordLength < 50
                                                    ? " Too short (min 50)"
                                                    : " Too long (max 500)"}

                                            </span>
                                        )}

                                </div>


                                <button
                                    disabled={
                                        titleInvalid ||
                                        descriptionInvalid
                                    }
                                    type="submit"
                                >
                                    Post Project
                                </button>

                            </form>
                        )}


                        {/* FIND COLLABORATORS */}

                        {selecteddiv === "findcollaborators" && (

                            <form
                                className="collaborator-form"
                                onSubmit={handleCollaboratorSubmit}
                            >

                                <h2>Find Collaborators</h2>

                                <p>
                                    Tell the community about your project
                                    and the kind of collaborators you're
                                    looking for.
                                </p>


                                <label htmlFor="title">
                                    TITLE
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    value={collaboratorData.title}
                                    onChange={handleCollaboratorChange}
                                    placeholder="What are you looking for?"
                                    required
                                />


                                <label htmlFor="description">
                                    PROJECT DESCRIPTION
                                </label>

                                <textarea
                                    id="description"
                                    value={collaboratorData.description}
                                    onChange={handleCollaboratorChange}
                                    placeholder="Describe your project, what you're building, and why you need collaborators..."
                                    required
                                />


                                <label htmlFor="skillsNeeded">
                                    SKILLS NEEDED
                                </label>

                                <input
                                    id="skillsNeeded"
                                    type="text"
                                    value={collaboratorData.skillsNeeded}
                                    onChange={handleCollaboratorChange}
                                    placeholder="e.g. React, UI/UX, Python, Java..."
                                    required
                                />


                                <label htmlFor="teamSize">
                                    PEOPLE NEEDED
                                </label>

                                <input
                                    id="teamSize"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={collaboratorData.teamSize}
                                    onChange={handleCollaboratorChange}
                                    placeholder="e.g. 2"
                                    required
                                />


                                <label htmlFor="collaborationType">
                                    COLLABORATION TYPE
                                </label>

                                <select
                                    id="collaborationType"
                                    value={collaboratorData.collaborationType}
                                    onChange={handleCollaboratorChange}
                                    required
                                >

                                    <option value="">
                                        Select collaboration type
                                    </option>

                                    <option value="project">
                                        Project based
                                    </option>

                                    <option value="long-term">
                                        Long term
                                    </option>

                                    <option value="weekend">
                                        Weekend project
                                    </option>

                                    <option value="learning">
                                        Learning together
                                    </option>

                                </select>


                                <button type="submit">
                                    Find Collaborators
                                </button>

                            </form>
                        )}


                        {/* AVAILABLE TO HELP */}

                        {selecteddiv === "AvailableToHelp" && (

                            <form
                                className="available-help-form"
                                onSubmit={handleAvailableHelpSubmit}
                            >

                                <h2>Available to Help</h2>

                                <p>
                                    Let others know what you can help with
                                    and when you're available.
                                </p>


                                <label htmlFor="title">
                                    TITLE
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    value={helpData.title}
                                    onChange={handleHelpChange}
                                    placeholder="What can you help with?"
                                    required
                                />


                                <label htmlFor="description">
                                    ABOUT YOUR HELP
                                </label>

                                <textarea
                                    id="description"
                                    value={helpData.description}
                                    onChange={handleHelpChange}
                                    placeholder="Tell people about your skills and the kind of help you can provide..."
                                    required
                                />


                                <label htmlFor="skills">
                                    SKILLS
                                </label>

                                <input
                                    id="skills"
                                    type="text"
                                    value={helpData.skills}
                                    onChange={handleHelpChange}
                                    placeholder="e.g. React, Java, UI/UX..."
                                    required
                                />


                                <label htmlFor="availability">
                                    AVAILABILITY
                                </label>

                                <select
                                    id="availability"
                                    value={helpData.availability}
                                    onChange={handleHelpChange}
                                    required
                                >

                                    <option value="">
                                        When are you available?
                                    </option>

                                    <option value="weekends">
                                        Weekends
                                    </option>

                                    <option value="weekdays">
                                        Weekdays
                                    </option>

                                    <option value="evenings">
                                        Evenings
                                    </option>

                                    <option value="flexible">
                                        Flexible
                                    </option>

                                </select>


                                <button type="submit">
                                    Post Availability
                                </button>

                            </form>
                        )}
                        {selecteddiv === "NeedHelp" && (

                            <form
                                className="need-help-form"
                                onSubmit={handleNeedHelpSubmit}
                            >

                                <h2>Need Help</h2>

                                <p>
                                    Tell the community what you need help
                                    with and find someone who can support
                                    your project.
                                </p>


                                <label htmlFor="title">
                                    TITLE
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    value={needHelpData.title}
                                    onChange={handleNeedHelpChange}
                                    placeholder="What do you need help with?"
                                    required
                                />


                                <label htmlFor="description">
                                    WHAT DO YOU NEED?
                                </label>

                                <textarea
                                    id="description"
                                    value={needHelpData.description}
                                    onChange={handleNeedHelpChange}
                                    placeholder="Describe the problem, task, or area where you need help..."
                                    required
                                />


                                <label htmlFor="helpNeeded">
                                    HELP NEEDED
                                </label>

                                <input
                                    id="helpNeeded"
                                    type="text"
                                    value={needHelpData.helpNeeded}
                                    onChange={handleNeedHelpChange}
                                    placeholder="e.g. React debugging, UI design, Python..."
                                    required
                                />


                                <label htmlFor="urgency">
                                    URGENCY
                                </label>

                                <select
                                    id="urgency"
                                    value={needHelpData.urgency}
                                    onChange={handleNeedHelpChange}
                                    required
                                >

                                    <option value="">
                                        How urgent is this?
                                    </option>

                                    <option value="low">
                                        Not urgent
                                    </option>

                                    <option value="medium">
                                        Needed soon
                                    </option>

                                    <option value="high">
                                        Urgent
                                    </option>

                                </select>


                                <label htmlFor="helpFormat">
                                    HELP FORMAT
                                </label>

                                <select
                                    id="helpFormat"
                                    value={needHelpData.helpFormat}
                                    onChange={handleNeedHelpChange}
                                    required
                                >

                                    <option value="">
                                        How would you like help?
                                    </option>

                                    <option value="chat">
                                        Chat / Discussion
                                    </option>

                                    <option value="call">
                                        Call / Meeting
                                    </option>

                                    <option value="collaboration">
                                        Work together
                                    </option>

                                    <option value="review">
                                        Review / Feedback
                                    </option>

                                </select>


                                <button type="submit">
                                    Post Help Request
                                </button>

                            </form>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default PostModal;
