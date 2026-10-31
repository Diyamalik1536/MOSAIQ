import { messages, messageTimes } from "../data/dashboardData";
import { ActionButton, SectionHeading } from "../components/shared";

function MessagesPage({ projects, messageDraft, onMessageChange, onNotify }) {
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!messageDraft.trim()) return;
        onNotify("Your message was sent.");
        onMessageChange("");
    };

    return (
        <>
            <SectionHeading eyebrow="STAY CONNECTED" title="Messages" description="Conversations and updates from your students." action={<ActionButton onClick={() => onNotify("New message composer opened.")}>＋ <span>New message</span></ActionButton>} />
            <section className="surface-card feature-card">
                <div className="card-heading"><div><h2>Recent conversations</h2><p>Messages from your mentees</p></div><span className="status-pill status-pill--review">2 unread</span></div>
                {projects.slice(0, 3).map((project, index) => <article className="feature-row" key={project.id}><span className={`student-avatar student-avatar--${project.color}`}>{project.initials}</span><div><strong>{project.student}</strong><p>{messages[index]}</p></div><time>{messageTimes[index]}</time></article>)}
                <form className="message-compose" onSubmit={handleSubmit}>
                    <label className="sr-only" htmlFor="message-draft">Write a message</label>
                    <input id="message-draft" value={messageDraft} onChange={(event) => onMessageChange(event.target.value)} placeholder="Write a message to your students…" />
                    <ActionButton type="submit">Send <span aria-hidden="true">→</span></ActionButton>
                </form>
            </section>
        </>
    );
}

export default MessagesPage;
