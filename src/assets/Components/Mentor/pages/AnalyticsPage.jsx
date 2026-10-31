import { analyticsMetrics, chartMonths, chartValues, skillDistribution } from "../data/dashboardData";
import { MetricCard, SectionHeading } from "../components/shared";

function AnalyticsPage({ activePage, onNotify }) {
    const isSkillInsights = activePage === "Skill Insights";

    return (
        <>
            <SectionHeading
                eyebrow={isSkillInsights ? "STUDENT DEVELOPMENT" : "YOUR IMPACT"}
                title={isSkillInsights ? "Skill insights" : "Analytics & insights"}
                description={isSkillInsights ? "Explore the skills your students are building through their projects." : "A snapshot of your students’ progress and review activity."}
                action={<button className="select-button" onClick={() => onNotify("Showing data for this semester.")}>This semester⌄</button>}
            />
            <section className="metrics-grid">
                {analyticsMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </section>
            <div className="home-grid analytics-grid">
                <section className="surface-card chart-card">
                    <div className="card-heading"><div><h2>Review activity</h2><p>Evaluations completed this semester</p></div><span className="chart-legend"><i></i> Evaluations</span></div>
                    <div className="bar-chart" aria-label="Review activity chart">
                        {chartValues.map((height, index) => <div key={chartMonths[index]} className="bar-chart__item"><span style={{ height: `${height}%` }}></span><small>{chartMonths[index]}</small></div>)}
                    </div>
                </section>
                <section className="surface-card chart-card">
                    <div className="card-heading"><div><h2>Skill distribution</h2><p>By student project focus</p></div></div>
                    <div className="skill-list">
                        {skillDistribution.map(([label, width]) => <div className="skill-item" key={label}><div><span>{label}</span><strong>{width}%</strong></div><div className="progress-track"><span style={{ width: `${width}%` }}></span></div></div>)}
                    </div>
                </section>
            </div>
        </>
    );
}

export default AnalyticsPage;
