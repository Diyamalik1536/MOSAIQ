import { ActionButton, ProjectMark, SectionHeading } from "../components/shared";

function TeamsPage({ projects, onOpenReview, onNotify }) {
    return (
        <>
            <SectionHeading eyebrow="COLLABORATION" title="Project teams" description="Teams collaborating on projects under your mentorship." action={<ActionButton onClick={() => onNotify("Team invitation link copied.")}>＋ <span>Invite team</span></ActionButton>} />
            <section className="surface-card feature-card">
                <div className="card-heading"><div><h2>Your teams</h2><p>Student project groups and their latest submissions</p></div></div>
                {projects.map((project) => <article className="feature-row" key={project.id}><ProjectMark color={project.color} compact /><div><strong>{project.title}</strong><p>{project.student} and {project.members - 1} teammates · {project.category}</p></div><span className={`status-pill ${project.status === "Completed" ? "status-pill--complete" : "status-pill--review"}`}>{project.status}</span><ActionButton variant="outline" onClick={() => onOpenReview(project.id)}>Open</ActionButton></article>)}
            </section>
        </>
    );
}

export default TeamsPage;
