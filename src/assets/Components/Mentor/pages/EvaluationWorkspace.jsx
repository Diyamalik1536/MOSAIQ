import EvidenceBrief from "../components/EvidenceBrief";
import EvaluationRubric from "../components/EvaluationRubric";
import ProjectOverview from "../components/ProjectOverview";
import { SectionHeading } from "../components/shared";

function EvaluationWorkspace({ project, ratings, onRatingsChange, feedback, onFeedbackChange, onBack, onNotify, onSaveDraft, onSubmit }) {
    return (
        <>
            <button className="back-link" onClick={onBack}>← <span>Back to review queue</span></button>
            <SectionHeading
                eyebrow={`${project.category.toUpperCase()} · ${project.version}`}
                title={project.title}
                description={`Project evaluation · Submitted by ${project.student}`}
                action={<span className="status-pill status-pill--review">● {project.status === "Completed" ? "Reviewed" : "Changes detected"}</span>}
            />
            <EvidenceBrief key={project.id} project={project} onNotify={onNotify} />
            <div className="evaluation-layout">
                <ProjectOverview project={project} onNotify={onNotify} />
                <EvaluationRubric
                    ratings={ratings}
                    onRatingsChange={onRatingsChange}
                    feedback={feedback}
                    onFeedbackChange={onFeedbackChange}
                    onSaveDraft={onSaveDraft}
                    onSubmit={onSubmit}
                />
            </div>
        </>
    );
}

export default EvaluationWorkspace;
