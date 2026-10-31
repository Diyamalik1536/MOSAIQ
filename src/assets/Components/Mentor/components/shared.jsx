import { activities } from "../data/dashboardData";

export function ActionButton({ children, onClick, variant = "primary", className = "", type = "button" }) {
    return <button className={`button button--${variant} ${className}`} onClick={onClick} type={type}>{children}</button>;
}

export function ProjectMark({ color = "lavender", compact = false }) {
    return <span className={`project-mark project-mark--${color}${compact ? " project-mark--compact" : ""}`} aria-hidden="true">✳</span>;
}

export function SectionHeading({ eyebrow, title, description, action }) {
    return (
        <div className="section-heading">
            <div>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function MetricCard({ icon, label, value, detail, tone }) {
    return (
        <article className="metric-card">
            <span className={`metric-card__icon metric-card__icon--${tone}`} aria-hidden="true">{icon}</span>
            <div className="metric-card__body">
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{detail}</small>
            </div>
            <span className="metric-card__trend" aria-hidden="true">↗</span>
        </article>
    );
}

export function ProjectCard({ project, onReview, compact = false }) {
    return (
        <article className={`project-card${compact ? " project-card--compact" : ""}`}>
            <ProjectMark color={project.color} compact={compact} />
            <div className="project-card__info">
                <div className="project-card__title-line">
                    <h3>{project.title}</h3>
                    {project.status === "Completed" && <span className="status-pill status-pill--complete">Completed</span>}
                </div>
                <p>{project.student} <span>·</span> {project.category} <span>·</span> {project.members} members</p>
                {!compact && project.reviewEstimate && <div className="project-card__meta"><span>◷ {project.reviewEstimate} review</span></div>}
            </div>
            {project.repositoryUrl && <a className="project-card__repository" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} GitHub repository`}>GitHub ↗</a>}
            <ActionButton onClick={() => onReview(project.id)} variant={project.status === "Completed" ? "outline" : "primary"}>
                {project.status === "Completed" ? "View" : "Review"}
                <span aria-hidden="true"> →</span>
            </ActionButton>
        </article>
    );
}

export function ActivityList() {
    return (
        <div className="activity-list">
            {activities.map((activity) => (
                <article className="activity-item" key={activity.title}>
                    <span className={`student-avatar student-avatar--${activity.color}`}>{activity.initials}</span>
                    <div><h3>{activity.title}</h3><p>{activity.detail}</p><time>{activity.time}</time></div>
                </article>
            ))}
        </div>
    );
}
