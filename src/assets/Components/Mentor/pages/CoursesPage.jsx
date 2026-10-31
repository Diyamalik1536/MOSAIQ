import { ActionButton, ProjectCard, SectionHeading } from "../components/shared";

function CoursesPage({ projects, onChangePage, onOpenReview, onNotify }) {
    return (
        <>
            <SectionHeading eyebrow="TEACHING SPACE" title="Courses & projects" description="Manage your courses and follow student project progress." action={<ActionButton onClick={() => onNotify("Course creation is ready in this prototype.")}>＋ <span>New course</span></ActionButton>} />
            <section className="surface-card course-card">
                <div className="course-card__cover"><span>FALL 2025 · COMPUTER SCIENCE</span><strong>Software Engineering</strong><small>CS302 · Semester course</small></div>
                <div className="course-card__content">
                    <div className="course-facts"><div><strong>42</strong><span>Students</span></div><div><strong>{projects.length}</strong><span>Projects</span></div><div><strong>{projects.filter((project) => project.status === "Pending").length}</strong><span>Pending reviews</span></div></div>
                    <div className="course-actions"><ActionButton variant="outline" onClick={() => onChangePage("Students")}>View students</ActionButton><ActionButton onClick={() => onChangePage("Review Queue")}>Open course <span>→</span></ActionButton></div>
                </div>
            </section>
            <section className="surface-card queue-card course-projects">
                <div className="card-heading"><div><h2>Recent project submissions</h2><p>Latest work from this course</p></div><button className="text-button" onClick={() => onChangePage("Review Queue")}>All submissions →</button></div>
                <div className="project-list">{projects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} onReview={onOpenReview} compact />)}</div>
            </section>
        </>
    );
}

export default CoursesPage;
