import { reportTypes } from "../data/dashboardData";
import { exportReviewReport } from "../utils/exportReviewReport";
import { ActionButton, SectionHeading } from "../components/shared";

function ReportsPage({ projects }) {
    const downloadReport = () => exportReviewReport(projects);

    return (
        <>
            <SectionHeading eyebrow="EXPORTS & SUMMARIES" title="Reports" description="Download clear summaries of your review and student project activity." action={<ActionButton onClick={downloadReport}>↓ <span>Export review report</span></ActionButton>} />
            <section className="surface-card feature-card">
                <div className="card-heading"><div><h2>Available reports</h2><p>Choose a report to export</p></div></div>
                {reportTypes.map(([title, description, count]) => <article className="feature-row report-row" key={title}><span className="report-icon">▤</span><div><strong>{title}</strong><p>{description}</p></div><span className="report-count">{count}</span><ActionButton variant="outline" onClick={downloadReport}>Download</ActionButton></article>)}
            </section>
        </>
    );
}

export default ReportsPage;
