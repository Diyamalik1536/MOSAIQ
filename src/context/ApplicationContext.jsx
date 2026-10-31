import { createContext, useContext, useEffect, useState } from "react";
import { getStudentById } from "../assets/Components/Dashboard/BrowseStudents/studentUtils";
import { useNotifications } from "./NotificationContext";
import { useUser } from "./UserContext";
import ApplicationDetailsModal from "../assets/Components/Dashboard/Applications/ApplicationDetailsModal";

const ApplicationContext = createContext();
const STORAGE_PREFIX_APPS = "talentforge_applications_v1";
const STORAGE_PREFIX_PROJECTS = "talentforge_application_projects_v1";

const initialApplications = [{
    id: "app_001",
    applicantId: "stu_006",
    projectId: "project_001",
    listingId: "listing_001",
    role: "Senior Frontend Developer",
    message: "I am excited by the opportunity to help build a polished, accessible platform for the campus hackathon. My React and Node.js experience would let me contribute from day one.",
    status: "pending",
    createdAt: "2026-09-17T09:50:00.000Z"
}];

const initialProjects = [{
    id: "project_001",
    listingId: "listing_001",
    name: "Campus Hackathon Platform",
    team: [{ applicantId: "stu_001", role: "Project Owner", status: "active" }]
}];

function getUserKey(user) {
    return user?.uid || user?.id || user?.email || "guest";
}

function readStored(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : fallback;
    } catch {
        return fallback;
    }
}

function ApplicationStore({ appsKey, projectsKey, children }) {
    const { addNotification } = useNotifications();
    const [applications, setApplications] = useState(() => readStored(appsKey, initialApplications));
    const [projects, setProjects] = useState(() => readStored(projectsKey, initialProjects));
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);

    useEffect(() => {
        try {
            localStorage.setItem(appsKey, JSON.stringify(applications));
        } catch (e) {
            console.error("Failed to save applications to localStorage:", e);
        }
    }, [applications, appsKey]);

    useEffect(() => {
        try {
            localStorage.setItem(projectsKey, JSON.stringify(projects));
        } catch (e) {
            console.error("Failed to save projects to localStorage:", e);
        }
    }, [projects, projectsKey]);

    const openApplication = (applicationId) => setSelectedApplicationId(applicationId || null);
    const closeApplication = () => setSelectedApplicationId(null);

    const acceptApplication = (applicationId) => {
        const application = applications.find((item) => item.id === applicationId);
        if (!application) return { result: "missing" };
        if (application.status === "declined") return { result: "declined" };

        const project = projects.find((item) => item.id === application.projectId);
        const applicant = getStudentById(application.applicantId);
        if (!project || !applicant) return { result: "missing" };

        const alreadyMember = project.team.some((member) => member.applicantId === application.applicantId);
        if (application.status === "accepted" || alreadyMember) {
            if (application.status !== "accepted") {
                setApplications((current) => current.map((item) => item.id === applicationId ? { ...item, status: "accepted" } : item));
            }
            return { result: "already-accepted", application, project, applicant };
        }

        const acceptedApplication = { ...application, status: "accepted" };
        const updatedProject = {
            ...project,
            team: [...project.team, { applicantId: application.applicantId, role: application.role, status: "active" }]
        };
        setApplications((current) => current.map((item) => item.id === applicationId ? acceptedApplication : item));
        setProjects((current) => current.map((item) => item.id === project.id ? updatedProject : item));
        addNotification({
            id: `accepted-${applicationId}`,
            title: "Application Accepted",
            message: `You accepted ${applicant.name}'s application. They have been added to your project team.`,
            type: "applications",
            timestamp: "Just now",
            read: false,
            applicationId,
            user: { name: applicant.name, role: application.role }
        });
        return { result: "accepted", application: acceptedApplication, project: updatedProject, applicant };
    };

    const declineApplication = (applicationId) => {
        const application = applications.find((item) => item.id === applicationId);
        if (!application) return { result: "missing" };
        if (application.status === "accepted") return { result: "accepted" };
        if (application.status === "declined") return { result: "already-declined", application };
        const declinedApplication = { ...application, status: "declined" };
        setApplications((current) => current.map((item) => item.id === applicationId ? declinedApplication : item));
        return { result: "declined", application: declinedApplication, applicant: getStudentById(application.applicantId) };
    };

    const value = { applications, projects, openApplication, closeApplication, acceptApplication, declineApplication };

    return (
        <ApplicationContext.Provider value={value}>
            {children}
            {selectedApplicationId && <ApplicationDetailsModal applicationId={selectedApplicationId} onClose={closeApplication} />}
        </ApplicationContext.Provider>
    );
}

export function ApplicationProvider({ children }) {
    const { currentUser } = useUser();
    const userKey = getUserKey(currentUser);
    const appsKey = `${STORAGE_PREFIX_APPS}_${userKey}`;
    const projectsKey = `${STORAGE_PREFIX_PROJECTS}_${userKey}`;

    return (
        <ApplicationStore key={userKey} appsKey={appsKey} projectsKey={projectsKey}>
            {children}
        </ApplicationStore>
    );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useApplications() {
    const context = useContext(ApplicationContext);
    if (!context) throw new Error("useApplications must be used within an ApplicationProvider");
    return context;
}
