import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentById } from "../BrowseStudents/studentUtils";
import { useApplications } from "../../../../context/ApplicationContext";
import { useUser } from "../../../../context/UserContext";
import { calculateMatchScore } from "../BrowseStudents/matchUtils";
import { useTranslation } from "react-i18next";
import "./ApplicationDetailsModal.css";

function formatAvailability(value) {
    return String(value || "Not provided").replaceAll("_", " ");
}

function ApplicationDetailsModal({ applicationId, onClose }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { applications, projects, acceptApplication, declineApplication } = useApplications();
    const { currentUser } = useUser();
    const [outcome, setOutcome] = useState(null);
    const [showTeam, setShowTeam] = useState(false);
    const application = applications.find((item) => item.id === applicationId);
    const applicant = getStudentById(application?.applicantId);
    const project = projects.find((item) => item.id === application?.projectId);
    const profileMatch = applicant ? calculateMatchScore(currentUser || {}, applicant) : 0;

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleAccept = () => {
        const response = acceptApplication(applicationId);
        setOutcome(response);
    };

    const handleDecline = () => {
        const response = declineApplication(applicationId);
        setOutcome(response);
    };

    const goToStudent = () => {
        onClose();
        navigate("/students", { state: { search: applicant?.name || "" } });
    };

    const openMessage = () => {
        if (applicant?.email) window.location.href = `mailto:${applicant.email}`;
    };

    const isAccepted = application?.status === "accepted" || outcome?.result === "accepted" || outcome?.result === "already-accepted";
    const isDeclined = application?.status === "declined" || outcome?.result === "declined" || outcome?.result === "already-declined";

    if (!application || !applicant || !project) {
        return (
            <div className="application-modal-overlay" onMouseDown={onClose}>
                <section className="application-modal application-fallback" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                    <button className="application-close" onClick={onClose} aria-label={t("applications.close", "Close")}><i className="bi bi-x-lg" /></button>
                    <i className="bi bi-exclamation-circle" />
                    <h2>{t("applications.applicantUnavailable", "Applicant information is unavailable.")}</h2>
                    <p>This application may have been removed or contains incomplete information.</p>
                    <button className="application-button primary" onClick={onClose}>{t("applications.close", "Close")}</button>
                </section>
            </div>
        );
    }

    if (isAccepted || isDeclined) {
        const alreadyAccepted = application.status === "accepted" || outcome?.result === "already-accepted";
        return (
            <div className="application-modal-overlay" onMouseDown={onClose}>
                <section className="application-modal application-result" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="application-result-title">
                    <button className="application-close" onClick={onClose} aria-label={t("applications.close", "Close")}><i className="bi bi-x-lg" /></button>
                    <div className={`result-icon ${isAccepted ? "accepted" : "declined"}`}><i className={`bi ${isAccepted ? "bi-check-lg" : "bi-x-lg"}`} /></div>
                    <h2 id="application-result-title">{isAccepted ? (alreadyAccepted ? "Application Already Accepted" : "Application Accepted!") : "Application Declined"}</h2>
                    <p>{isAccepted ? `${applicant.name} ${alreadyAccepted ? "is already a member of this project." : "has been added to your project team."}` : `${applicant.name}'s application has been declined.`}</p>
                    {isAccepted && <span className="result-role">{application.role}</span>}
                    <div className="application-actions result-actions">
                        {isAccepted && <button className="application-button secondary" onClick={() => setShowTeam(true)}>{t("applications.viewProjectTeam", "View Project Team")}</button>}
                        <button className="application-button primary" onClick={onClose}>{t("applications.close", "Close")}</button>
                    </div>
                    {showTeam && <ProjectTeam project={project} onBack={() => setShowTeam(false)} />}
                </section>
            </div>
        );
    }

    return (
        <div className="application-modal-overlay" onMouseDown={onClose}>
            <section className="application-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="application-title">
                <header className="application-modal-header">
                    <div><p>PROJECT APPLICATION</p><h2 id="application-title">Application Details</h2></div>
                    <button className="application-close" onClick={onClose} aria-label={t("applications.close", "Close")}><i className="bi bi-x-lg" /></button>
                </header>
                <div className="application-modal-body">
                    <div className="applicant-summary">
                        <img src={applicant.avatar} alt="" />
                        <div><h3>{applicant.name} <i className="bi bi-patch-check-fill" /></h3><p>{applicant.year} · {applicant.major}</p><p>{applicant.college}</p></div>
                        <span className="application-match"><i className="bi bi-stars" /> {profileMatch}% Profile Match</span>
                    </div>
                    <div className="application-info-grid">
                        <Info label="Applied For" value={application.role} />
                        <Info label="Project" value={project?.name || "Project not found"} />
                        <Info label="Status" value={<span className="application-status pending">{application.status}</span>} />
                        <Info label="Applied" value="10 minutes ago" />
                    </div>
                    <section className="application-section"><h4>Skills</h4><div className="application-skills">{applicant.skills?.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
                    <section className="application-section"><h4>Why I want to join</h4><p className="application-message">{application.message || "No message was supplied with this application."}</p></section>
                    <section className="application-section application-availability"><h4>Availability</h4><span><i className="bi bi-calendar3" /> {formatAvailability(applicant.availability)}</span></section>
                    {(applicant.github || applicant.linkedin || applicant.portfolio) && <section className="application-section"><h4>Links</h4><div className="application-links">{applicant.github && <a href={applicant.github} target="_blank" rel="noreferrer">GitHub <i className="bi bi-box-arrow-up-right" /></a>}{applicant.linkedin && <a href={applicant.linkedin} target="_blank" rel="noreferrer">LinkedIn <i className="bi bi-box-arrow-up-right" /></a>}{applicant.portfolio && <a href={applicant.portfolio} target="_blank" rel="noreferrer">Portfolio <i className="bi bi-box-arrow-up-right" /></a>}</div></section>}
                </div>
                <footer className="application-actions">
                    <button className="application-button secondary" onClick={goToStudent}>{t("applications.viewFullProfile", "View Full Profile")}</button>
                    <button className="application-button secondary" onClick={openMessage}>{t("applications.message", "Message")}</button>
                    <button className="application-button accept" onClick={handleAccept}><i className="bi bi-check-lg" /> {t("applications.acceptApplication", "Accept Application")}</button>
                    <button className="application-button decline" onClick={handleDecline}><i className="bi bi-x-lg" /> {t("applications.decline", "Decline")}</button>
                </footer>
            </section>
        </div>
    );
}

function Info({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div>; }

function ProjectTeam({ project, onBack }) {
    if (!project) {
        return <div className="project-team-panel"><p>Project details are no longer available.</p></div>;
    }
    return (
        <div className="project-team-panel">
            <div className="project-team-header">
                <div>
                    <p>PROJECT TEAM</p>
                    <h3>{project.name}</h3>
                </div>
                <button onClick={onBack} aria-label="Back"><i className="bi bi-arrow-left" /></button>
            </div>
            {project.team.map((member) => {
                const student = getStudentById(member.applicantId);
                return (
                    <div className="team-member" key={member.applicantId}>
                        {student?.avatar ? <img src={student.avatar} alt="" /> : <i className="bi bi-person-circle" />}
                        <div>
                            <strong>{student?.name || "Team member"}</strong>
                            <span>{member.role}</span>
                        </div>
                        <em>{member.status}</em>
                    </div>
                );
            })}
        </div>
    );
}

export default ApplicationDetailsModal;
