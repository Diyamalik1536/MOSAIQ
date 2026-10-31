import { copilotSuggestion, rubric } from "../data/dashboardData";
import { ActionButton } from "./shared";

function EvaluationRubric({ ratings, onRatingsChange, feedback, onFeedbackChange, onSaveDraft, onSubmit }) {
    const total = Object.values(ratings).reduce((sum, value) => sum + value, 0);
    const suggestedTotal = Object.values(copilotSuggestion.ratings).reduce((sum, value) => sum + value, 0);

    const applySuggestion = () => {
        onRatingsChange(copilotSuggestion.ratings);
        onFeedbackChange((current) => current ? `${current}\n\n${copilotSuggestion.feedback}` : copilotSuggestion.feedback);
    };

    return (
        <section className="surface-card rubric-card">
            <div className="card-heading"><div><h2>Evaluation rubric</h2><p>Score each area from 1 to 5</p></div><span className="rubric-total">{total}<small>/25</small></span></div>
            <div className="copilot-panel">
                <div className="copilot-heading"><span className="copilot-icon">✦</span><div><strong>Rubric co-pilot</strong><span>Illustrative suggestions · mentor reviews and decides</span></div><span className="copilot-sample">DEMO</span></div>
                <p>{copilotSuggestion.feedback}</p>
                <div className="copilot-actions"><span>Suggested total <strong>{suggestedTotal}/25</strong></span><ActionButton variant="outline" onClick={applySuggestion}>Use suggestion</ActionButton></div>
            </div>
            <div className="rubric-list">
                {rubric.map((item, index) => (
                    <div className="rubric-item" key={item.key}>
                        <div className="rubric-item__heading"><span>{index + 1}.</span><div><strong>{item.title}</strong><p>{item.description}</p></div></div>
                        <div className="rating-control" role="group" aria-label={`${item.title} rating`}>
                            {[1, 2, 3, 4, 5].map((score) => (
                                <button key={score} className={ratings[item.key] === score ? "rating-button rating-button--selected" : "rating-button"} aria-pressed={ratings[item.key] === score} onClick={() => onRatingsChange((current) => ({ ...current, [item.key]: score }))}>{score}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <label className="feedback-label" htmlFor="mentor-feedback">Overall feedback</label>
            <textarea id="mentor-feedback" value={feedback} onChange={(event) => onFeedbackChange(event.target.value)} placeholder="Share specific, constructive feedback with the student…" rows="4" />
            <label className="recommend-check"><input type="checkbox" defaultChecked /> <span>Recommend for showcase</span></label>
            <div className="evaluation-actions"><ActionButton variant="outline" onClick={onSaveDraft}>Save draft</ActionButton><ActionButton onClick={onSubmit}>Submit evaluation <span aria-hidden="true">→</span></ActionButton></div>
        </section>
    );
}

export default EvaluationRubric;
