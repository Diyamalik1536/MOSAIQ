import { ActionButton, ProjectCard, SectionHeading } from "../components/shared";

function ReviewQueuePage({ projects, activePage, queueTab, onQueueTabChange, search, onSearchChange, filteredProjects, onOpenReview, onNotify }) {
    return (
        <>
            <SectionHeading
                eyebrow="STUDENT SUBMISSIONS"
                title={activePage === "My Reviews" ? "My reviews" : "Review queue"}
                description={activePage === "My Reviews" ? "A record of evaluations you’ve completed." : "Review and evaluate your students’ project submissions."}
                action={<ActionButton variant="outline" onClick={() => onNotify("Your review queue is up to date.")}>↻ <span>Refresh</span></ActionButton>}
            />
            <section className="surface-card queue-card">
                <div className="queue-toolbar">
                    <div className="tabs" role="tablist" aria-label="Filter reviews">
                        {["All", "Pending", "Completed"].map((tab) => (
                            <button key={tab} role="tab" aria-selected={queueTab === tab} className={`tab${queueTab === tab ? " tab--active" : ""}`} onClick={() => onQueueTabChange(tab)}>
                                {tab}<span>{tab === "All" ? projects.length : projects.filter((project) => project.status === tab).length}</span>
                            </button>
                        ))}
                    </div>
                    <label className="queue-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search projects or students" /><kbd>/</kbd></label>
                </div>
                <div className="queue-list">
                    {filteredProjects.map((project) => <ProjectCard key={project.id} project={project} onReview={onOpenReview} />)}
                    {filteredProjects.length === 0 && (
                        <div className="empty-state"><span>⌕</span><h3>No matching reviews</h3><p>Try another search or status filter.</p><button className="text-button" onClick={() => { onSearchChange(""); onQueueTabChange("All"); }}>Clear filters</button></div>
                    )}
                </div>
            </section>
        </>
    );
}

export default ReviewQueuePage;
