import { rubric } from "../data/dashboardData";
import { ActionButton, SectionHeading } from "../components/shared";

function RubricsPage({ onChangePage, onNotify }) {
    return (
        <>
            <SectionHeading eyebrow="EVALUATION TOOLS" title="Review rubrics" description="Consistent criteria to help students get clear, constructive feedback." action={<ActionButton onClick={() => onNotify("A new rubric draft has been created.")}>＋ <span>Create rubric</span></ActionButton>} />
            <section className="surface-card feature-card">
                <div className="card-heading"><div><h2>Software project evaluation</h2><p>Default rubric · 5 criteria · 25 total points</p></div><span className="status-pill status-pill--complete">Active</span></div>
                {rubric.map((item, index) => <article className="rubric-preview-row" key={item.key}><span className="rubric-preview-number">{index + 1}</span><div><strong>{item.title}</strong><p>{item.description}</p></div><span className="rubric-preview-points">1–5 pts</span></article>)}
                <div className="feature-footer"><ActionButton variant="outline" onClick={() => onNotify("Rubric changes saved.")}>Edit rubric</ActionButton><ActionButton onClick={() => onChangePage("Review Queue")}>Use rubric <span>→</span></ActionButton></div>
            </section>
        </>
    );
}

export default RubricsPage;
