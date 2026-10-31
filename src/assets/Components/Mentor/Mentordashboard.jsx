
import { useMemo, useState } from "react";
import AnalyticsPage from "./pages/AnalyticsPage";
import CoursesPage from "./pages/CoursesPage";
import EvaluationWorkspace from "./pages/EvaluationWorkspace";
import MessagesPage from "./pages/MessagesPage";
import MeetingsPage from "./pages/MeetingsPage";
import OverviewPage from "./pages/OverviewPage";
import ReportsPage from "./pages/ReportsPage";
import ReviewQueuePage from "./pages/ReviewQueuePage";
import RubricsPage from "./pages/RubricsPage";
import SettingsPage from "./pages/SettingsPage";
import StudentsPage from "./pages/StudentsPage";
import TeamsPage from "./pages/TeamsPage";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardTopbar from "./components/DashboardTopbar";
import Toast from "./components/Toast";
import { defaultRatings, initialProjects } from "./data/dashboardData";
import "./Mentordashboard.css";

function MentorDashboard() {
    const [today] = useState(() => new Date());
    const [projects, setProjects] = useState(initialProjects);
    const [activePage, setActivePage] = useState("Overview");
    const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0].id);
    const [search, setSearch] = useState("");
    const [queueTab, setQueueTab] = useState("All");
    const [ratings, setRatings] = useState(defaultRatings);
    const [feedback, setFeedback] = useState("");
    const [drafts, setDrafts] = useState({});
    const [toast, setToast] = useState("");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [messageDraft, setMessageDraft] = useState("");
    const [preferences, setPreferences] = useState({
        reviewAlerts: true,
        weeklySummary: true,
        showcaseUpdates: false
    });

    const selectedProject =
        projects.find((project) => project.id === selectedProjectId) ?? projects[0];

    const pendingCount = projects.filter(
        (project) => project.status === "Pending"
    ).length;

    const filteredProjects = useMemo(
        () =>
            projects.filter((project) => {
                const matchesSearch = `${project.title} ${project.student} ${project.category}`
                    .toLowerCase()
                    .includes(search.toLowerCase());

                const matchesTab =
                    queueTab === "All" ||
                    (queueTab === "Pending" && project.status === "Pending") ||
                    (queueTab === "Completed" && project.status === "Completed");

                return matchesSearch && matchesTab;
            }),
        [projects, search, queueTab]
    );

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(""), 3000);
    };

    const changePage = (page) => {
        setActivePage(page);
        setMobileNavOpen(false);

        if (page === "My Reviews") {
            setQueueTab("Completed");
        } else if (page === "Review Queue" || page === "Assignments") {
            setQueueTab("Pending");
        } else {
            setQueueTab("All");
        }
    };

    const openReview = (projectId) => {
        setSelectedProjectId(projectId);
        setRatings(drafts[projectId]?.ratings ?? defaultRatings);
        setFeedback(drafts[projectId]?.feedback ?? "");
        setActivePage("Workspace");
        setMobileNavOpen(false);
    };

    const saveDraft = () => {
        setDrafts((current) => ({
            ...current,
            [selectedProjectId]: { ratings, feedback }
        }));

        showToast("Draft saved. You can continue this evaluation later.");
    };

    const submitEvaluation = () => {
        setProjects((current) =>
            current.map((project) =>
                project.id === selectedProjectId
                    ? { ...project, status: "Completed" }
                    : project
            )
        );

        setDrafts((current) => {
            const remainingDrafts = { ...current };
            delete remainingDrafts[selectedProjectId];
            return remainingDrafts;
        });

        showToast(`Evaluation for ${selectedProject.title} submitted successfully.`);
        changePage("My Reviews");
    };

    const renderPage = () => {
        if (activePage === "Overview") {
            return (
                <OverviewPage
                    today={today}
                    projects={projects}
                    onChangePage={changePage}
                    onOpenReview={openReview}
                    onNotify={showToast}
                />
            );
        }

        if (activePage === "Workspace") {
            return (
                <EvaluationWorkspace
                    project={selectedProject}
                    ratings={ratings}
                    onRatingsChange={setRatings}
                    feedback={feedback}
                    onFeedbackChange={setFeedback}
                    onBack={() => changePage("Review Queue")}
                    onNotify={showToast}
                    onSaveDraft={saveDraft}
                    onSubmit={submitEvaluation}
                />
            );
        }

        if (activePage === "Meetings") {
            return <MeetingsPage onNotify={showToast} />;
        }

        if (["Review Queue", "Assignments", "My Reviews"].includes(activePage)) {
            return (
                <ReviewQueuePage
                    projects={projects}
                    activePage={activePage}
                    queueTab={queueTab}
                    onQueueTabChange={setQueueTab}
                    search={search}
                    onSearchChange={setSearch}
                    filteredProjects={filteredProjects}
                    onOpenReview={openReview}
                    onNotify={showToast}
                />
            );
        }

        if (activePage === "Students") {
            return (
                <StudentsPage
                    projects={projects}
                    search={search}
                    onSearchChange={setSearch}
                    onOpenReview={openReview}
                    onNotify={showToast}
                />
            );
        }

        if (activePage === "Analytics" || activePage === "Skill Insights") {
            return <AnalyticsPage activePage={activePage} onNotify={showToast} />;
        }

        if (activePage === "Projects") {
            return (
                <CoursesPage
                    projects={projects}
                    onChangePage={changePage}
                    onOpenReview={openReview}
                    onNotify={showToast}
                />
            );
        }

        if (activePage === "Messages") {
            return (
                <MessagesPage
                    projects={projects}
                    messageDraft={messageDraft}
                    onMessageChange={setMessageDraft}
                    onNotify={showToast}
                />
            );
        }

        if (activePage === "Rubrics") {
            return <RubricsPage onChangePage={changePage} onNotify={showToast} />;
        }

        if (activePage === "Settings") {
            return (
                <SettingsPage
                    preferences={preferences}
                    onPreferencesChange={setPreferences}
                    onNotify={showToast}
                />
            );
        }

        if (activePage === "Reports") {
            return <ReportsPage projects={projects} />;
        }

        return (
            <TeamsPage
                projects={projects}
                onOpenReview={openReview}
                onNotify={showToast}
            />
        );
    };

    const dateLabel = new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric"
    }).format(today);

    return (
        <div className="mentor-app">
            <DashboardSidebar
                activePage={activePage}
                pendingCount={pendingCount}
                mobileNavOpen={mobileNavOpen}
                onChangePage={changePage}
                onClose={() => setMobileNavOpen(false)}
            />

            <div className="app-content">
                <DashboardTopbar
                    search={search}
                    onSearchChange={setSearch}
                    notificationsOpen={notificationsOpen}
                    profileOpen={profileOpen}
                    onToggleNotifications={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setProfileOpen(false);
                    }}
                    onToggleProfile={() => {
                        setProfileOpen(!profileOpen);
                        setNotificationsOpen(false);
                    }}
                    onMarkNotificationsRead={() => {
                        setNotificationsOpen(false);
                        showToast("All caught up!");
                    }}
                    onOpenSettings={() => {
                        setProfileOpen(false);
                        showToast("Profile settings opened.");
                    }}
                    onOpenMobileNav={() => setMobileNavOpen(true)}
                />

                <main
                    className="main-content"
                    onClick={() => {
                        if (notificationsOpen) setNotificationsOpen(false);
                        if (profileOpen) setProfileOpen(false);
                    }}
                >
                    <div className="content-inner" key={activePage}>
                        {activePage !== "Overview" &&
                            activePage !== "Workspace" && (
                                <span className="current-date">{dateLabel}</span>
                            )}

                        {renderPage()}
                    </div>
                </main>
            </div>

            <Toast message={toast} onDismiss={() => setToast("")} />
        </div>
    );
}

export default MentorDashboard;
