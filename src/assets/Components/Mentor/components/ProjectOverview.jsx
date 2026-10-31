import { ProjectMark } from "./shared";

function ProjectOverview({ project, onNotify }) {
    return (
        <section className="surface-card project-overview">
            <div className="card-heading"><div><h2>Project overview</h2><p>Submission details and project information</p></div><span className="version-pill">{project.version}</span></div>
            <div className="project-preview"><ProjectMark color={project.color} /><div><strong>{project.title}</strong><span>{project.category} project · {project.members} team members</span></div></div>
            <div className="detail-grid">
                <div><span>Student</span><strong>{project.student}</strong></div>
                <div><span>Submission</span><strong>{project.version}</strong></div>
                <div><span>Submitted</span><strong>Today, 9:42 AM</strong></div>
                {project.reviewEstimate && <div><span>Review estimate</span><strong>{project.reviewEstimate}</strong></div>}
            </div>
            <div className="overview-section"><h3>About this project</h3><p>{project.title} is a student-led {project.category} project designed to solve real-world challenges through thoughtful research, clear technical decisions, and a user-focused solution.</p></div>
            <div className="overview-section">
                <h3>Project files</h3>
                <button className="file-row" onClick={() => onNotify("Project report preview opened.")}>
                    <span className="file-icon">▤</span>
                    <span><strong>Project report.pdf</strong><small>PDF document · 2.4 MB</small></span>
                    <span className="file-action">↗</span>
                </button>
            </div>
            <div className="overview-section"><h3>Team members <span className="muted">({project.members})</span></h3><div className="team-avatars"><span>MR</span><span>AS</span><span>NK</span><small>+{Math.max(0, project.members - 3)} members</small></div></div>
        </section>
    );
}

export default ProjectOverview;
