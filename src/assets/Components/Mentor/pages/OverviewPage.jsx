import { ActivityList, ActionButton, MetricCard, ProjectCard, SectionHeading } from "../components/shared";

function OverviewPage({ today, projects, onChangePage, onOpenReview, onNotify }) {
    const pendingProjects = projects.filter((project) => project.status === "Pending");
    const todayLabel = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(today);

    return (
        <>
            <SectionHeading
                eyebrow={new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(today).toUpperCase()}
                title="Good morning, Dr. Sharma"
                description="Here’s what needs your attention today."
                action={<span className="today-chip">◷ <span>Today, {todayLabel}</span></span>}
            />
            <section className="metrics-grid" aria-label="Review overview">
                <MetricCard icon="▤" label="Pending reviews" value={pendingProjects.length} detail="Awaiting mentor review" tone="coral" />
                <MetricCard icon="✓" label="Completed this month" value="38" detail="+12 from last month" tone="green" />
                <MetricCard icon="◷" label="On-time reviews" value="94%" detail="12% vs last month" tone="purple" />
                <MetricCard icon="★" label="Average rating given" value="4.7" detail="Based on 62 reviews" tone="amber" />
            </section>
            <div className="home-grid">
                <section className="surface-card submissions-card">
                    <div className="card-heading"><div><h2>Submissions to review</h2><p>Student projects awaiting your feedback</p></div><button className="text-button" onClick={() => onChangePage("Review Queue")}>View all <span aria-hidden="true">→</span></button></div>
                    <div className="project-list">{pendingProjects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} onReview={onOpenReview} />)}</div>
                </section>
                <section className="surface-card activity-card">
                    <div className="card-heading"><div><h2>Recent activity</h2><p>Latest updates from your students</p></div><button className="icon-button" aria-label="More activity options" onClick={() => onNotify("You’re viewing the latest activity.")}>···</button></div>
                    <ActivityList />
                </section>
            </div>
            <section className="focus-banner">
                <div className="focus-banner__icon">✦</div>
                <div><strong>You’re making great progress!</strong><p>You’ve completed 38 reviews this month. Keep it up!</p></div>
                <ActionButton variant="outline" onClick={() => onChangePage("Analytics")}>View insights</ActionButton>
            </section>
        </>
    );
}

export default OverviewPage;
