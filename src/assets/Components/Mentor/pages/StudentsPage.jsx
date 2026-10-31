import { ActionButton, SectionHeading } from "../components/shared";

function StudentsPage({ projects, search, onSearchChange, onOpenReview, onNotify }) {
    const students = [...new Map(projects.map((project) => [project.student, project])).values()]
        .filter((project) => project.student.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <SectionHeading eyebrow="MENTEE DIRECTORY" title="Students" description="Keep track of your students and the projects they’re working on." action={<ActionButton onClick={() => onNotify("Invite link copied to clipboard.")}>＋ <span>Invite student</span></ActionButton>} />
            <section className="surface-card queue-card">
                <div className="queue-toolbar">
                    <div><h2 className="toolbar-title">Your students <span className="count-badge">24</span></h2><p className="toolbar-subtitle">Students assigned to your mentorship</p></div>
                    <label className="queue-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search students" /><kbd>/</kbd></label>
                </div>
                <div className="student-table">
                    {students.map((project) => (
                        <div className="student-row" key={project.id}>
                            <span className={`student-avatar student-avatar--${project.color}`}>{project.initials}</span>
                            <div><strong>{project.student}</strong><small>{project.category} · {project.members} team members</small></div>
                            <span className={`status-pill ${project.status === "Completed" ? "status-pill--complete" : "status-pill--review"}`}>{project.status}</span>
                            <button className="text-button" onClick={() => onOpenReview(project.id)}>View project →</button>
                        </div>
                    ))}
                    {students.length === 0 && <div className="empty-state"><h3>No students found</h3><p>Try searching for another name.</p></div>}
                </div>
            </section>
        </>
    );
}

export default StudentsPage;
